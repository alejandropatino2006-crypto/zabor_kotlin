import {Component, OnInit, ViewChild, ElementRef, Input, NgZone, Renderer2, Inject, AfterViewInit} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserService } from '../../../shared/services/frontServices/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { noOnlyWhitespaceValidator, MustMatch } from 'src/app/shared/helpers/custom.validator';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { MapsAPILoader } from '@agm/core';
import { environment } from 'src/environments/environment';
import { CreditCardValidators } from 'angular-cc-library';
import { DOCUMENT } from '@angular/common';
import ApiClient, {ICustomerAddress, TerminalLocationRequest, TerminalReaderRequest} from '../../../shared/terminal/api-client';


declare var Stripe; // : stripe.StripeStatic;

interface IUserAddress {
  id: number;
  firstname: string;
  lastname: string;
  country: string;
  phone: string;
  email: string;
  city: string;
  pincode: string;
  houseno: string;
  address: string;
  user_id: number;
  lat: number;
  lng: number;
  formattedAddress: string;
  state: string;
}

interface IUserAddressVto extends IUserAddress {
  housenoDisplay: string;
  addressDisplay: string;
  cityDisplay: string;
  stateDisplay: string;
  countryDisplay: string;
  distance: number;
}

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
  styles: [
    "agm-map { height: 300px}",
    ".address-div{width:100%}",
    ".address-div .fa {cursor:pointer}",
    ".globel-text{ color:#e4a911; cursor: pointer }",
    ".form-control{ padding: 8px; border-radius: 0; border: 1px solid #E5E5E5;}",
    ".globel-text.pull-right{font-size:14px}",
    ".stripe-sec{margin-top: 0.5rem !important;}",
    ".stripe-sec.hide{display:none}",
    ".form-control.ng-invalid{ border-left: 2px solid #ff000075 !important;}",
    ".order-table tfoot td{padding: 8px 15px; !important}",
    ".remove-dis{font-size: 0.675rem; padding: 0.15rem 0.15rem;    margin-left: 6px;}",
    "tr.less-padding td{ padding: 5px 12px; }",
    ".CardNumberField-input-wrapper > .InputContainer > input { border: 1px inset #ffbd14; }",
    ".ElementsApp .InputElement { border: 1px inset #ffbd14; }"
  ],
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  fname: string;
  lname: string;
  eaddress: string;

  // elements: Elements;
  card: any;

  userdetail: any;
  userAddress: Array<any> = [];
  addressForm: FormGroup;
  addAddress = false;
  DelieverydistanceLimit = 1000;
  showallAddress = false;
  selectedAddress: IUserAddressVto | undefined | null = null;

  cartId = -1;
  restaurantId: number;
  userId: number;
  cart: any = [];
  extras: any;
  total = 0;

  foodTax: number;
  drinkTax: number;
  convenienceFee: number;
  convenienceFeeType: number;
  convenienceFeeValue: number;
  grandTax: number;

  validCheckout = true;
  stripe: any;

  reslat = -1;
  reslng = -1;

  // delivery_mode   1 = home delivery; 2 = pick up
  // payment_mode   1 = Online; 2 = Cash on delivery

  paymentMode = "7";
  deliveryMode = "2";
  btnDisable = false;
  resAvailable = false;

  deliveryCharges = 0;
  isLoggedIn = false;
  allowCod = 0;

  Offers: Array<any> = [];
  selectOffer = -1;
  discountAmount = 0;

  tableNum = 1;

  @ViewChild("cardElement", { static: false }) cardElement: ElementRef<HTMLDivElement>;
  @ViewChild("offerComp", { static: false }) offerComp: any;
  cardErrors: any;

  restaurantName = "";
  public lat: any = -1;
  public lng: any = -1;
  public zoom: any = -1;
  public searchControl: FormControl;

  @ViewChild('search', { static: false }) public searchElementRef: ElementRef;
  FormattedAddress: string;
  minOrderValue: any;
  maxOrderValue: any;
  Anetform: FormGroup;
  amountAfterTax: any;
  deliveryObj: { delivery_charge: any; base_delivery_distance: any };

  athAcc: any;
  enableAddressInitially = true;
  enablePaymentWithoutAddress = true;
  allowGooglePayApplePay = true;
  private readonly client: ApiClient;
  // gpayapayForm: FormGroup;
  private athPaymentInterval: NodeJS.Timeout;
  allowStripePayment = true; // do not modify this line
  isStripePaymentAllowed = false; // change here t
  private userEmail: string | null = null;
  private btnDisableTimeout = 11000;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private routingRouter: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private angularFormBuilder: FormBuilder,
    public restaurantservice: RestaurantService,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private angularDoc
  ) {
    this.allowStripePayment = true;
    this.client = new ApiClient(`${environment.apiUrl}/pmt`);
  }

  async makeTransaction(paymentToken: string) {
    const securityKey = "N4NNbNZ7Vaegh5t2jq78Z3N4mWHNJ5ZH";
    const amount = (this.total - this.discountAmount).toFixed(2);
    // **Important:** Replace '<YOUR_SECURITY_KEY>' with your actual security key obtained from Transaction Gateway.
    // **Warning:** Never share your security key in code or public forums.
    const url = `https://secure.magicpaygateway.com/api/transact.php?security_key=${securityKey}&type=sale&amount=${amount}&first_name=${this.fname}&last_name=${this.lname}&email=${this.eaddress}&payment_token=${paymentToken}`;

    try {
      const response = await fetch(url, {
        method: "POST", // Assuming POST is the correct method for transactions
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Set appropriate content type if sending data in the body
        },
        // If sending data in the body, uncomment and replace with the actual data:
        // body: JSON.stringify({ /* your data here */ })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("response of payment api", response);
      const responseJson = await response.json();
      console.log("responseJson", responseJson);
      return responseJson; // Optionally return the response for further processing
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-throw the error for handling at a higher level
    }
  }

  async finishSubmit(response) {
    console.log("response from magicpay", response);
    try {
      this.spinner.hide();
      // const res = await this.makeTransaction(response.token);
      const amount = (this.total - this.discountAmount).toFixed(2);
      this.restaurantservice
        .payMagicPay(
          amount,
          this.fname,
          this.lname,
          this.eaddress,
          response.token
        )
        .subscribe((res: any) => {
          console.log("Transaction response:", res);
          this.spinner.hide();
          if (res.resMagicPay.response === 1) {
            this.placeOrder(res.resMagicPay.transactionid);
          } else {
            this.spinner.hide();
            Swal.fire(
              Swaldata.SwalErrorToast(
                "Transaction Failed :" + res.resMagicPay.responsetext
              )
            );
          }
        });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
    // const { isSubmitting, alertMessage, ...formData } = { ...this.state };
    // formData.token = response.token;
    // console.log(formData);
    // this.setState({ isSubmitting: false, alertMessage: 'The form was submitted. Check the console to see the output data.' });
  }

  delivery_modeChange(e: Event) {
    e.preventDefault();
    const targetElement = e.target as HTMLInputElement;
    this.deliveryMode = targetElement.value;
    if (this.deliveryMode === "1") {
      this.total = this.extras.subtotal + this.deliveryCharges;
    }
    if (this.deliveryMode === "2" || this.deliveryMode === "3") {
      this.total = this.extras.subtotal;
    }
    // this.athTotalInsert()
  }
  payment_modeChange(e: Event) {
    e.preventDefault();
    const targetElement = e.target as HTMLInputElement;
    this.paymentMode = targetElement.value;
    if (this.paymentMode === "0") {
      // this.placeOrder();
      const s1 = this.renderer2.createElement("script");
      s1.type = "text/javascript";
      s1.src =
        "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";
      this.renderer2.appendChild(this.angularDoc.body, s1);

      const s2 = this.renderer2.createElement("script");
      s2.type = "text/javascript";
      s2.src = "https://www.athmovil.com/api/js/v3/athmovilV3.js";
      this.renderer2.appendChild(this.angularDoc.body, s2);
      this.athTotalInsert();

      this.athPaymentInterval = setInterval(() => {
        console.log("interval: ", localStorage.getItem("isAth_paid"));
        if (localStorage.getItem("isAth_paid") === "true") {
          this.placeOrder();
          clearInterval(this.athPaymentInterval);
        }
      }, 1000);
    }
  }

  selectedOffer(e) {
    this.discountAmount = 0;
    this.offerComp.updateOffer(-1);
    if (e.id) {
      console.log("this.amountAfterTax < e.moa", this.amountAfterTax, e.moa);
      // check if min ammount condition specify
      if (e.moa && this.amountAfterTax < e.moa) {
        Swal.fire(
          Swaldata.SwalErrorToast(
            `Min Order Ammount ${"$" + e.moa} required to apply this offer`
          )
        );
        return;
      }

      this.selectOffer = e.id;
      let discount: any = Number(
        (this.amountAfterTax * e.percentage) / 100
      ).toFixed(2);

      if (e.mpd && discount > e.mpd) { discount = Number(e.mpd); }

      this.discountAmount = discount;

      this.offerComp.updateOffer(e.id);
    }
  }

  RemoveDis() {
    this.discountAmount = 0;
    this.selectOffer = -1;
    this.offerComp.updateOffer(-1);
  }

  AddNewAddress() {
    this.addAddress = true;
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: this.lat, lng: this.lng } },
          (results) => {
            if (results[0]) {
              this.searchElementRef.nativeElement.value =
                results[0].formatted_address;
              this.FormattedAddress = results[0].formatted_address;
            }
          }
        );
      });
    }
  }
  hideAddAddress() {
    this.addAddress = false;
  }
  selectAddress() {
    this.showallAddress = true;
  }
  private prepareStripeElements() {
    // this.loadStripe()
    // this.stripe = Stripe(environment.stripe_key);
    this.stripe = Stripe(environment.stripe_publishable_key);
    const currentUser = localStorage.getItem("currentuser")
      ? JSON.parse(localStorage.getItem("currentuser")).user
      : null;
    this.userEmail = currentUser != null ? currentUser.email : "";
    const currency = "usd";
    const totalAmount = Number((this.total * 100).toFixed(0));
    const description = "Customer Purchased Item(s)";
    const customerAddress: ICustomerAddress = {
      country: "US",
      city: this.selectedAddress.city,
      // state: this.selectedAddress.state,
      line1: this.selectedAddress.address,
      // line2: this.selectedAddress.line2,
    };
    let temp =
      this.selectedAddress.country != null &&
      typeof this.selectedAddress.country === "string"
        ? this.selectedAddress.country.trim()
        : "";
    if (temp.length > 0) {
      customerAddress.country = temp;
    }
    temp =
      this.selectedAddress.pincode != null &&
      typeof this.selectedAddress.pincode === "string"
        ? this.selectedAddress.pincode.trim()
        : "";
    if (temp.length > 0) {
      customerAddress.postal_code = temp;
    }
    this.client
      .createCardPaymentIntent({
        email: this.userEmail,
        amount: totalAmount,
        currency,
        payment_method_types: ["card"],
        request_three_d_secure: "any",
        // client: 'android',
        automaticGpayApay: true,
        description,
        name:
          this.selectedAddress.firstname + (this.selectedAddress.lastname != null ? " " + this.selectedAddress.lastname : ""),
        address: customerAddress,
        phone: this.selectedAddress.phone,
      })
      .then(({ secret, paymentIntentId }) => {
        const options = {
          clientSecret: secret,
          // Fully customizable with appearance API.
          // appearance: {/*...*/},
        };

        // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 2
        const elements = this.stripe.elements(options);

        const style = {
          base: {
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
              color: "#aab7c4",
            },
          },
        };

        // Create and mount the Payment Element
        if (this.allowGooglePayApplePay) {
          const paymentRequest = this.stripe.paymentRequest({
            country: "US",
            currency,
            total: {
              label: description,
              amount: totalAmount,
            },
            // requestPayerName: true,
            requestPayerEmail: true,
          });

          // const paymentElement = elements.create('payment');
          const paymentElement = elements.create("paymentRequestButton", {
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: "default",
                // One of 'default', 'book', 'buy', or 'donate'
                // Defaults to 'default'

                theme: "dark",
                // One of 'dark', 'light', or 'light-outline'
                // Defaults to 'dark'

                height: "64px",
                // Defaults to '40px'. The width is always '100%'.
              },
            },
          });

          // Check the availability of the Payment Request API first.
          paymentRequest.canMakePayment().then((canMakePayments) => {
            console.log("canMakePayments", canMakePayments);
            if (canMakePayments != null) {
              paymentElement.mount("#payment-request-button");
              paymentRequest.on("paymentmethod", async (ev) => {
                // Confirm the PaymentIntent without handling potential next actions (yet).
                // if (this.gpayapayForm.valid) {
                const { paymentIntent, error: confirmError } =
                  await this.stripe.confirmCardPayment(
                    secret,
                    { payment_method: ev.paymentMethod.id },
                    { handleActions: false }
                  );

                if (confirmError) {
                  // Report to the browser that the payment failed, prompting it to
                  // re-show the payment interface, or show an error message and close
                  // the payment interface.
                  ev.complete("fail");
                  Swal.fire(
                    Swaldata.SwalErrorToast(
                      "Payment failed!!! Use/Select another payment method"
                    )
                  );
                } else {
                  // Report to the browser that the confirmation was successful, prompting
                  // it to close the browser payment method collection interface.
                  ev.complete("success");
                  // Check if the PaymentIntent requires any actions and if so let Stripe.js
                  // handle the flow. If using an API version older than "2019-02-11"
                  // instead check for: `paymentIntent.status === "requires_source_action"`.
                  let errorOccurred = false;
                  if (paymentIntent.status === "requires_action") {
                    // Let Stripe.js handle the rest of the payment flow.
                    const { error } = await this.stripe.confirmCardPayment(
                      secret
                    );
                    if (error) {
                      errorOccurred = true;
                      Swal.fire(
                        Swaldata.SwalErrorToast(
                          "Payment failed!!! Use/Select another payment method"
                        )
                      );
                    }
                  }
                  if (!errorOccurred) {
                    Swal.fire(
                      Swaldata.SwalSuccessToast("Paid successfully!!!")
                    );
                    // const formValue = this.gpayapayForm.value;
                    // this.saveOrder(paymentIntentId, null, formValue.email);
                    this.saveOrder(paymentIntentId, null, this.userEmail);
                  }
                }
                // } // end - if (this.gpayapayForm.valid) {
              });
            } else {
              // document.getElementById('payment-request-button').style.display = 'none';
              this.allowGooglePayApplePay = false;
            }
          });
        }

        this.card = elements.create("card", { style });
        this.card.mount(this.cardElement.nativeElement);

        this.card.addEventListener("change", ({ error }) => {
          this.cardErrors = error && error.message;
        });

        if (!this.isStripePaymentAllowed) {
          this.allowStripePayment = false;
        }
      });
  }

  ngAfterViewInit() {
    if (this.enableAddressInitially && this.searchElementRef != null) {
      this.mapsAPILoader.load().then(() => {
        const autocomplete = new google.maps.places.Autocomplete(
          this.searchElementRef.nativeElement,
          {
            types: ["address"],
          }
        );
        this.setLocation();
        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            this.zoom = 15;
            // get the place result
            const place: google.maps.places.PlaceResult = autocomplete.getPlace();

            // verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            // set latitude, longitude and zoom
            this.lat = place.geometry.location.lat();
            this.lng = place.geometry.location.lng();
            this.FormattedAddress = place.formatted_address;
          });
        });
      });
    }

    setTimeout(() => {
      this.getCart();
    }, 1000);
  }

  setLocation() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: this.lat, lng: this.lng } },
          (results) => {
            if (results[0]) {
              this.searchElementRef.nativeElement.value =
                results[0].formatted_address;
            }
          }
        );
      });
    }
  }

  chooseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: this.lat, lng: this.lng } },
      (results) => {
        if (results[0]) {
          this.searchElementRef.nativeElement.value =
            results[0].formatted_address;
          this.FormattedAddress = results[0].formatted_address;
        }
      }
    );
  }

  // ngOnChanges() {
  //   // this.fname = this.selectedAddress.firstname
  //   // this.lname = this.selectedAddress.lastname
  //   // this.eaddress = this.selectedAddress.email
  // }

  ngOnInit() {
    this.allowStripePayment = true;
    this.loadScripts();
    this.userEmail = localStorage.getItem("currentuser")
      ? JSON.parse(localStorage.getItem("currentuser")).user.email
      : "";
    if (this.enableAddressInitially) {
      this.zoom = 12;
      if (localStorage.getItem("currentUserId")) { this.isLoggedIn = true; }
      // create search FormControl
      this.searchControl = new FormControl();
      this.FormattedAddress = "";
      this.addressForm = this.angularFormBuilder.group({
        id: [-1],
        firstname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        lastname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        country: ['', [Validators.maxLength(25)]],
        phone: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
        city: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        pincode: [null, [Validators.pattern('^[0-9]{4,8}$')]],
        houseno: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        address: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        email: [this.userEmail, [Validators.required, Validators.email]]
      });
    } else {
      this.showallAddress = false;
      this.addAddress = false;
    }

    this.Anetform = this.angularFormBuilder.group({
      creditCard: ["", [CreditCardValidators.validateCCNumber]],
      expirationDate: ["", [CreditCardValidators.validateExpDate]],
      cvc: [
        "",
        [Validators.required, Validators.minLength(3), Validators.maxLength(4)],
      ],
    });

    (window as any).CollectJS.configure({
      variant: "inline",
      styleSniffer: true,
      callback: (token) => {
        console.log("token from magicpay", token);
        this.finishSubmit(token);
      },
      customCss: {
        border: "1px inset #ffbd14",
        "background-color": "#fff",
        color: "black",
        "font-size": "15px",
        "font-family": "monospace",
        padding: "5px",
        "border-left": "1px inset #ffbd14 !important",
      },
      fields: {
        ccnumber: {
          placeholder: "CC Number",
          selector: "#credit-card-number",
        },
        ccexp: {
          placeholder: "CC Expiration",
          selector: "#credit-card-exp",
        },
        cvv: {
          placeholder: "CVV",
          selector: "#credit-card-cvv",
        },
        googlePay: {
          selector: "#googlepaybutton",
          shippingAddressRequired: true,
          shippingAddressParameters: {
            phoneNumberRequired: true,
            allowedCountryCodes: ["US", "CA"],
          },
          billingAddressRequired: true,
          billingAddressParameters: {
            phoneNumberRequired: true,
            format: "MIN",
          },
          emailRequired: true,
          buttonType: "buy",
          buttonColor: "white",
          buttonLocale: "en",
        },
        applePay: {
          selector: "#applepaybutton",
          shippingMethods: [
            {
              label: "Free Standard Shipping",
              amount: "0.00",
              detail: "Arrives in 5-7 days",
              identifier: "standardShipping",
            },
            {
              label: "Express Shipping",
              amount: "10.00",
              detail: "Arrives in 2-3 days",
              identifier: "expressShipping",
            },
          ],
          shippingType: "delivery",
          requiredBillingContactFields: ["postalAddress", "name"],
          requiredShippingContactFields: ["postalAddress", "name"],
          contactFields: ["phone", "email"],
          contactFieldsMappedTo: "shipping",
          lineItems: [
            {
              label: "Foobar",
              amount: "3.00",
            },
            {
              label: "Arbitrary Line Item #2",
              amount: "1.00",
            },
          ],
          totalLabel: "foobar",
          type: "buy",
          style: {
            "button-style": "white-outline",
            height: "50px",
            "border-radius": "0",
          },
        },
      },
    });

    // this.gpayapayForm = this.angularFormBuilder.group({
    //   email: [userEmail, [Validators.required, Validators.email]]
    // });

    // this.restaurantservice.getTaxs().subscribe(
    //   data => {
    //     if (data.status) {
    //       this.foodTax = Number(data.data.food_tax);
    //       this.drinkTax = Number(data.data.drink_tax);
    //       this.grandTax = Number(data.data.grand_tax);
    //       this.deliveryObj = {
    //         delivery_charge: Number(data.data.delivery_charge),
    //         base_delivery_distance: data.data.base_delivery_distance,
    //       }
    //       // this.deliveryCharges = Number(data.data.delivery_charge)
    //     }
    //   },
    //   err => {

    //   }
    // ).add(() => {
    // this.getCart();
    if (this.isLoggedIn) {
      // get user details
      this.userdetail = JSON.parse(localStorage.getItem("currentuser")).user;
    } else {
      // if (this.enableAddressInitially) {
      //   this.showallAddress = true
      //   this.addAddress = true;
      // }
    }
    // })

    // setInterval(() => {
    //   console.log("interval: ", localStorage.getItem("isAth_paid"))
    //   if (localStorage.getItem("isAth_paid") == "true") {
    //     this.placeOrder()
    //   }
    // }, 1000)
  }

  private isInvalidAddressValue(value: string | null) {
    return value == null || value.trim().length === 0 || value === "-";
  }

  getAddress() {
    return new Promise<void>((resolve) => {
      this.userService
        .getAddress(this.userdetail.id)
        .subscribe((data) => {
          if (data.status && data.address.length > 0) {
            this.userAddress = [...data.address].map((e) => {
              console.log(this.reslat, this.reslng, e.lat, e.lng);
              return {
                ...e,
                distance: this.distance(
                  this.reslat,
                  this.reslng,
                  e.lat,
                  e.lng,
                  "k"
                ),
              };
            });
            this.selectedAddress = this.userAddress[0];
            if (this.selectedAddress.lastname == null) {
              this.selectedAddress.lastname = "";
            }
            if (this.selectedAddress.houseno == null) {
              this.selectedAddress.houseno = "";
            }
            this.selectedAddress.housenoDisplay = this.isInvalidAddressValue(this.selectedAddress.houseno) ? null : this.selectedAddress.houseno.trim();
            this.selectedAddress.addressDisplay = this.isInvalidAddressValue(this.selectedAddress.address) ? null : this.selectedAddress.address.trim();
            this.selectedAddress.cityDisplay = this.isInvalidAddressValue(this.selectedAddress.city) ? null : this.selectedAddress.city.trim();
            this.selectedAddress.stateDisplay = this.isInvalidAddressValue(this.selectedAddress.state) ? null : this.selectedAddress.state.trim();
            this.selectedAddress.countryDisplay = this.isInvalidAddressValue(this.selectedAddress.country) ? null : this.selectedAddress.country.trim();
            // console.log('selectedAddress', this.selectedAddress);
            this.deliveryCharges = this.getDeliveryCharge(this.selectedAddress.distance);
            this.fname = this.selectedAddress.firstname;
            this.lname = this.selectedAddress.lastname;
            this.eaddress = this.selectedAddress.email;
            // this.showallAddress = true;
            // this.addAddress = true;
            // } else {
            //   this.showallAddress = false;
            //   this.addAddress = false;
          }
          this.showallAddress = false;
          this.addAddress = false;
        })
        .add(() => {
          this.getTotalPrice();
          resolve();
        });
    });
  }
  getDeliveryCharge(distance) {
    console.log("distance: ", distance);
    // return Number(this.deliveryObj.delivery_charge)
    if (distance > this.deliveryObj.base_delivery_distance) {
      const afterBaseDis = distance - this.deliveryObj.base_delivery_distance;
      // let dis_charge = this.deliveryObj.delivery_charge + this.deliveryObj.extra_delivery_charge * Math.ceil(afterBaseDis);
      const disCharge = this.deliveryObj.delivery_charge * Math.ceil(afterBaseDis);
      return Number(disCharge.toFixed(2));
    } else {
      return Number(this.deliveryObj.delivery_charge);
    }
  }
  onSubmitAddress() {
    if (!this.addressForm.valid) { return; }

    if (this.lng === -1 || this.lat === -1 || this.FormattedAddress === "") { return; }

    const dataAddr = this.addressForm.value;
    if (dataAddr.id == null) { dataAddr.id = -1; }

    if (this.isLoggedIn) {
      dataAddr["user_id"] = this.userdetail.id;
      dataAddr["lat"] = this.lat;
      dataAddr["lng"] = this.lng;
      dataAddr["formattedAddress"] = this.FormattedAddress;

      this.spinner.show();
      this.userService
        .addAddress(dataAddr)
        .subscribe(
          (data: any) => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast(data.msg));
            } else {
              Swal.fire(Swaldata.SwalErrorToast("Something Went Wrong"));
            }
          },
          (err) => {
            Swal.fire(Swaldata.SwalErrorToast("Something Went Wrong"));
          }
        )
        .add(() => {
          this.spinner.hide();
          this.resetAddressform();
          this.addAddress = false;
          this.getAddress();
        });
    } else {
      const data = this.addressForm.value;
      data.id = -1;
      data["lat"] = this.lat;
      data["lng"] = this.lng;
      data["formattedAddress"] = this.FormattedAddress;
      data["distance"] = this.distance(
        this.reslat,
        this.reslng,
        this.lat,
        this.lng,
        "k"
      );
      if (data.lastname == null) {
        data.lastname = "";
      }

      this.selectedAddress = data;

      this.spinner.hide();
      this.showallAddress = false;
    }
  }
  resetAddressform() {
    this.addressForm.reset();
    this.lat = -1;
    this.lng = -1;
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
    this.FormattedAddress = "";
    this.searchControl.setValue("");
  }
  changeAddress(id) {
    this.userAddress.forEach((ele) => {
      if (ele.id === id) {
        this.selectedAddress = ele;
        if (this.selectedAddress.lastname == null) {
          this.selectedAddress.lastname = "";
        }
        if (this.selectedAddress.houseno == null) {
          this.selectedAddress.houseno = "";
        }
      }
    });
    this.deliveryCharges = this.getDeliveryCharge(this.selectedAddress.distance);
    this.getTotalPrice();
    this.showallAddress = false;
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    if (lat1 === lat2 && lon1 === lon2) {
      return 0;
    } else {
      const radlat1 = (Math.PI * lat1) / 180;
      const radlat2 = (Math.PI * lat2) / 180;
      const theta = lon1 - lon2;
      const radtheta = (Math.PI * theta) / 180;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit === "K") {
        dist = dist * 1.609344;
      }
      if (unit === "N") {
        dist = dist * 0.8684;
      }
      return Number(dist.toFixed(2));
    }
  }

  getCart() {
    console.log("getCart");
    // let total = 0;
    this.spinner.show();
    if (this.isLoggedIn) {
      this.restaurantservice
        .getcart()
        .subscribe(
          (data) => {
            console.log("data: ", data);
            this.cartId = data.data.id;
            this.restaurantId = data.data.res_id;
            console.log("data: ", data.data.res_id);
            this.userId = data.data.user_id;
            console.log("cart response field type", typeof data.data.cart);
            const cartData =
              typeof data.data.cart === "string"
                ? JSON.parse(data.data.cart)
                : data.data.cart;
            this.cart = [...cartData];
            this.restaurantName = data.data.res_name;
            this.resAvailable = this.restaurantservice.checkifResAvailable(
              data.data
            );
            this.reslat = data.data.latitude;
            this.reslng = data.data.longitude;
            this.allowCod = data.data.cod;
            this.paymentMode = this.allowCod === 1 ? "7" : "1";
            this.minOrderValue = data.data.min_order_value;
            this.maxOrderValue = data.data.max_order_value;
            this.athAcc = data.data.ath_acc;
            this.convenienceFee = data.data.convenience_fee;
            console.log("athAcc: ", this.athAcc);
          },
          (err) => {}
        )
        .add(() => {
          this.restaurantservice
            .getRestaurantdetail(this.restaurantId)
            .subscribe(async (res) => {
              console.log("getRestaurantdetail - response: ", res);
              const restaurantDetail = res.data.restaurantDetail[0];
              console.log("restaurantDetail", restaurantDetail);
              this.foodTax = Number(restaurantDetail.food_tax);
              this.drinkTax = Number(restaurantDetail.drink_tax);
              this.grandTax = Number(restaurantDetail.grand_tax);
              this.deliveryObj = {
                delivery_charge: Number(restaurantDetail.delivery_charge),
                base_delivery_distance: restaurantDetail.base_delivery_distance,
                // extra_delivery_charge: res.data.extra_delivery_charge,
              };
              // this.driver_fee = Number(restaurantDetail.driver_fee);
              this.convenienceFeeType = Number(
                restaurantDetail.convenience_fee_type
              );
              console.log("convenienceFee", restaurantDetail.convenience_fee);
              this.convenienceFee = Number(restaurantDetail.convenience_fee);
              this.spinner.hide();
              if (this.enableAddressInitially) {
                await this.getAddress();
              }
              this.getTotalPrice();
              await this.getdiscount();
              this.prepareStripeElements();
            });
        });
    } else {
      if (!this.restaurantservice.cart["cart"]) { this.routingRouter.navigate(["/"]); }
      this.cartId = -1;
      this.restaurantId = this.restaurantservice.cart["res_id"];
      this.userId = -1;
      this.cart = this.restaurantservice.cart["cart"];
      this.restaurantName = this.restaurantservice.cart["res_name"];
      this.resAvailable = true;
      this.reslat = this.restaurantservice.cart["reslat"];
      this.reslng = this.restaurantservice.cart["reslng"];
      this.allowCod = this.restaurantservice.cart["cod"];
      this.paymentMode = this.allowCod === 1 ? "2" : "1";
      this.minOrderValue = this.restaurantservice.cart["min_order_value"];
      this.maxOrderValue = this.restaurantservice.cart["max_order_value"];
      // this.convenienceFee = this.restaurantservice.cart['convenience_fee'];
      this.restaurantservice
        .getRestaurantdetail(this.restaurantId)
        .subscribe(async (res) => {
          console.log("getRestaurantdetail - response: ", res);
          const restaurantDetail = res.data.restaurantDetail[0];
          console.log("restaurantDetail", restaurantDetail);
          this.foodTax = Number(restaurantDetail.food_tax);
          this.drinkTax = Number(restaurantDetail.drink_tax);
          this.grandTax = Number(restaurantDetail.grand_tax);
          this.deliveryObj = {
            delivery_charge: Number(restaurantDetail.delivery_charge),
            base_delivery_distance: restaurantDetail.base_delivery_distance,
            // extra_delivery_charge: res.data.extra_delivery_charge,
          };
          // this.driver_fee = Number(restaurantDetail.driver_fee);
          this.convenienceFeeType = Number(
            restaurantDetail.convenience_fee_type
          );
          console.log("convenienceFee", restaurantDetail.convenience_fee);
          this.convenienceFee = Number(restaurantDetail.convenience_fee);
          this.spinner.hide();
          this.getTotalPrice();
          await this.getdiscount();
          this.prepareStripeElements();
        });
    }
  }

  getdiscount() {
    return new Promise<void>((resolve, reject) => {
      if (!this.isLoggedIn) {
        resolve();
        return;
      }
      this.restaurantservice.getDiscounts(this.userId, this.restaurantId).subscribe(
        (data) => {
          if (data.status) {
            this.Offers = data.data;
            resolve();
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  getTotalPrice() {
    console.log("total");
    // get tax and total tax and subtotal and total
    let foodTax = 0;
    let drinkTax = 0;
    let grandTax = 0;
    let carttotal = 0;
    let subtotal = 0;
    // let tax = 0;
    // let total = 0;

    this.cart.forEach((ele, i) => {
      if (ele.is_food) {
        this.cart[i].taxper = this.foodTax;
        foodTax += Number(
          ((ele.itemPrice * ele.quantity * this.foodTax) / 100).toFixed(2)
        );
      }

      if (ele.is_state) {
        this.cart[i].taxper = this.drinkTax;
        drinkTax += Number(
          ((ele.itemPrice * ele.quantity * this.drinkTax) / 100).toFixed(2)
        );
      }

      if (ele.is_city) {
        grandTax += Number(
          ((ele.itemPrice * ele.quantity * this.grandTax) / 100).toFixed(2)
        );
      }

      carttotal += Number((ele.itemPrice * ele.quantity).toFixed(2));
    });

    // subtotal = carttotal + foodTax + drinkTax + grandTax + this.convenienceFee;
    subtotal = carttotal + foodTax + drinkTax + grandTax;

    this.extras = {
      food_tax: Number(foodTax.toFixed(2)),
      drink_tax: Number(drinkTax.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(grandTax.toFixed(2)),
    };
    this.amountAfterTax = Number(this.extras.subtotal.toFixed(2));
    this.total = subtotal;
    if (this.deliveryMode === "1") {
      this.total += Number(this.deliveryCharges);
    }

    this.calculateConvenienceFeeValue(subtotal);
    this.total += this.convenienceFeeValue;

    // this.athTotalInsert()
    // const s1 = this.renderer2.createElement('script');
    // s1.type = 'text/javascript';
    // s1.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
    // this.renderer2.appendChild(this.angularDoc.body, s1);
    //
    // const s2 = this.renderer2.createElement('script');
    // s2.type = 'text/javascript';
    // s2.src = 'https://www.athmovil.com/api/js/v3/athmovilV3.js';
    // this.renderer2.appendChild(this.angularDoc.body, s2);
  }

  private calculateConvenienceFeeValue(subtotal: number) {
    this.convenienceFeeValue = 0;
    if (this.convenienceFeeType === 1) {
      this.convenienceFeeValue = this.convenienceFee;
    }
    if (this.convenienceFeeType === 2) {
      this.convenienceFeeValue = (subtotal * this.convenienceFee) / 100.0;
    }
  }

  private saveOrder(token: string, AnetCreditCard: {}, email?: string) {
    this.btnDisable = true;
    this.spinner.show();
    this.restaurantservice
      .placeOrder(
        this.selectedAddress,
        this.total.toFixed(2),
        this.cartId,
        this.cart,
        this.userId,
        this.restaurantId,
        this.extras,
        token,
        this.paymentMode,
        this.deliveryMode,
        this.selectOffer,
        AnetCreditCard,
        this.tableNum,
        this.discountAmount,
        this.total - this.discountAmount,
        0,
        0,
        email || this.userEmail,
      )
      .subscribe(
        (data) => {
          console.log("dd", data);
          if (data.status) {
            if (data.paymentStatus) {
              this.cart = [];
              this.restaurantservice.cart = [];
              this.routingRouter.navigate(["/order", data.order_id, data.order_hash]);
            } else {
              Swal.fire({
                position: "top-end",
                icon: "error",
                title: data.msg,
                showConfirmButton: false,
                timer: 3000,
              });
            }
          } else {
            Swal.fire(Swaldata.SwalErrorToast(data.msg));
          }
        },
        (err) => {
          Swal.fire(Swaldata.SwalErrorToast(err));
        }
      )
      .add(() => {
        this.spinner.hide();
        // this.btnDisable = false;
        setTimeout(() => {
          this.btnDisable = false
        }, this.btnDisableTimeout);
      });
  }

  placeOrder(token = "") {
    localStorage.setItem("isAth_paid", null);
    if (this.cart.length < 1) {
      Swal.fire(Swaldata.SwalErrorToast("You cart is empty "));
      return;
    }

    if (
      this.minOrderValue &&
      this.amountAfterTax - this.discountAmount < this.minOrderValue
    ) {
      Swal.fire(
        Swaldata.SwalErrorToast(
          `Min Order Amount ${"$" + this.minOrderValue} required`
        )
      );
      return;
    }

    if (
      this.maxOrderValue &&
      this.amountAfterTax - this.discountAmount > this.maxOrderValue
    ) {
      Swal.fire(
        Swaldata.SwalErrorToast(
          `Max Order Amount ${"$" + this.maxOrderValue} required`
        )
      );
      return;
    }

    if (!this.enablePaymentWithoutAddress && this.selectedAddress == null) {
      Swal.fire(Swaldata.SwalErrorToast("Please select a billing address"));
      return;
    }
    console.log("distabceLimit: ", this.DelieverydistanceLimit);
    console.log(
      "distance: ",
      this.distance(
        this.reslat,
        this.reslng,
        this.selectedAddress.lat,
        this.selectedAddress.lng,
        "k"
      )
    );
    if (
      this.deliveryMode === "1" &&
      this.distance(
        this.reslat,
        this.reslng,
        this.selectedAddress.lat,
        this.selectedAddress.lng,
        "k"
      ) > this.DelieverydistanceLimit
    ) {
      Swal.fire(
        Swaldata.SwalErrorToast("Delivery is not available at this location")
      );
      return;
    }

    if (this.deliveryMode === "1") {this.extras["delivery_charge"] = this.deliveryCharges; } else { this.extras["delivery_charge"] = 0; }

    this.extras["amountAfterTax"] = this.amountAfterTax;

    this.extras["convenience_fee"] = this.convenienceFee;

    let AnetCreditCard = {};
    if (this.paymentMode === "3") {
      if (!this.Anetform.valid) {
        Swal.fire(Swaldata.SwalErrorToast("card detail is invalid"));
        return;
      }

      AnetCreditCard = this.Anetform.value;
    }

    if (this.paymentMode !== "4") {
      this.saveOrder(token, AnetCreditCard);
    }

    if (this.paymentMode !== "7") {
      this.saveOrder(token, {}, this.eaddress);
    }

    // if (!this.gpayapayForm.valid) {
    //   return Swal.fire(Swaldata.SwalErrorToast('email is invalid'));
    // }
  }

  async buy(e: MouseEvent) {
    e.preventDefault();

    if (this.paymentMode === "1") {
      const { token, error } = await this.stripe.createToken(this.card);

      if (error) {
        // Inform the customer that there was an error.
        this.cardErrors = error.message;
        // this.btnDisable = false;
        setTimeout(() => {
          this.btnDisable = false
        }, this.btnDisableTimeout);
      } else {
        this.placeOrder(token.id);
      }
    } else if (this.paymentMode === "7") {
      this.spinner.show();
      (window as any).CollectJS.startPaymentRequest();
    } else {
      this.placeOrder();
    }
  }

  athTotalInsert() {
    const s = this.renderer2.createElement("script");
    s.type = "text/javascript";
    // s.text = `
    //   ATHM_Checkout = {
    //
    //     env: 'production',
    //     publicToken: "${this.athAcc}",
    //
    //     timeout: 600,
    //
    //     theme: 'btn',
    //     lang: 'en',
    //
    //     total: ${this.total.toFixed(2)},
    //     onCompletedPayment: function (response)
    //     {
    //       console.log("payRes: ", response)
    //       if (response.status == "completed") {
    //         console.log("if")
    //         localStorage.setItem("isAth_paid", true)
    //         localStorage.setItem("referenceNumber", response.referenceNumber)
    //         localStorage.setItem("fee", response.fee)
    //       }
    //     },
    //     onCancelledPayment: function (response)
    //     {
    //         console.log("cancelRes: ", response)
    //     },
    // }`;

    // s.text = `
    //   ATHM_Checkout = {

    //     env: 'sandbox',
    //     publicToken: 'sandboxtoken01875617264',

    //     timeout: 600,

    //     theme: 'btn',
    //     lang: 'en',

    //     total: 10,
    //     onCompletedPayment: function (response)
    //     {
    //       console.log("payRes: ", response)
    //       if (response.status == "completed") {
    //         console.log("if")
    //         localStorage.setItem("isAth_paid", true)
    //         localStorage.setItem("referenceNumber", response.referenceNumber)
    //         localStorage.setItem("fee", response.fee)
    //       }
    //     },
    //     onCancelledPayment: function (response)
    //     {
    //         console.log("cancelRes: ", response)
    //     },
    // }`;

    let scriptText = `ATHM_Checkout = {
        env: 'sandbox',
        publicToken: 'sandboxtoken01875617264',

        timeout: 600,

        theme: 'btn',
        lang: 'en',

        total: #TOTAL#,

        metadata1: '#METADATA1#',
        metadata2: '',

        onCompletedPayment: onCompletedAthPayment,
        onCancelledPayment: onCancelledAthPayment,
        onExpiredPayment: onExpiredAthPayment,

        items: #ITEMS#
    }`;

    const items = [];
    this.cart.forEach((ele, i) => {
      items.push({
        name: ele.itemName,
        description: "-",
        quantity: ele.quantity,
        price: ele.itemPrice,
        tax: ele.taxper,
        metadata: "-",
      });
    });

    const metadata =
      "res_id=" +
      this.restaurantId +
      ";user_id=" +
      this.userId +
      ";cart_id=" +
      this.cartId;
    scriptText = scriptText
      .replace("#ITEMS#", JSON.stringify(items))
      .replace("#METADATA1#", metadata)
      .replace("#TOTAL#", this.total.toFixed(2));
    scriptText = scriptText
      .replace("sandbox", "production")
      .replace("sandboxtoken01875617264", this.athAcc); // comment ONLY WHEN TESTING using sandbox
    // console.log('scriptText', scriptText);
    s.text = scriptText;
    this.renderer2.appendChild(this.angularDoc.body, s);
  }

  loadScripts() {
    const node = document.createElement("script"); // creates the script tag
    node.text = `function onCompletedAthPayment(response) { console.log('ATH payment completed', response);
if (response.status == "completed") {
  console.log("if")
  localStorage.setItem("isAth_paid", true)
  localStorage.setItem("referenceNumber", response.referenceNumber)
  localStorage.setItem("fee", response.fee)
}
    }
function onCancelledAthPayment(response) { console.log('ATH payment cancelled', response); }
function onExpiredAthPayment(response) { console.log('ATH payment expired', response); }`;
    node.type = "text/javascript"; // set the script type
    node.async = true; // makes script run asynchronously
    node.charset = "utf-8";
    // append to head of document
    document.getElementsByTagName("head")[0].appendChild(node);
  }
}
