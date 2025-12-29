import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserService } from '../../../shared/services/frontServices/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { noOnlyWhitespaceValidator, MustMatch } from 'src/app/shared/helpers/custom.validator';
import { ImageCropperModule, ImageCroppedEvent } from "ngx-image-cropper";
import { dataURLtoFile } from 'src/app/shared/helpers/commonFunctions';
import * as moment from "moment";
import { environment } from 'src/environments/environment';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: ['agm-map { height: 400px}', '.hideAddress{ display:none}', '.address-div{width:100%}', '.address-div .fa {cursor:pointer; padding: 8px;}', '.order-img img{height:100%; width:100%}', 'select.ng-valid {border-left:1px solid #ced4da }', '.form-control[readonly]{    background-color: #ffffff;}', '.re-order-wrap button{display: list-item;}', ' .form-control.ng-invalid{ border-left: 2px solid #ff000075 !important;}']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public Routersubscription: any;
  public menutype: any;
  public userdetail: any;
  public userform: FormGroup;
  public imagepath: string = "";
  public profileImg: string
  showImagecropper: Boolean = false;
  maxDate: moment.Moment;
  public addAddress: boolean = false
  public profilepic: any;
  public addressForm: FormGroup;


  imageChangedEvent: any = "";
  croppedImage: any = "";
  changepasswordform: FormGroup;

  userAddress: Array<any> = [];
  userOrders: Array<any> = [];

  public lat: any = -1;
  public lng: any = -1;
  public zoom: any = -1;
  public searchControl: FormControl;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  FormattedAddress: string;

  public page: number;
  throttle = 300;
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = '';

  // tslint:disable-next-line:max-line-length
  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private _route: Router, private route: ActivatedRoute, private userService: UserService, private spinner: NgxSpinnerService, private translate: TranslateService, private _fb: FormBuilder) {
    this.maxDate = moment();
    this.page = 1;
  }

  ngOnInit() {
    this.zoom = 15;
    //create search FormControl
    this.searchControl = new FormControl();
    this.FormattedAddress = ''

    this.imagepath = environment.fileurl + '/'
    this.menutype = this.route.snapshot.paramMap.get("id");
    console.log("menutype: ", this.menutype)
    this.routeEvent(this._route)

    //get user details
    this.userdetail = JSON.parse(localStorage.getItem('currentuser')).user;
    this.profileImg = this.userdetail.profileimage;

    let dob = this.userdetail.dob ? this.userdetail.dob : null

    this.userform = this._fb.group({
      name: [this.userdetail.name, [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      email: [this.userdetail.email, [Validators.required, Validators.email]],
      phone: [this.userdetail.phone, [Validators.required, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
      city: [this.userdetail.city, [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      dob: [dob, [Validators.required]],
      address: [this.userdetail.address, [Validators.required, noOnlyWhitespaceValidator]],
      about: [this.userdetail.about, [Validators.required, noOnlyWhitespaceValidator]],
      pref_lang: [this.userdetail.pref_lang, [Validators.required]],
    })

    this.changepasswordform = this._fb.group({
      oldpassword: ['', [Validators.required, noOnlyWhitespaceValidator]],
      newpassword: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(6)]],
      confirmpassword: ['', [Validators.required, noOnlyWhitespaceValidator]]
    },
      {
        validator: MustMatch("newpassword", "confirmpassword")
      }
    )

    this.addressForm = this._fb.group({
      id: [-1],
      firstname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      lastname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      country: ['', [Validators.maxLength(25)]],
      phone: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
      city: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      pincode: [null, [Validators.pattern('^[0-9]{4,8}$')]],
      houseno: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      address: ['', [Validators.required, noOnlyWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]]
    })
    this.getAddress()
    this.getOrders()

    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
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

  getOrders() {
    this.spinner.show()
    //get user's orders
    this.userService.getOrders(this.userdetail.id, this.page).subscribe(
      response => {
        if (response.status && response.data != null && response.data.length > 0) {
          // response.data.forEach((ele, i) => {
          //   response.data[i].cart = JSON.parse(ele.cart)
          // })
          response.data.forEach(e => {
            this.userOrders.push(e)
          });
        }
      },
      err => {

      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  fileChangeEvent(event: any, field): void {
    this.showImagecropper = true;
    this.imageChangedEvent = event;
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.profilepic = dataURLtoFile(
      event.base64,
      this.imageChangedEvent.target.files[0].name
    )
  }


  routeEvent(router: Router) {

    this.Routersubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.menutype = this.route.snapshot.paramMap.get("id");
        console.log("menutype-test: ", this.menutype)
      }
    });
  }

  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }

  changeNav(type) {
    this.menutype = type;
  }

  onSubmitdetail() {

    if (!this.userform.valid)
      return;

    var formData = new FormData();
    Object.entries(this.userform.value).forEach(([key, value]: any[]) => {
      formData.set(key, value);
    });

    formData.set('profilepic', this.profilepic);
    formData.set('user_id', this.userdetail.id);

    formData.set('old_profile_img', this.userdetail.profileimage)

    if (moment(this.userform.value.dob.startDate).isValid)
      formData.set(
        "dob",
        moment(this.userform.value.dob.startDate).format("YYYY-MM-DD")
      );


    this.spinner.show()
    this.userService.updateprofile(formData).subscribe(
      data => {
        if (data.status) {
          localStorage.setItem('currentuser', JSON.stringify({ 'user': data.data }))
          this.profileImg = data.data.profileimage
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
          this.userService.Setuserdata()
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
      }
    ).add(() => {
      this.spinner.hide();
      this.showImagecropper = false;
    })
  }

  Changepassword() {
    if (!this.changepasswordform.valid)
      return

    let data = {
      user_id: this.userdetail.id,
      oldpassword: this.changepasswordform.get('oldpassword').value,
      newpassword: this.changepasswordform.get('newpassword').value
    }

    this.spinner.show()
    this.userService.changeUserPassword(data).subscribe(
      response => {
        if (response.status) {
          Swal.fire(Swaldata.SwalSuccessToast(response.msg))
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg))
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error))
      }
    ).add(() => {
      this.spinner.hide();
      this.changepasswordform.reset()
    })
  }

  getAddress() {
    this.userService.getAddress(this.userdetail.id).subscribe(
      data => {
        if (data.status && data.address.length > 0) {
          this.userAddress = [...data.address]

        }
      }
    )
  }

  addNewAddress() {
    this.addAddress = true
    this.resetAddressform()
    let userEmail = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')).user.email : ''
    this.addressForm.patchValue({
      email: userEmail
    })
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          let geocoder = new google.maps.Geocoder();
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
  onSubmitAddress() {

    if (!this.addressForm.valid)
      return

    if (this.lng == -1 || this.lat == -1 || this.FormattedAddress == '')
      return

    let data = this.addressForm.value
    if (data.id == null)
      data.id = -1
    data['user_id'] = this.userdetail.id;

    data['lat'] = this.lat;
    data['lng'] = this.lng;
    data['formattedAddress'] = this.FormattedAddress

    this.spinner.show()
    this.userService.addAddress(data).subscribe(
      response => {
        if (response.status) {
          Swal.fire(Swaldata.SwalSuccessToast(response.msg));
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
  }
  resetAddressform() {
    this.addressForm.reset()
    this.lat = -1
    this.lng = -1;
    this.FormattedAddress = ''
    // this.searchControl.setValue('')

  }

  chooseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, (results) => {
      if (results[0]) {
        this.searchElementRef.nativeElement.value = results[0].formatted_address
        this.FormattedAddress = results[0].formatted_address
      }
    });
  }

  editAddress(id) {
    this.resetAddressform()
    let data = this.userAddress.filter(ele => ele.id == id)
    if (data && data.length == 1) {
      let address = data[0];
      this.addressForm.patchValue({
        id: address['id'],
        firstname: address['firstname'],
        lastname: address['lastname'],
        country: address['country'],
        phone: address['phone'],
        city: address['city'],
        pincode: address['pincode'],
        houseno: address['houseno'],
        address: address['address'],
        email: address['email']
      })
      this.lat = address['lat']
      this.lng = address['lng']
      this.FormattedAddress = address['formattedAddress']
      this.searchControl.setValue(address['formattedAddress'])

      this.addAddress = true
    } else {
      Swal.fire(Swaldata.SwalErrorToast('something went wrong'))
    }
  }

  cancelAddressEdit() {
    this.resetAddressform();
    this.addAddress = false;
  }

  deleteAddress(id) {

    Swal.fire(Swaldata.SwalConfirm("Are you sure want to delete Address")).then((result) => {
      if (result.value) {
        //delete address
        this.spinner.show()
        this.userService.deleteAddress({ id, user_id: this.userdetail.id }).subscribe(
          data => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast(data.msg));
              this.userAddress = this.userAddress.filter(ele => ele.id != id)
            } else {
              Swal.fire(Swaldata.SwalErrorToast("Something went wrong"))
            }
          },
          err => {
            Swal.fire(Swaldata.SwalErrorToast("Something went wrong"))
          }
        ).add(() => {
          this.spinner.hide();
        })

      }
    })
  }

  onScrollDown() {
    this.page++
    this.getOrders();
    this.direction = 'down'
  }

  onUp() {
    this.direction = 'up';
  }
}
