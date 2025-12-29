import { Component, OnInit, ViewChild, ElementRef, Input, NgZone } from '@angular/core';
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

declare var Stripe; // : stripe.StripeStatic; 

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  styles: ['agm-map { height: 300px}', '.address-div{width:100%}', '.address-div .fa {cursor:pointer}', '.globel-text{ color:#e4a911; cursor: pointer }', '.form-control{ padding: 8px; border- radius: 0; border: 1px solid #E5E5E5;}', '.globel-text.pull-right{font-size:14px}', '.stripe-sec{margin-top: 20px !important;}', '.stripe-sec.hide{display:none}', ' .form-control.ng-invalid{ border-left: 2px solid #ff000075 !important;}', '.order-table tfoot td{padding: 8px 15px; !mportant}', '.remove-dis{font-size: 0.675rem; padding: 0.15rem 0.15rem;    margin-left: 6px;}', 'tr.less-padding td{ padding: 5px 12px; }']
})

export class CheckoutComponent implements OnInit {
  // elements: Elements;
  card: any;

  userdetail: any;
  userAddress: Array<any> = [];
  addressForm: FormGroup;
  addAddress: boolean;
  DelieverydistanceLimit: number = 10
  showallAddress: boolean = false
  selectedAddress: any = [];

  cart_id: number = -1;
  res_id: number;
  user_id: number;
  cart: any = []
  extras: any;
  total: number = 0;

  food_tax: number;
  drink_tax: number;
  grand_tax: number;

  validCheckout: boolean = true;
  stripe: any;

  reslat: any = -1;
  reslng: any = -1

  // delivery_mode   1 = home delivery; 2 = pick up
  // payment_mode   1 = Online; 2 = Cash on delivery

  payment_mode: any = "2";
  delivery_mode: any = "1";
  btnDisable: boolean = false;
  resAvailable: boolean = false;

  delivery_charge: number = 0;
  isLoggedIn: boolean = false
  allowCod: number = 0

  Offers: Array<any> = []
  selectOffer: number = -1;
  discountAmmount: number = 0

  @ViewChild('cardElement', { static: false }) cardElement: ElementRef;
  @ViewChild('offerComp', { static: false }) offerComp: any;
  cardErrors: any;

  res_name: string = ""
  public lat: any = -1;
  public lng: any = -1;
  public zoom: any = -1;
  public searchControl: FormControl;

  @ViewChild("search", { static: false })
  public searchElementRef: ElementRef;
  FormattedAddress: string;
  min_order_value: any;
  max_order_value: any;
  Anetform: FormGroup;
  amountAfterTax: any;
  deliveryObj: { delivery_charge: any; base_delivery_distance: any; extra_delivery_charge: any; };

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private _route: Router, private route: ActivatedRoute, private userService: UserService, private spinner: NgxSpinnerService, private translate: TranslateService, private _fb: FormBuilder, public restaurantservice: RestaurantService) { }

  delivery_modeChange(e) {
    this.delivery_mode = e
    if (e == 1)
      this.total += this.delivery_charge
    if (e == 2)
      this.total -= this.delivery_charge
  }
  payment_modeChange(e) {
    this.payment_mode = e
  }

  selectedOffer(e) {
    this.discountAmmount = 0;
    this.offerComp.updateOffer(-1)
    if (e.id) {
      console.log('this.amountAfterTax < e.moa', this.amountAfterTax, e.moa)
      //check if min ammount condition specify
      if (e.moa && this.amountAfterTax < e.moa)
        return Swal.fire(Swaldata.SwalErrorToast(`Min Order Ammount ${'$' + e.moa} required to apply this offer`))

      this.selectOffer = e.id
      let discount: any = Number((this.amountAfterTax * e.percentage) / 100).toFixed(2)

      if (e.mpd && discount > e.mpd)
        discount = Number(e.mpd)

      this.discountAmmount = discount;

      this.offerComp.updateOffer(e.id)
    }
    return
  }

  RemoveDis() {
    this.discountAmmount = 0;
    this.selectOffer = -1
    this.offerComp.updateOffer(-1)
  }

  AddNewAddress() {
    this.addAddress = true;
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          let geocoder = new google.maps.Geocoder;
          geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, (results) => {
            if (results[0]) {
              this.searchElementRef.nativeElement.value = results[0].formatted_address
              this.FormattedAddress = results[0].formatted_address
            }
          });
        },
      );
    };
  }
  hideAddAddress() {
    this.addAddress = false;
  }
  selectAddress() {
    this.showallAddress = true
  }
  ngAfterViewInit() {
    // this.loadStripe()
    this.stripe = Stripe(environment.stripe_key);
    const elements = this.stripe.elements();

    var style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      }
    };

    this.card = elements.create('card', { style: style });
    this.card.mount(this.cardElement.nativeElement);

    this.card.addEventListener('change', ({ error }) => {
      this.cardErrors = error && error.message;
    });


    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      this.setLocation()
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          this.zoom = 15
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.FormattedAddress = place.formatted_address
        });
      });
    });
  }

  setLocation() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;

          let geocoder = new google.maps.Geocoder;
          geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, (results) => {
            if (results[0]) {
              this.searchElementRef.nativeElement.value = results[0].formatted_address
            }
          });
        },
      );

    };
  }

  chooseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;

    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, (results) => {
      if (results[0]) {
        this.searchElementRef.nativeElement.value = results[0].formatted_address
        this.FormattedAddress = results[0].formatted_address
      }
    });
  }
  ngOnInit() {
    this.zoom = 12;
    let userEmail = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')).user.email : ''
    if (localStorage.getItem('currentUserId'))
      this.isLoggedIn = true
    //create search FormControl
    this.searchControl = new FormControl();
    this.FormattedAddress = '';
    this.addressForm = this._fb.group({
      id: [-1],
      firstname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      lastname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      country: ['', [Validators.maxLength(25)]],
      phone: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
      city: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      pincode: [null, [Validators.pattern('^[0-9]{4,8}$')]],
      houseno: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      address: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      email: [userEmail, [Validators.required, Validators.email]]
    })


    this.Anetform = this._fb.group({
      creditCard: ['', [CreditCardValidators.validateCCNumber]],
      expirationDate: ['', [CreditCardValidators.validateExpDate]],
      cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });

    this.restaurantservice.getTaxs().subscribe(
      data => {
        if (data.status) {
          this.food_tax = Number(data.data.food_tax);
          this.drink_tax = Number(data.data.drink_tax);
          this.grand_tax = Number(data.data.grand_tax);
          this.deliveryObj = {
            delivery_charge: Number(data.data.delivery_charge),
            base_delivery_distance: data.data.base_delivery_distance,
            extra_delivery_charge: data.data.extra_delivery_charge,
          }
          // this.delivery_charge = Number(data.data.delivery_charge)
        }
      },
      err => {

      }
    ).add(() => {
      this.getCart()
      if (this.isLoggedIn) {
        //get user details
        this.userdetail = JSON.parse(localStorage.getItem('currentuser')).user;
      } else {
        this.showallAddress = true
        this.addAddress = true;
      }
    })
  }

  getAddress() {
    this.userService.getAddress(this.userdetail.id).subscribe(
      data => {
        if (data.status && data.address.length > 0) {
          this.userAddress = [...data.address].map(e => {
            console.log(this.reslat, this.reslng, e.lat, e.lng)
            return { ...e, 'distance': this.distance(this.reslat, this.reslng, e.lat, e.lng, 'k') }
          })
          this.selectedAddress = this.userAddress[0]
          this.delivery_charge = this.getDeliveryCharge(this.selectedAddress.distance);
        } else {
          this.showallAddress = true
          this.addAddress = true;
        }
      }
    )
  }
  getDeliveryCharge(distance) {
    console.log(distance, this.deliveryObj)
    if (distance > this.deliveryObj.base_delivery_distance) {
      let after_base_dis = distance - this.deliveryObj.base_delivery_distance
      let dis_charge = this.deliveryObj.delivery_charge + this.deliveryObj.extra_delivery_charge * Math.ceil(after_base_dis);
      return Number(dis_charge.toFixed(2));
    } else {
      return Number(this.deliveryObj.delivery_charge)
    }
  }
  onSubmitAddress() {
    if (!this.addressForm.valid)
      return

    if (this.lng == -1 || this.lat == -1 || this.FormattedAddress == '')
      return

    let data = this.addressForm.value
    if (data.id == null)
      data.id = -1

    if (this.isLoggedIn) {
      data['user_id'] = this.userdetail.id;
      data['lat'] = this.lat;
      data['lng'] = this.lng;
      data['formattedAddress'] = this.FormattedAddress

      this.spinner.show()
      this.userService.addAddress(data).subscribe(
        data => {
          if (data.status) {
            Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          } else {
            Swal.fire(Swaldata.SwalErrorToast('Something Went Wrong'));
          }
        },
        err => {
          Swal.fire(Swaldata.SwalErrorToast('Something Went Wrong'));
        }
      ).add(() => {
        this.spinner.hide()
        this.resetAddressform()
        this.addAddress = false;
        this.getAddress()
      })
    } else {
      let data = this.addressForm.value
      data.id = -1
      data['lat'] = this.lat;
      data['lng'] = this.lng;
      data['formattedAddress'] = this.FormattedAddress;
      data['distance'] = this.distance(this.reslat, this.reslng, this.lat, this.lng, 'k')

      this.selectedAddress = data

      this.spinner.hide()
      this.showallAddress = false;
    }
  }
  resetAddressform() {
    this.addressForm.reset()
    this.lat = -1
    this.lng = -1;
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
        },
      );
    };
    this.FormattedAddress = ''
    this.searchControl.setValue('')
  }
  changeAddress(id) {
    this.userAddress.forEach(ele => {
      if (ele.id == id)
        this.selectedAddress = ele
    })
    this.delivery_charge = this.getDeliveryCharge(this.selectedAddress.distance);
    this.showallAddress = false
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "N") { dist = dist * 0.8684 }
      return dist.toFixed(2);
    }
  }

  getCart() {
    let total = 0;
    this.spinner.show()
    if (this.isLoggedIn) {
      this.restaurantservice.getcart().subscribe(
        data => {
          this.cart_id = data.data.id
          this.res_id = data.data.res_id
          this.user_id = data.data.user_id
          this.cart = JSON.parse(data.data.cart)
          this.res_name = data.data.res_name;
          this.resAvailable = this.restaurantservice.checkifResAvailable(data.data)
          this.reslat = data.data.latitude;
          this.reslng = data.data.longitude;
          this.allowCod = data.data.cod
          this.payment_mode = this.allowCod == 1 ? "2" : "1"
          this.min_order_value = data.data.min_order_value;
          this.max_order_value = data.data.max_order_value
        },
        err => {

        }
      ).add(() => {
        this.spinner.hide();
        this.getAddress();
        this.getTotalPrice();
        this.getdiscount()
      })
    } else {
      if (!this.restaurantservice.cart['cart'])
        return this._route.navigate(['/'])
      this.cart_id = -1
      this.res_id = this.restaurantservice.cart['res_id']
      this.user_id = -1
      this.cart = this.restaurantservice.cart['cart']
      this.res_name = this.restaurantservice.cart['res_name']
      this.resAvailable = true
      this.reslat = this.restaurantservice.cart['reslat']
      this.reslng = this.restaurantservice.cart['reslng'];
      this.allowCod = this.restaurantservice.cart['cod'];
      this.payment_mode = this.allowCod == 1 ? "2" : "1";
      this.min_order_value = this.restaurantservice.cart['min_order_value'];
      this.max_order_value = this.restaurantservice.cart['max_order_value'];
      this.spinner.hide();
      this.getTotalPrice();
      this.getdiscount()
    }

  }

  getdiscount() {
    if (!this.isLoggedIn)
      return
    this.restaurantservice.getDiscounts(this.user_id, this.res_id).subscribe(
      data => {
        if (data.status) {
          this.Offers = data.data
        }
      },
      err => {

      }
    )
  }
  getTotalPrice() {
    //get tax and total tax and subtotal and total
    let foodTax = 0;
    let drinkTax = 0;
    let carttotal = 0;
    let subtotal = 0;
    let tax = 0;
    let total = 0;

    this.cart.forEach((ele, i) => {

      if (ele.taxtype == 'food') {
        this.cart[i].taxper = this.food_tax
        foodTax += Number((((ele.itemPrice * ele.quantity) * this.food_tax) / 100).toFixed(2))
      }

      if (ele.taxtype == 'drink') {
        this.cart[i].taxper = this.drink_tax
        drinkTax += Number((((ele.itemPrice * ele.quantity) * this.drink_tax) / 100).toFixed(2))
      }

      carttotal += Number((ele.itemPrice * ele.quantity).toFixed(2))
    })

    subtotal = carttotal + foodTax + drinkTax;

    this.extras = {
      food_tax: Number(foodTax.toFixed(2)),
      drink_tax: Number(drinkTax.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(((subtotal * this.grand_tax) / 100).toFixed(2))
    }
    this.amountAfterTax = Number((this.extras.subtotal + this.extras.tax).toFixed(2))
    this.total = Number(((subtotal * this.grand_tax) / 100).toFixed(2)) + subtotal;
    if (this.delivery_mode == 1)
      this.total += Number(this.delivery_charge)

  }

  placeOrder(token = '') {

    if (this.cart.length < 1) {
      Swal.fire(Swaldata.SwalErrorToast('You cart is empty '))
      return;
    }

    if (this.min_order_value && (this.amountAfterTax - this.discountAmmount) < this.min_order_value)
      return Swal.fire(Swaldata.SwalErrorToast(`Min Order Amount ${'$' + this.min_order_value} required`))

    if (this.max_order_value && (this.amountAfterTax - this.discountAmmount) > this.max_order_value)
      return Swal.fire(Swaldata.SwalErrorToast(`Max Order Amount ${'$' + this.max_order_value} required`))

    if (this.selectedAddress.length == 0) {
      Swal.fire(Swaldata.SwalErrorToast('Please select a billing address'))
      return;
    }

    if (this.delivery_mode == 1 && this.distance(this.reslat, this.reslng, this.selectedAddress.lat, this.selectedAddress.lng, 'k') > this.DelieverydistanceLimit)
      return Swal.fire(Swaldata.SwalErrorToast('Delivery is not available at this location'))

    if (this.delivery_mode == 1)
      this.extras['delivery_charge'] = this.delivery_charge;
    else
      this.extras['delivery_charge'] = 0;

    this.extras['amountAfterTax'] = this.amountAfterTax

    if (this.payment_mode == 3 && !this.Anetform.valid)
      return Swal.fire(Swaldata.SwalErrorToast('card detail is invalid'))

    let Anet_credit_card = {};
    if (this.payment_mode == 3)
      Anet_credit_card = this.Anetform.value

    this.btnDisable = true;
    this.spinner.show()
    this.restaurantservice.placeOrder(this.selectedAddress, this.total.toFixed(2), this.cart_id, this.cart, this.user_id, this.res_id, this.extras, token, this.payment_mode, this.delivery_mode, this.selectOffer, Anet_credit_card).subscribe(
      data => {
        if (data.status) {
          if (data.paymentStatus) {
            this.cart = []
            this.restaurantservice.cart = []
            this._route.navigate(['/order', data.order_id, data.order_hash])
          } else {
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: data.msg,
              showConfirmButton: false,
              timer: 3000
            })
          }
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
      this.btnDisable = false;
    })

  }

  async buy(e) {
    e.preventDefault();

    if (this.payment_mode == 1) {
      const { token, error } = await this.stripe.createToken(this.card);

      if (error) {
        // Inform the customer that there was an error.
        this.cardErrors = error.message;
        this.btnDisable = false
      } else {
        this.placeOrder(token.id)
      }
    } else {
      this.placeOrder()
    }

  }

}
