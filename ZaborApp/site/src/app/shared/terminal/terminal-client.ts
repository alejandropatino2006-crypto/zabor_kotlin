import { ISetReaderDisplayRequest, loadStripeTerminal, Reader, Terminal } from "@stripe/terminal-js";
import { ISdkManagedPaymentIntent, PaymentIntentClientSecret, RefundOptions } from "@stripe/terminal-js/types/terminal";
import ApiClient from './api-client';

export interface RefundPaymentMethodRequest {
    refundedChargeID: string;
    refundedAmount: number;
    currency: string;
    options?: RefundOptions;
}

export default class TerminalClient {

    private _paymentStatus: string;
    private _connectionStatus: string;
    private _connectionTokenSecret: string;
    terminal: Terminal;

    constructor(client: ApiClient) {
        this.init(client);
    }

    get connectionTokenSecret(): string {
        return this._connectionTokenSecret;
    }

    get currentConnectionStatus(): string {
        return this._connectionStatus;
    }

    get currentPaymentStatus(): string {
        return this._paymentStatus;
    }

    public setSecret(secret:string) {
        this._connectionTokenSecret = secret;
    }

    private async init(client: ApiClient) {
        const StripeTerminal = await loadStripeTerminal();
        this.terminal = StripeTerminal.create({
            // 1c. Create a callback that retrieves a new ConnectionToken from the example backend
            onFetchConnectionToken: async () => {
                const connectionTokenResult = await client.createConnectionToken();
                // console.log('connectionTokenResult', connectionTokenResult);
                this._connectionTokenSecret = connectionTokenResult.secret;
                return connectionTokenResult.secret;
            },
            // 1c. (Optional) Create a callback that will be called if the reader unexpectedly disconnects.
            // You can use this callback to alert your user that the reader is no longer connected and will need to be reconnected.
            onUnexpectedReaderDisconnect: async (ev) => {
                console.log('Disconnect event =', ev);
                alert("Unexpected disconnect from the reader");
                this._connectionStatus = "not_connected";
            },
            // 1c. (Optional) Create a callback that will be called when the reader's connection status changes.
            // You can use this callback to update your UI with the reader's connection status.
            onConnectionStatusChange: async (ev) => {
                console.log('Connection status changed to ', ev.status);
                this._connectionStatus = ev.status;
            },
            onPaymentStatusChange: async (ev) => {
                console.log('Payment status changed to ', ev.status);
                this._paymentStatus = ev.status;
            }
        });
    }

    public async discoverReaders(doSimulate: boolean, locationId: string) {
        if (doSimulate) {
            return this.terminal.discoverReaders({simulated: true});
        }
        return this.terminal.discoverReaders({simulated: false, location: locationId});
    }

    public connectReader(selectedReader: Reader) {
        return this.terminal.connectReader(selectedReader);
    }

    public disconnectReader() {
        return this.terminal.disconnectReader();
    }

    public setReaderDisplay(request: ISetReaderDisplayRequest) {
        return this.terminal.setReaderDisplay(request);
    }

    public clearReaderDisplay() {
        return this.terminal.clearReaderDisplay();
    }

    public setSimulatorConfiguration({ testPaymentMethod, testCardNumber }: { testPaymentMethod: string; testCardNumber: string }) {
        return this.terminal.setSimulatorConfiguration({ testPaymentMethod, testCardNumber });
    }

    public cancelCollectSetupIntentPaymentMethod() {
        return this.terminal.cancelCollectSetupIntentPaymentMethod();
    }

    public collectPaymentMethod(pendingPaymentIntentSecret: PaymentIntentClientSecret) {
        return this.terminal.collectPaymentMethod(pendingPaymentIntentSecret, { config_override: { skip_tipping: true } });
    }

    public cancelCollectPaymentMethod() {
        return this.terminal.cancelCollectPaymentMethod();
    }

    public processPayment(request: ISdkManagedPaymentIntent) {
        return this.terminal.processPayment(request);
    }

    public readReusableCard() {
        return this.terminal.readReusableCard();
    }

    public collectRefundPaymentMethod({ refundedChargeID, refundedAmount, currency }: RefundPaymentMethodRequest) {
        return this.terminal.collectRefundPaymentMethod(refundedChargeID, refundedAmount, currency);
    }

    public processRefund() {
        return this.terminal.processRefund();
    }

    public cancelCollectRefundPaymentMethod() {
        return this.terminal.cancelCollectRefundPaymentMethod();
    }

}
