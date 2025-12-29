import {ISetReaderDisplayRequest, Location, Reader} from '@stripe/terminal-js';
import {ErrorResponse, ISdkManagedPaymentIntent} from '@stripe/terminal-js/types/terminal';
import {environment} from '../../../environments/environment';
import ApiClient, {isErrorResponse, TerminalLocationRequest, TerminalReaderRequest} from './api-client';
import TerminalClient from './terminal-client';
import Stripe from 'stripe';
import {ICart, ILineItem} from '@stripe/terminal-js/types/proto';

// tslint:disable-next-line:triple-equals
// export const isPaymentIntent = (x: any): x is Stripe.PaymentIntent => x.object != undefined && x.object === 'payment_intent';

export interface IZaborCartInfo extends ICart {
    summary: string;
}

export interface IZaborCartItem extends ILineItem {
    pricePerItem: number;
    amountText: string;
    name?: string;
    attribute?: string;
}

export const isLocation = (x: any): x is Location => x.object != null && x.object === 'terminal.location';

export class PaymentsManager {
    private static captureMethod: Stripe.PaymentIntentCreateParams.CaptureMethod = 'manual';
    private static paymentMethodTypes = ["card_present"];

    private readonly client: ApiClient;
    public terminalClient: TerminalClient;
    private _discoveredReaders: Reader[];
    private discoveryWasCancelled = false;
    private usingSimulator = false;
    private currentReader: Reader | undefined;
    private pendingPaymentIntentSecret: string | null;
    private listLocations: Location[];
    private cancelablePayment = false;
    private cancelableRefund = false;
    private successfulPaymentIntentInTransition: ISdkManagedPaymentIntent;
    private pendingPaymentIntentId: string | null;


    constructor() {
        this.client = new ApiClient(`${environment.apiUrl}/pmt`);
        this.terminalClient = new TerminalClient(this.client);
        this.pendingPaymentIntentSecret = null;
        this.pendingPaymentIntentId = null;
    }

    get discoveredReaders(): Reader[] {
        return this._discoveredReaders;
    }

    public async discoverReaders(locationId: string, doSimulate = false) {
        console.log("locationId",locationId);
        // 2a. Discover registered readers to connect to.
        const discoverResult = await this.terminalClient.discoverReaders(doSimulate, locationId);

        //this.terminalClient.setSecret("pk_live_51LJNuQJIWoRaw7nsasLgNCuSKS4tRCA1UcOMbLcKIBNsFT8V4flXaddZQbaGjG9Eyx728zQqkPyVohdockyBL63A00vqz2tXs5");

        console.log('secret', this.terminalClient.connectionTokenSecret);

        if (isErrorResponse(discoverResult)) {
            console.error("Failed to discover: ", discoverResult.error);
            return { success: false, error: discoverResult.error, reason: null };
        } else {
            if (this.discoveryWasCancelled) {
                this.discoveryWasCancelled = false;
                return { success: false, error: null, reason: 'Cancelled' };
            }
            this._discoveredReaders = discoverResult.discoveredReaders;
            console.log('discoverResult', this._discoveredReaders);
            return { success: true, error: null, reason: null };
        }
    }

    public cancelReadersDiscovery = () => {
        this.discoveryWasCancelled = true;
        console.log('set to cancel discovery');
    }

    public connectToReader = async (selectedReader: Reader) => {
        // 2b. Connect to a discovered reader.
        const connectResult = await this.terminalClient.connectReader(selectedReader);
        if (isErrorResponse(connectResult)) {
            console.error("Failed to connect:", connectResult.error);
        } else {
            this.usingSimulator = selectedReader.id === "SIMULATOR";
            this.currentReader = connectResult.reader;
            this._discoveredReaders = [];
        }
        return connectResult;
    }

    disconnectReader = async () => {
        // 2c. Disconnect from the reader, in case the user wants to switch readers.
        await this.terminalClient.disconnectReader();
        this.currentReader = null;
    }

    updateStripeLocation(dataToPost: TerminalLocationRequest) {
        return new Promise<{message: string, location: Location}>(async (resolve, reject) => {
            const response = await this.client.updateStripeLocation(dataToPost);
            const locationUpdated = response.data;
            resolve({message: 'Location update success', location: locationUpdated});
        });
    }

    registerStripeLocation(dataToPost: TerminalLocationRequest) {
        return new Promise<{message: string, location: Location}>(async (resolve, reject) => {
            const response = await this.client.registerStripeLocation(dataToPost);
            const locationCreated = response.data;
            resolve({message: 'Location register success', location: locationCreated});
        });
    }

    registerStripeTerminal(dataToPost: TerminalReaderRequest) {
        return new Promise<{message: string, reader: Reader}>(async (resolve, reject) => {
            const response = await this.client.registerStripeTerminal(dataToPost);
            this.currentReader = response.data;
            resolve({message: 'Reader register success', reader: this.currentReader});
        });
    }

    matchedCurrentReaderId(readerId: string) {
        return this.currentReader != null && this.currentReader.id != null && this.currentReader.id.length > 0 && this.currentReader.id === readerId;
    }

    reconnectCurrentReader() {
        if (this.currentReader != null) {
            const tempReader = JSON.parse(JSON.stringify(this.currentReader));
            this.currentReader = null;
            this.terminalClient.disconnectReader().then(() => {
                this.connectToReader(tempReader);
            });
        }
    }

    collectCardPayment = async ({cartInfo, cartItems, paymentMethod, cardNumber}: { cartInfo: IZaborCartInfo; cartItems: IZaborCartItem[]; paymentMethod: string; cardNumber: string }) => {
        const locationIdString: string = isLocation(this.currentReader.location) ? this.currentReader.location.id : this.currentReader.location;
        // 3b. Collect a card present payment
        // We want to reuse the same PaymentIntent object in the case of declined charges, so we
        // store the pending PaymentIntent's secret until the payment is complete.
        if (this.pendingPaymentIntentSecret == null) {
            try {
                if (cartInfo.currency === "cad") {
                    PaymentsManager.paymentMethodTypes.push("interac_present");
                }
                // tslint:disable-next-line:max-line-length
                const createIntentResponse = await this.client.createPaymentIntent({ currentLocationId: locationIdString, currentReaderId: this.currentReader.id, amount: cartInfo.total, currency: cartInfo.currency, description: cartInfo.summary, captureMethod: PaymentsManager.captureMethod, paymentMethodTypes: PaymentsManager.paymentMethodTypes });
                this.pendingPaymentIntentId = createIntentResponse.data.id;
                this.pendingPaymentIntentSecret = createIntentResponse.data.client_secret;
            } catch (e) {
                // Suppress backend errors since they will be shown in logs
                return false;
            }
        }
        // Read a card from the customer
        if (this.usingSimulator) {
            this.terminalClient.setSimulatorConfiguration({testPaymentMethod: paymentMethod, testCardNumber: cardNumber});
        }
        const paymentMethodPromise = this.terminalClient.collectPaymentMethod(this.pendingPaymentIntentSecret);
        this.cancelablePayment = true;
        const result = await paymentMethodPromise;
        if (isErrorResponse(result)) {
            console.log("Collect payment method failed:", result.error.message);
        } else {
            this.successfulPaymentIntentInTransition = result.paymentIntent;
            const cartToDisplay: ISetReaderDisplayRequest = {
                type: 'cart',
                cart: {
                    // line_items: [
                    //     {description: 'Caramel latte', amount: 659, quantity: 1},
                    //     {description: 'Dozen donuts', amount: 1239, quantity: 1},
                    // ],
                    line_items: cartItems.map(item => ({description: item.description, amount: item.amount, quantity: item.quantity})),
                    currency: cartInfo.currency,
                    tax: cartInfo.tax,
                    total: cartInfo.total,
                },
            };
            await this.terminalClient.setReaderDisplay(cartToDisplay);
            return true;
        }
        return false;
    }

    cancelReaderAction = async () => {
        const locationIdString: string = isLocation(this.currentReader.location) ? this.currentReader.location.id : this.currentReader.location;
        // tslint:disable-next-line:max-line-length
        const captureResult = await this.client.cancelReaderAction({currentLocationId: locationIdString, currentReaderId: this.currentReader.id, paymentIntentId: this.pendingPaymentIntentId, captureMethod: PaymentsManager.captureMethod, paymentMethodTypes: PaymentsManager.paymentMethodTypes});
        console.log("Current action cancelled!");
        await this.terminalClient.clearReaderDisplay();
        return captureResult;
    }

    cancelPendingPayment = async () => {
        // await this.terminalClient.cancelCollectPaymentMethod();
        // await this.terminalClient.cancelCollectSetupIntentPaymentMethod();
        const locationIdString: string = isLocation(this.currentReader.location) ? this.currentReader.location.id : this.currentReader.location;
        // tslint:disable-next-line:max-line-length
        const captureResult = await this.client.cancelPaymentIntent({currentLocationId: locationIdString, currentReaderId: this.currentReader.id, paymentIntentId: this.pendingPaymentIntentId, captureMethod: PaymentsManager.captureMethod, paymentMethodTypes: PaymentsManager.paymentMethodTypes});
        this.pendingPaymentIntentSecret = null;
        this.cancelablePayment = false;
        console.log("Payment cancelled!");
        return captureResult;
    }

    processPayment = async () => {
        const locationIdString: string = isLocation(this.currentReader.location) ? this.currentReader.location.id : this.currentReader.location;
        const processResult = await this.terminalClient.processPayment(this.successfulPaymentIntentInTransition);
        // At this stage, the payment can no longer be canceled because we've sent the request to the network.
        this.cancelablePayment = false;
        if (isErrorResponse(processResult)) {
            return `Payment processing failed: ${processResult.error.message}`;
        }
        if (processResult.paymentIntent) {
            if (processResult.paymentIntent.status !== "succeeded") {
                try {
                    // Capture the PaymentIntent from your backend client and mark the payment as complete
                    // tslint:disable-next-line:max-line-length
                    const captureResult = await this.client.capturePaymentIntent({currentLocationId: locationIdString, currentReaderId: this.currentReader.id, paymentIntentId: processResult.paymentIntent.id, captureMethod: PaymentsManager.captureMethod, paymentMethodTypes: PaymentsManager.paymentMethodTypes});
                    this.pendingPaymentIntentSecret = null;
                    console.log("Payment Successful!");
                    await this.terminalClient.clearReaderDisplay();
                    return captureResult;
                } catch (e) {
                    // Suppress backend errors since they will be shown in logs
                    return `Payment processing failed: ${e.message}`;
                }
            } else {
                this.pendingPaymentIntentSecret = null;
                console.log("Single-message payment successful!");
                await this.terminalClient.clearReaderDisplay();
                return processResult;
            }
        }
      return `Invalid payment processing execution`;
    }

    async getLocations() {
        return await this.client.listLocations();
    }

    async getAccounts() {
        return await this.client.listAccounts();
    }

    async deleteLocation(locationId) {
        return await this.client.deleteLocation(locationId);
    }

}
