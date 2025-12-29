import { IPaymentMethodReadReusableResponse, Location, Reader } from "@stripe/terminal-js";
import { ErrorResponse } from "@stripe/terminal-js/types/terminal";
import {map} from 'rxjs/operators';
import {HttpHeaders} from '@angular/common/http';
import Stripe from 'stripe';

interface IResponseFormat<T> {
    success: boolean;
    errorCode?: string;
    data: T;
}

export interface DeviceRegisterRequest {
    label: string;
    registrationCode: string;
    location: string;
}

export interface ConnectionTokenCreateResponse {
    secret: string;
}

export interface PaymentIntentOperationResponse {
    intent: string;
    secret: string;
}

export interface PaymentIntent {
    amount: number;
    currency: string;
    description: string;
    captureMethod: Stripe.PaymentIntentCreateParams.CaptureMethod;
    paymentMethodTypes: string[];
    loggedInUser_Id?: number;
    currentLocationId: string;
    currentReaderId: string;
}

// tslint:disable-next-line:no-empty-interface
export interface PaymentIntentCreateResponse extends PaymentIntentOperationResponse {
    object?: 'payment_intent_operation_response';
}

export interface PaymentIntentRelatedRequest {
    paymentIntentId: string;
    captureMethod: Stripe.PaymentIntentCreateParams.CaptureMethod;
    paymentMethodTypes: string[];
    loggedInUser_Id?: number;
}

export interface PaymentIntentCaptureRequest extends PaymentIntentRelatedRequest {
    currentLocationId: string;
    currentReaderId: string;
    object?: 'payment_intent_capture_request';
}

export interface PaymentIntentCancelRequest extends PaymentIntentRelatedRequest {
    currentLocationId: string;
    currentReaderId: string;
    object?: 'payment_intent_cancel_request';
}

export interface ReaderActionCancelRequest extends PaymentIntentRelatedRequest {
    currentLocationId: string;
    currentReaderId: string;
    object?: 'reader_action_cancel_request';
}

// tslint:disable-next-line:no-empty-interface
export interface PaymentIntentCaptureResponse extends PaymentIntentOperationResponse {
    object?: 'payment_intent_capture_response';
}

export interface PaymentMethodToCustomerSaveRequest {
    paymentMethodId: string;
}

export interface TerminalLocationRequest {
    display_name: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
    loggedInUser_Id?: number;
    locationId?: string;
}

export interface TerminalReaderRequest {
    registration_code: string;
    label: string;
    is_simulated: boolean;
    loggedInUser_Id?: number;
}

// tslint:disable-next-line:triple-equals
export const isErrorResponse = (x: any): x is ErrorResponse => x.error != undefined;

// tslint:disable-next-line:triple-equals
export const isPaymentIntentCaptureResponse = (x: any): x is PaymentIntentCaptureResponse => x.object != undefined && x.object === 'payment_intent_capture_response';

export interface ICustomerAddress {
    country: string;
    city: string;
    state?: string;
    line1: string;
    line2?: string;
    postal_code?: string;
}

export interface CardPaymentIntentCreateRequest {
    email: string;
    // items: Order;
    amount: number;
    currency: string;
    payment_method_types: string[];
    request_three_d_secure: 'any' | 'automatic';
    client?: 'ios' | 'android';
    automaticGpayApay: boolean;
    description: string;
    address: ICustomerAddress;
    phone?: string;
    name: string;
    loggedInUser_Id?: number;
}

export interface CardPaymentIntentCreateResponse {
    id: string;
    clientSecret: string;
}


interface ResponseInfo {
    ok: boolean;
    status: number;
    statusText: string;
    type: string;
    url: string;
    bodyUsed: boolean;
}

const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    })
};

export default class ApiClient {

    apiUrl: string;

    constructor(url: string) {
        this.apiUrl = url;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const {ok, status, statusText, type, url, bodyUsed}: ResponseInfo = response;
        const responseInfo: ResponseInfo = {ok, status, statusText, type, url, bodyUsed};
        console.log(url, status);
        console.log('response', responseInfo);
        if (response.ok) {
            return response.json();
            // const returnVal: IResponseFormat = {
            //     success: true,
            //     data: await response.json()
            // };
            // const responseJson = response.json();
            // console.log('responseJson', responseJson);
            // return responseJson;
        } else {
            const text = await response.text();
            throw new Error("Request Failed: " + text);
        }
    }

    private async doGet<T>(apiPath): Promise<T> {
        const response = await fetch(this.apiUrl + apiPath, { method: "get" });
        return this.handleResponse<T>(response);
    }

    private async doPost<T>(apiPath, body?): Promise<T> {
        const requestOptions: RequestInit = {
            method: 'POST',
            // mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        };
        if (body != null) {
            if (typeof body === 'string' /* || body instanceof FormData*/) {
                requestOptions['body'] = body;
            } else {
                requestOptions['body'] = JSON.stringify(body);
            }
        }
        const response = await fetch(this.apiUrl + apiPath, requestOptions);
        return this.handleResponse<T>(response);
    }


    // Google/Apple Pay METHODS below

    async createCardPaymentIntent(data: CardPaymentIntentCreateRequest) {
        // console.log('data', data);
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        const response = await this.doPost<IResponseFormat<CardPaymentIntentCreateResponse>>("/create-card-payment-intent", data);
        // console.log('response', response);
        return { secret: response.data.clientSecret, paymentIntentId: response.data.id };
    }



    // TERMINAL METHODS below

    async createConnectionToken() {
        const response = await this.doPost<IResponseFormat<ConnectionTokenCreateResponse>>("/terminal-connection-token");
        // console.log('response-data', response.data);
        return { secret: response.data.secret };
    }

    updateStripeLocation(data: TerminalLocationRequest) {
        console.log('data', data);
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        return this.doPost<IResponseFormat<Location>>("/update-location", data);
    }

    registerStripeLocation(data: TerminalLocationRequest) {
        console.log('data', data);
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        return this.doPost<IResponseFormat<Location>>("/register-location", data);
    }

    registerStripeTerminal(data: TerminalReaderRequest) {
        console.log('data', data);
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        return this.doPost<IResponseFormat<Reader>>("/register-terminal", data);
    }

    // registerDevice({ label, registrationCode, location }: DeviceRegisterRequest) {
    //     const formData = new URLSearchParams();
    //     formData.append("label", label);
    //     formData.append("registration_code", registrationCode);
    //     formData.append("location", location);
    //     return this.doPost<Reader>("/register_reader", formData);
    // }

    // public createPaymentIntent({ amount, currency, description, captureMethod, paymentMethodTypes }: PaymentIntent) {
    //     const formData = new URLSearchParams();
    //     formData.append("loggedInUser_Id", localStorage.getItem("currentUserId"));
    //     formData.append("amount", amount.toString());
    //     formData.append("currency", currency);
    //     formData.append("description", description);
    //     formData.append("captureMethod", captureMethod);
    //     paymentMethodTypes.forEach((type) => formData.append(`paymentMethodTypes[]`, type));
    //     return this.doPost<PaymentIntentCreateResponse>("/create-payment", formData);
    // }

    public createPaymentIntent(data: PaymentIntent) {
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        // return this.doPost<PaymentIntentCreateResponse>("/create-payment", data);
        return this.doPost<IResponseFormat<Stripe.PaymentIntent>>("/create-terminal-payment-intent", data);
    }

    // public capturePaymentIntent({ paymentIntentId, captureMethod, paymentMethodTypes }: PaymentIntentCaptureRequest) {
    //     const formData = new URLSearchParams();
    //     formData.append("loggedInUser_Id", localStorage.getItem("currentUserId"));
    //     formData.append("paymentIntentId", paymentIntentId);
    //     formData.append("captureMethod", captureMethod);
    //     paymentMethodTypes.forEach((type) => formData.append(`paymentMethodTypes[]`, type));
    //     return this.doPost<PaymentIntentCaptureResponse>("/capture-payment-intent", formData);
    // }

    public capturePaymentIntent(data: PaymentIntentCaptureRequest) {
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        return this.doPost<IResponseFormat<PaymentIntentCaptureResponse>>("/capture-terminal-payment-intent", data);
    }

    // public savePaymentMethodToCustomer({ paymentMethodId }: PaymentMethodToCustomerSaveRequest) {
    //     const formData = new URLSearchParams();
    //     formData.append("payment_method_id", paymentMethodId);
    //     // return this.doPost<PaymentMethod>("/attach_payment_method_to_customer", formData);
    //     return this.doPost<IPaymentMethodReadReusableResponse>("/attach_payment_method_to_customer", formData);
    // }

    public async listLocations() {
        return this.doGet<IResponseFormat<Location[]>>("/locations-list");
    }

    public async listAccounts() {
        return this.doGet<IResponseFormat<Location[]>>("/accounts-list");
    }

    

    public async deleteLocation(locationId: string) {
        return this.doPost<IResponseFormat<Location>>("/delete-location", { locationId });
    }

    async cancelReaderAction(data: ReaderActionCancelRequest) {
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        return this.doPost<IResponseFormat<PaymentIntentCaptureResponse>>("/cancel-reader-action", data);
    }

    async cancelPaymentIntent(data: PaymentIntentCancelRequest) {
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        return this.doPost<IResponseFormat<PaymentIntentCaptureResponse>>("/cancel-terminal-payment-intent", data);
    }

}
