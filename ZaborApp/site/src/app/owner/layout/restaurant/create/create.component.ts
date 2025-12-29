import { Component, NgZone, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { dataURLtoFile, defaultDropdownSettings, cleanForm, cityLists } from '../../../../shared/helpers/commonFunctions';
import { MapsAPILoader } from '@agm/core';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { Observable, of, Subscription } from 'rxjs';

declare var $: JQueryStatic;
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

interface IRestaurantCategories {
  id: number;
  name: string;
}

interface IRestaurantSubCategories {
  id: number;
  itemName: string;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styles: ['agm-map { height: 400px}', '.form-control[readonly]{background-color: #ffffff }', '.restaurantImage{ margin : 20px 0px}', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid;}'],
  styleUrls: ['../restaurant.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy {
  restaurantForm: FormGroup;
  openTimeForm: FormGroup;
  openTimeFormvalue: any = null

  imagepath: string = "";
  private file: File | null = null;
  restaurantImage: string = "";
  dataURLtoFile = dataURLtoFile;
  showImagecropper: Boolean = false;
  UserID: string | Blob;
  Categories: Array<IRestaurantCategories> = [];
  // Categories : Observable<IRestaurantCategories[]> = of([]);
  cat_id: number;
  subcategories: Array<IRestaurantSubCategories> = [];

  selectedSubcats = [];
  // dropdownSettings = defaultDropdownSettings;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'itemName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    defaultOpen: false,
    enableCheckAll: true,
    noDataAvailablePlaceholderText: "No sub-categories available"
  };
  subCategoriesIdsList: string;

  public lat: any = -1;
  public lng: any = -1;
  public zoom: any = -1;
  public searchControl: FormControl;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  public cityList: any = cityLists;

  destroyed = new Subject();
  // private restaurantNameSubscription: Subscription;

  get restaurantName(): FormControl {
    return this.restaurantForm.get('name') as FormControl;
  }


  // tslint:disable-next-line:max-line-length
  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private _router: Router, private formBuilder: FormBuilder, private restaurantService: RestaurantService, private spinner: NgxSpinnerService,private translate: TranslateService) {

  }

  chooseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, (results) => {
      if (results[0]) {
        this.searchElementRef.nativeElement.value = results[0].formatted_address

      }
    });
  }

  setLocation() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;

          let geocoder = new google.maps.Geocoder();
          geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, (results) => {
            if (results[0]) {
              this.searchElementRef.nativeElement.value = results[0].formatted_address
            }
          });

        },
      );

    };
  }

  ngOnInit() {
    this.zoom = 12;
    // create search FormControl
    this.searchControl = new FormControl();

    // load Places Autocomplete
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

        });
      });
    });

    this.restaurantForm = this.formBuilder.group({
      // name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      // name: [{ value: null, disabled: false }, { validators: Validators.compose([Validators.required, Validators.minLength(3), noOnlyWhitespaceValidator, Validators.maxLength(60)]), updateOn: 'blur' }],
      // name: [{ value: null, disabled: false }, [Validators.required, Validators.minLength(3), noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      // name: new FormControl({ value: null, disabled: false }, { validators: [Validators.required, Validators.minLength(3), noOnlyWhitespaceValidator, Validators.maxLength(60)], updateOn: 'blur' }),
      name: this.formBuilder.control(
        { value: null, disabled: false },
        {
          validators: [Validators.required, Validators.minLength(3), noOnlyWhitespaceValidator, Validators.maxLength(60)],
          updateOn: 'blur',
        }
      ),
      email: ["", [Validators.required, Validators.email]],
      description: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
      descriptiones: ["", [noOnlyWhitespaceValidator, Validators.maxLength(200)]],
      address: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
      status: [1, [Validators.required]],
      restaurantpic: [null, Validators.required],
      category: ["", Validators.required],
      subcategory: [null, []],
      city: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
      contact: ["", [Validators.required, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
      website: ['', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      avaragecost: ["", [Validators.maxLength(5), Validators.pattern('[0-9]+')]],
      cod: [1, [Validators.required]],
      min_order_value: ['', [Validators.required, Validators.min(0), Validators.pattern("[0-9+-]+")]],
      max_order_value: ['', [Validators.required, Validators.min(0), Validators.pattern("[0-9+-]+")]],
      cancel_charge: [5, [Validators.required, Validators.max(100), Validators.pattern("[0-9+-]+")]]
    }, { updateOn: 'blur' });

    this.openTimeForm = this.formBuilder.group({
      monopen_time: [''],
      monclose_time: [''],
      tueopen_time: [''],
      tueclose_time: [''],
      wedopen_time: [''],
      wedclose_time: [''],
      thuopen_time: [''],
      thuclose_time: [''],
      friopen_time: [''],
      friclose_time: [''],
      satopen_time: [''],
      satclose_time: [''],
      sunopen_time: [''],
      sunclose_time: [''],
    })
    //get current user
    this.UserID = localStorage.getItem('currentUserId');

    this.spinner.show();
    //get categories of restaurant
    this.restaurantService.getcategoriesofRestaurent().subscribe(
      data => {
        this.Categories = data.data;
        // this.spinner.hide();
      }, error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
        this._router.navigate(['/owner/restaurants']);
      }
    ).add(() => {
      this.spinner.hide();
      // this.restaurantNameSubscription = this.restaurantName.valueChanges.pipe(
      //     debounceTime(300),
      //     // untilDestroyed(this)
      //     takeUntil(this.destroyed)
      // ).subscribe((val: any) => {
      //   // name.setErrors(Validators.minLength(2)(name));
      //   console.log('TEST', val);
      //   this.restaurantName.clearValidators();
      //   this.restaurantName.updateValueAndValidity();
      // });
    });

  }

  ngOnDestroy(): void {
    // if (this.restaurantNameSubscription) { this.restaurantNameSubscription.unsubscribe(); }
    this.destroyed.next();
    this.destroyed.complete();
  }


  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any, field): void {
    this.showImagecropper = true;
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;

    this.restaurantForm.patchValue({
      restaurantpic: this.dataURLtoFile(event.base64, this.imageChangedEvent.target.files[0].name)
    });

  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  onItemSelect(item:any){
    console.log("selected cat", item);
    // this.selectedSubcats.push(item);
    console.log("selected subcats", this.selectedSubcats);
  }
  OnItemDeSelect(item:any){
    console.log("deselected cat", item);
    // this.selectedSubcats = this.selectedSubcats.filter((el) => el.id !== item.id);
    console.log("selected subcats", this.selectedSubcats);
  }
  onSelectAll(items: any){
    console.log("selected items", items);
    // this.selectedSubcats = [];
    // this.selectedSubcats.push(items);
  }
  onDeSelectAll(items: any){
    console.log("deselected items", items);
    // this.selectedSubcats = [];
  }
  getSubcats(eventTarget: EventTarget) {
    this.spinner.show();
    // this.cat_id = parseInt(this.restaurantForm.value.category);
    const categorySelectElem = eventTarget as HTMLSelectElement;
    this.cat_id = parseInt(categorySelectElem.value, 10);
    // this.subcategories = [];
    this.restaurantService.getsubcategory(this.cat_id).subscribe(response => {
      this.selectedSubcats = [];
      if (response.status) {
        if (response.data == null || !Array.isArray(response.data) || response.data.length === 0) {
          this.subcategories = [];
          Swal.fire(Swaldata.SwalErrorToast("No sub-categories found"));
        } else {
          this.subcategories = response.data.map(subcat => {
            return ({"id": subcat.id, "itemName": subcat.name});
          })
          this.dropdownSettings = Object.assign({}, this.dropdownSettings, { allowSearchFilter: false });
        }
      }
      else
        Swal.fire(Swaldata.SwalErrorToast(response.msg));
    }, error => {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      this._router.navigate(['/owner/restaurants']);
    }).add(() => {
      this.spinner.hide();
    })
  }

  onSubmit() {
    this.subCategoriesIdsList = "";
    if (this.restaurantForm.invalid) {
      return;
    }

    cleanForm(this.restaurantForm);

    if (this.openTimeFormvalue == null) {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Please fill opening and closing hours')))
      this.openModel();
      return;
    }

    if (this.lat == -1 || this.lng == -1) {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Location invalid")));
      return;
    }
    this.spinner.show();

    var formData = new FormData();
    Object.entries(this.restaurantForm.value).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    )

    Object.entries(this.openTimeFormvalue).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    )

    formData.set('created_by', this.UserID);
    formData.set('lat', this.lat);
    formData.set('lng', this.lng);

    this.selectedSubcats.map(selectedSubcat => {
      this.subCategoriesIdsList += selectedSubcat.id + ',';
    })

    formData.set('subcategory', this.subCategoriesIdsList.replace(/,\s*$/, ""));

    this.restaurantService.createRestaurant(formData).subscribe(
      data => {
        this.showImagecropper = false;
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
        this._router.navigate(['/owner/restaurants/list']);
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  openModel() {
    (<any>$('#openTimeModal')).modal('show');
  }

  submitTimeform() {
    this.openTimeFormvalue = this.openTimeForm.value;
    (<any>$('#openTimeModal')).modal('hide');
  }

  copyTiming() {
    let opentime = this.openTimeForm.get('monopen_time').value;
    let closetime = this.openTimeForm.get('monclose_time').value;

    this.openTimeForm.patchValue({
      monopen_time: opentime,
      monclose_time: closetime,
      tueopen_time: opentime,
      tueclose_time: closetime,
      wedopen_time: opentime,
      wedclose_time: closetime,
      thuopen_time: opentime,
      thuclose_time: closetime,
      friopen_time: opentime,
      friclose_time: closetime,
      satopen_time: opentime,
      satclose_time: closetime,
      sunopen_time: opentime,
      sunclose_time: closetime,
    })
  }

  clearTimining(day) {
    this.openTimeForm.controls[day + 'open_time'].setValue('');
    this.openTimeForm.controls[day + 'close_time'].setValue('');
  }



}
