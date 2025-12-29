import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MapsAPILoader } from '@agm/core';

import { RestaurantService } from 'src/app/shared/services/restaurant.service';
import { MustMatch, noOnlyWhitespaceValidator } from '../../../../../shared/helpers/custom.validator';
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent implements OnInit, AfterViewChecked, AfterViewInit {
  customerForm: FormGroup;
  loggedInUser_Id = localStorage.getItem("currentUserId");
  restaurantId: number;

  @ViewChild('addressSearch') addressSearchElementRef: ElementRef;
  @ViewChild('physicalSearch') physicalSearchElementRef: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get('restid') || '0', 10);

    this.customerForm = this.formBuilder.group({
      firstname: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(255)]],
      lastname: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(255)]],
      phone: ["", [Validators.required, Validators.maxLength(15), Validators.minLength(8)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", Validators.required],
      address: ["", Validators.required],
      dob: ["", Validators.required],
      physical_address: [""],
      houseno: [""],
      city: ["", Validators.required],
      pincode: ["", Validators.required],
      country: ["", Validators.required],
      state: ["", Validators.required],
      beginning_points: [0, [Validators.min(0)]],
      point_balance: [0, [Validators.required, Validators.min(0)]],
      price_level: [1, [Validators.required, Validators.min(1)]],
      discount_percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      pref_lang: ["en", Validators.required],
      status: ["1", Validators.required],
    }, {
      validators: MustMatch("password", "confirmPassword")
    });
  }

  ngAfterViewInit(): void {
    this.mapsAPILoader.load().then(() => {
      const addressAuto = new google.maps.places.Autocomplete(this.addressSearchElementRef.nativeElement, {
        types: ['address']
      });

      addressAuto.addListener("place_changed", () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = addressAuto.getPlace();
          if (place && place.formatted_address) {
            this.customerForm.patchValue({ address: place.formatted_address });
          }
        });
      });

      const physicalAuto = new google.maps.places.Autocomplete(this.physicalSearchElementRef.nativeElement, {
        types: ['address']
      });

      physicalAuto.addListener("place_changed", () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = physicalAuto.getPlace();
          if (place && place.formatted_address) {
            this.customerForm.patchValue({ physical_address: place.formatted_address });
          }
        });
      });
    });
  }

  onSubmit() {
    if (this.customerForm.invalid) return;

    this.spinner.show();

    const formData = new FormData();
    Object.entries(this.customerForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.set(key, value.toString());
      }
    });

    formData.set('ownerUserId', this.loggedInUser_Id || '');
    formData.set('restaurantId', this.restaurantId.toString());
    formData.delete('confirmPassword');

    this.restaurantService.createCustomer(formData).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          this.router.navigate([`/owner/restaurants/customer/${this.restaurantId}`]);
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(
          this.translate.instant("There was a problem saving the customer.")
        ));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  get getPasswordErrors() {
    const control: AbstractControl = this.customerForm.controls['password'];
    const errors = control.errors;
    if (errors) {
      if (control.hasError('required')) return "required";
      if (control.hasError('minlength')) return "minlength";
      return "unknown";
    }
    return null;
  }

  ngAfterViewChecked() {
    console.log("Form Valid?", this.customerForm.valid);
    console.log("Form Errors:", this.customerForm.errors);
    Object.entries(this.customerForm.controls).forEach(([key, control]) => {
      console.log(`${key} => valid: ${control.valid}, value: "${control.value}"`);
    });
  }
}
