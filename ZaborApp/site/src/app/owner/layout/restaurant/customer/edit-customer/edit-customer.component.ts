import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';
import { RestaurantService } from 'src/app/shared/services/restaurant.service';
import { noOnlyWhitespaceValidator } from '../../../../../shared/helpers/custom.validator';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
})
export class EditCustomerComponent implements OnInit, AfterViewInit {
  customerForm: FormGroup;
  restaurantId: number;
  customerId: number;

  @ViewChild('addressSearch') addressSearchRef: ElementRef;
  @ViewChild('physicalSearch') physicalSearchRef: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.restaurantId = +this.route.snapshot.paramMap.get('restid');
    this.customerId = +this.route.snapshot.paramMap.get('id');

    this.customerForm = this.fb.group({
      firstname: ['', [Validators.required, noOnlyWhitespaceValidator]],
      lastname: ['', [Validators.required, noOnlyWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', [Validators.required]],
      dob: ['', Validators.required],
      physical_address: [''],
      houseno: [''],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      beginning_points: [0],
      point_balance: [0],
      price_level: [1],
      discount_percent: [0],
      pref_lang: ['en'],
      status: ['1'],
    });

    this.loadCustomer();
  }

  ngAfterViewInit(): void {
    this.mapsAPILoader.load().then(() => {
      const addressAuto = new google.maps.places.Autocomplete(this.addressSearchRef.nativeElement, {
        types: ['address']
      });
      addressAuto.addListener("place_changed", () => {
        this.ngZone.run(() => {
          const place = addressAuto.getPlace();
          if (place && place.formatted_address) {
            this.customerForm.patchValue({ address: place.formatted_address });
          }
        });
      });

      const physicalAuto = new google.maps.places.Autocomplete(this.physicalSearchRef.nativeElement, {
        types: ['address']
      });
      physicalAuto.addListener("place_changed", () => {
        this.ngZone.run(() => {
          const place = physicalAuto.getPlace();
          if (place && place.formatted_address) {
            this.customerForm.patchValue({ physical_address: place.formatted_address });
          }
        });
      });
    });
  }

  loadCustomer(): void {
    this.spinner.show();
    this.restaurantService.getCustomer(this.customerId).subscribe(
      (response) => {
        if (response.status && response.data) {
          const mergedData = {
            ...response.data.customer,
            ...response.data.address,
          };
          if (mergedData.dob) {
            mergedData.dob = mergedData.dob.split('T')[0];
          }
          this.customerForm.patchValue(mergedData);
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Customer not found')));
          this.router.navigate([`/owner/restaurants/customer/${this.restaurantId}`]);
        }
      },
      () => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Error fetching customer')));
      }
    ).add(() => this.spinner.hide());
  }

  onSubmit(): void {
    if (this.customerForm.invalid) return;

    this.spinner.show();
    const formData = new FormData();
    Object.entries(this.customerForm.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.set(key, String(value));
      }
    });

    formData.set('customerId', this.customerId.toString());
    formData.set('restaurantId', this.restaurantId.toString());

    this.restaurantService.saveCustomer(formData).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
          this.router.navigate([`/owner/restaurants/customer/${this.restaurantId}`]);
        } else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }
      },
      () => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Error saving customer')));
      }
    ).add(() => this.spinner.hide());
  }
}
