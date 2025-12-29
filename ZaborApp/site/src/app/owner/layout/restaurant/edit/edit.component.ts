import {Component, NgZone, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator, validateTax } from "../../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from "../../../../../environments/environment";
import { dataURLtoFile, defaultDropdownSettings, cleanForm, cityLists } from "../../../../shared/helpers/commonFunctions";
import { MapsAPILoader } from '@agm/core';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import {TranslateService} from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';

declare var $: JQueryStatic;

const ALL_PAYMENT_OPTIONS = ['VISA', 'MASTER', 'ATM/Debit', 'CASH', 'NONE'] as const;
type PaymentCardType = typeof ALL_PAYMENT_OPTIONS[number];

interface IUploadedFileInfo {type: PaymentCardType; isCard: boolean; pic: File | null; imageFilename: string; imageSrc: string | null; isNew: boolean}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styles: ['agm-map { height: 400px}', '.form-control[readonly]{background-color: #ffffff }', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid; }'],
  styleUrls: ['../restaurant.component.scss']
})
export class EditComponent implements OnInit, OnDestroy, AfterViewInit {
  restaurantForm: FormGroup;
  openTimeForm: FormGroup;
  openTimeFormvalue: any = null

  // imagepath = "";
  private file: File | null = null;
  restaurantImage = "";
  imageChangedEvent: any = '';
  croppedImage: any = '';

  dataURLtoFile = dataURLtoFile;
  showImagecropper: Boolean = true;
  UserID: string | Blob;
  restaurantId;
  Categories: Array<any> = [];
  cat_id: number;
  subcategories: any = [];

  selectedSubcats = [];
  dropdownSettings = defaultDropdownSettings;
  subcategoriesName: string = "";

  lat;
  lng;
  zoom;
  public searchControl: FormControl;

  public cityList: any = cityLists;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  public symbolsInformation = [
    {code: 'USD', symbol: '$'},
    {code: 'EURO', symbol: '€'},
    {code: 'PESOS', symbol: 'Col$'},
  ];
  public currentCurrencyCode = 'USD';
  public currentCurrencySymbol = '$';

  public languageInformation = [
    {code: 'en', symbol: 'English'},
    {code: 'es', symbol: 'Spanish'},
  ];
  public currentLanguageCode = 'en';
  @ViewChild('saveBtn') saveBtn: ElementRef<HTMLButtonElement>;

  cardImagesOptions: string[] = [];
  cardImages: IUploadedFileInfo[] | undefined;
  cardImagesOriginalFilenames: string[] | undefined;
  public selectedCardForImage: PaymentCardType = 'NONE';
  @ViewChild('card_image_select') cardImagesSelect: ElementRef<HTMLSelectElement>;

  private restaurantImageFile: File | undefined;


  // tslint:disable-next-line:max-line-length
  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private route: ActivatedRoute, private _router: Router, private formBuilder: FormBuilder, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private translate: TranslateService) {
    this.cardImages = [];
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

  ngAfterViewInit(): void {
    if (this.cardImagesSelect != null && this.cardImagesSelect.nativeElement != null) {
      this.cardImagesSelect.nativeElement.value = 'NONE';
    }
  }

  ngOnInit() {
    for (const key of ALL_PAYMENT_OPTIONS) {
      if (key !== 'NONE') {
        this.cardImagesOptions.push(key);
        // const isCard = key !== 'CASH';
        // this.cardImages.push({
        //   type: key as unknown as PaymentCardType,
        //   isCard,
        //   pic: null,
        //   imageFilename: isCard ? 'Choose ' + key + ' Card Image' : 'Choose ' + key + ' Image',
        //   imageSrc: null,
        // });
      }
    }
    this.selectedCardForImage = 'NONE';

    this.reload(false);

    this.spinner.show();
    this.zoom = 15;

    this.restaurantForm = this.formBuilder.group(
      {
        name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
        email: ["", [Validators.required, Validators.email]],
        description: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
        descriptiones: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
        address: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
        status: [1, [Validators.required]],
        restaurantpic: [null],
        category: [null, [Validators.required]],
        subcategory: [null],
        convenience_fee_type: ["0"],
        convenience_fee: [0],
        food_tax: ["", [Validators.required, Validators.pattern('[0-9]?[0-9]?(\.[0-9][0-9]?)?'), validateTax, Validators.maxLength(5)]],
        drink_tax: ["", [Validators.required, Validators.pattern('[0-9]?[0-9]?(\.[0-9][0-9]?)?'), validateTax, Validators.maxLength(5)]],
        grand_tax: ["", [Validators.required, Validators.pattern('[0-9]?[0-9]?(\.[0-9][0-9]?)?'), validateTax, Validators.maxLength(5)]],
        delivery_charge: ["", [Validators.required, Validators.pattern('[0-9]?[0-9]?(\.[0-9][0-9]?)?'), validateTax, Validators.maxLength(5)]],
        driver_fee: ["", [Validators.required, Validators.pattern('[0-9]?[0-9]?(\.[0-9][0-9]?)?'), validateTax, Validators.maxLength(5)]],
        base_delivery_distance: ["", [Validators.required, Validators.min(0), Validators.pattern("^[0-9]*$")]],
        city: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        contact: ["", [Validators.required, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
        website: ['', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
        avaragecost: ["", [Validators.required, Validators.maxLength(5), Validators.pattern('[0-9]+')]],
        cod: [1, [Validators.required]],
        min_order_value: [0, [Validators.required, Validators.min(0), Validators.pattern("[0-9+-]+")]],
        max_order_value: [10000, [Validators.required, Validators.min(0), Validators.pattern("[0-9+-]+")]],
        cancel_charge: [5, [Validators.required, Validators.max(100), Validators.pattern("[0-9+-]+")]],
        currency_code: ['USD', [Validators.required, Validators.min(0), Validators.pattern(`(${this.symbolsInformation.map(s => s.code).join('|')})`)]],
        default_display_language_code: ['en', [Validators.required, Validators.min(0), Validators.pattern(`(${this.languageInformation.map(l => l.code).join('|')})`)]],
      },
    );
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
    //get categories of restaurant
    this.restaurantService.getcategoriesofRestaurent().subscribe(
      data => {
        this.Categories = data.data;
        this.spinner.hide();
      }, error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
        this._router.navigate(['/owner/restaurants']);
      }
    )
    //get restaurant id
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("id"), 10);
    localStorage.setItem('restaurantId', String(this.restaurantId));
    //get current user
    this.UserID = localStorage.getItem('currentUserId');

    //get restaurant
    this.loadData();

    //create search FormControl
    this.searchControl = new FormControl();

    //load Places Autocomplete
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

        });
      });
    });



  }

  getSubcat() {
    this.subcategories = [];
    this.selectedSubcats = [];
    this.spinner.show();
    this.cat_id = parseInt(this.restaurantForm.value.category);
    this.restaurantService.getsubcategory(this.cat_id).subscribe(response => {
      if (response.status) {
        const responseData = response.data;
        if (responseData.length > 0)
          responseData.map(subcat => {
            this.subcategories.push({ "id": subcat.id, "itemName": subcat.name })
          })
        // this.selectedSubcats = [];
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

  fileChangeEvent(event: any, field): void {
    this.showImagecropper = true;
    const eventTarget = event.target as HTMLInputElement;
    if (eventTarget.files && eventTarget.files.length === 1) {
      this.restaurantImageFile = eventTarget.files[0];
    }
    this.imageChangedEvent = event;

    setTimeout(() => {
      this.saveBtn.nativeElement.scrollIntoView();
      this.saveBtn.nativeElement.setAttribute('aria-label', 'Image changes are still not saved! Save changed images now!');
      this.saveBtn.nativeElement.setAttribute('data-balloon-visible', '');
      setTimeout(() => {
        this.saveBtn.nativeElement.removeAttribute('data-balloon-visible');
        this.saveBtn.nativeElement.removeAttribute('aria-label');
      }, 15000);
    }, 1000);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.restaurantForm.patchValue({
      restaurantpic: this.dataURLtoFile(event.base64, this.imageChangedEvent.target.files[0].name)
    });

  }
  onSubmit() {
    this.saveBtn.nativeElement.removeAttribute('data-balloon-visible');
    this.saveBtn.nativeElement.removeAttribute('aria-label');

    if (this.restaurantForm.invalid) {
      return;
    }
    // cleanForm(this.restaurantForm);
    this.spinner.show();

    const formData = new FormData();
    Object.entries(this.restaurantForm.value).forEach(
      ([key, value]: any[]) => {
        const val = typeof value === 'string' ? value.trim() : String(value).trim();
        formData.set(key, val);
      }
    );

    Object.entries(this.openTimeFormvalue).forEach(
      ([key, value]: any[]) => {
        const val = typeof value === 'string' ? value.trim() : String(value).trim();
        formData.set(key, val);
      }
    );

    formData.set("res_id", this.restaurantId);
    formData.set('lat', this.lat);
    formData.set('lng', this.lng);

    this.selectedSubcats.map(selectedSubcat => {
      this.subcategoriesName += selectedSubcat.id + ',';
    })

    formData.set('subcategory', this.subcategoriesName.replace(/,\s*$/, ""));

    // add payment card images to post data
    for (let i = 0; i < this.cardImages.length; i++) {
      const cardImage = this.cardImages[i];
      if (this.cardImagesOriginalFilenames.findIndex(f => f === cardImage.imageFilename) === -1) {
        formData.set(`pmtCardImageType_${i + 1}`, cardImage.type);
        formData.set(`pmtCardImage_${i + 1}`, cardImage.pic);
      }
    }

    if (this.restaurantImageFile != null) {
      formData.delete('restaurantpic');
      formData.set(`restaurantImage`, this.restaurantImageFile);
    }

    // save language
    formData.set(`dataDisplayLanguage`, this.currentLanguageCode);

    this.restaurantService.updateRestaurant(formData).subscribe(
      data => {
        if (data.status != false)
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
        else
          Swal.fire(Swaldata.SwalErrorToast(data.msg));

        // this._router.navigate(['/owner/restaurants/list']);
        this.reload();
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
    if (this.checkTimeForm()) {
      (<any>$('#openTimeModal')).modal('hide');
      setTimeout(() => {
        this.saveBtn.nativeElement.scrollIntoView();
        this.saveBtn.nativeElement.setAttribute('aria-label', 'Timing changes are still not saved! Save opening times now!');
        this.saveBtn.nativeElement.setAttribute('data-balloon-visible', '');
        setTimeout(() => {
          this.saveBtn.nativeElement.removeAttribute('data-balloon-visible');
          this.saveBtn.nativeElement.removeAttribute('aria-label');
        }, 15000);
      }, 1000);
    }
  }

  checkTimeForm() {
    //  console.error(this.openTimeFormvalue);
    return true;
  }

  copyTiming() {
    let opentime = this.openTimeForm.value.monopen_time;
    let closetime = this.openTimeForm.value.monclose_time;

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

  currencyChanged(evt: Event) {
    const eventTarget = evt.target as HTMLSelectElement;
    const currencyCodeSelected = eventTarget.value;
    this.restaurantForm.patchValue({
      currency_code: currencyCodeSelected
    });
    this.currentCurrencyCode = currencyCodeSelected;
    this.currentCurrencySymbol = this.symbolsInformation.find(i => i.code === currencyCodeSelected).symbol;
  }

  languageChanged(evt: Event) {
    const eventTarget = evt.target as HTMLSelectElement;
    this.currentLanguageCode = eventTarget.value;
    this.translate.use(this.currentLanguageCode);
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this._router.navigate(['owner', 'restaurants', 'list']);
  }

  private reload(doReload = true) {
    if (doReload) {
      this._router.navigate([this._router.url], {
        queryParams: {refresh: new Date().getTime()}
      });
      setTimeout(() => {
        this._router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            'refresh': null,
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
      }, 400);
      this.restaurantId = localStorage.getItem('restaurantId');
      this.loadData();
    } else {
      this._router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          'refresh': null,
        },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
    }
  }

  private loadData() {
    this.restaurantService.getRestaurant(this.restaurantId, this.UserID).subscribe(
      response => {
        console.log("getRes: ", response);
        if (response.status) {
          const responseData = response.data;
          const restaurantData = responseData.restaurantDetails;
          const subcatData = responseData.subcat;
          this.currentCurrencyCode = restaurantData.currency_code ? restaurantData.currency_code : 'USD';
          this.currentCurrencySymbol = this.symbolsInformation.find(i => i.code === this.currentCurrencyCode).symbol;

          this.restaurantForm.patchValue({
            name: restaurantData.name,
            email: restaurantData.email,
            description: restaurantData.description,
            descriptiones: restaurantData.description_es,
            address: restaurantData.address,
            status: restaurantData.status,
            category: restaurantData.category,
            convenience_fee: restaurantData.convenience_fee,
            convenience_fee_type: restaurantData.convenience_fee_type,
            food_tax: restaurantData.food_tax,
            grand_tax: restaurantData.grand_tax,
            drink_tax: restaurantData.drink_tax,
            delivery_charge: restaurantData.delivery_charge,
            base_delivery_distance: restaurantData.base_delivery_distance,
            driver_fee: restaurantData.driver_fee,
            city: restaurantData.city,
            contact: restaurantData.contact,
            website: restaurantData.website,
            avaragecost: restaurantData.avg_cost,
            cod: restaurantData.cod,
            min_order_value: restaurantData.min_order_value,
            max_order_value: restaurantData.max_order_value,
            cancel_charge: restaurantData.cancel_charge,
            currency_code: this.currentCurrencyCode,
            default_display_language_code: restaurantData.default_display_language_code
          });
          if (restaurantData.default_display_language_code !== 'en') {
            this.currentLanguageCode = restaurantData.default_display_language_code;
            this.translate.use(this.currentLanguageCode);
          }

          this.openTimeForm.patchValue({
            monopen_time: restaurantData.monopen_time,
            monclose_time: restaurantData.monclose_time,
            tueopen_time: restaurantData.tueopen_time,
            tueclose_time: restaurantData.tueclose_time,
            wedopen_time: restaurantData.wedopen_time,
            wedclose_time: restaurantData.wedclose_time,
            thuopen_time: restaurantData.thuopen_time,
            thuclose_time: restaurantData.thuclose_time,
            friopen_time: restaurantData.friopen_time,
            friclose_time: restaurantData.friclose_time,
            satopen_time: restaurantData.satopen_time,
            satclose_time: restaurantData.satclose_time,
            sunopen_time: restaurantData.sunopen_time,
            sunclose_time: restaurantData.sunclose_time,
          });

          this.restaurantImage = environment.fileurl + '/' + restaurantData.restaurantpic;
          this.cat_id = restaurantData.category;
          this.lat = restaurantData.latitude;
          this.lng = restaurantData.longitude;
          // set subcategories
          this.getSubcat();
          this.openTimeFormvalue = this.openTimeForm.value;

          if (subcatData[0]) {
            subcatData.map(subcat => { this.selectedSubcats.push({ "id": subcat.id, "itemName": subcat.name }); });
          }

          // load payment card images
          this.cardImagesOriginalFilenames = [];
          if (restaurantData.imagesUploadedInfo != null && 'paymentCardImages' in restaurantData.imagesUploadedInfo && restaurantData.imagesUploadedInfo.paymentCardImages.length > 0) {
            this.cardImages = restaurantData.imagesUploadedInfo.paymentCardImages.map(info => {
              this.cardImagesOriginalFilenames.push(info.imageFilename);
              // tslint:disable-next-line:max-line-length
              return {
                type: info.paymentCardType,
                isCard: info.paymentCardType !== 'CASH',
                pic: null,
                imageFilename: info.imageFilename,
                imageSrc: environment.fileurl + '/restaurantpic/pmtcards/' + info.imageFilename,
                isNew: false
              };
            });

            this.cardImages.forEach((info) => {
              this.cardImagesOptions.splice(this.cardImagesOptions.findIndex(opt => opt === info.type), 1);
            });

            if (this.cardImagesSelect != null && this.cardImagesSelect.nativeElement != null) {
              this.cardImagesSelect.nativeElement.value = 'NONE';
            }
          }
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Restaurant not found")));
          this._router.navigate(['/owner/restaurants/list']);
        }
      }, error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('restaurantId');
  }

  //============================== payment card images related ==============================

  // changeFile(file: File) {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = error => reject(error);
  //   });
  // }

  cardFileChangeEvent(evt: Event, type: PaymentCardType): void {
    const eventTarget = evt.target as HTMLInputElement;
    if (eventTarget.files && eventTarget.files.length > 0) {
      const uploadedFile = eventTarget.files[0];
      const uploadedFileInfo: IUploadedFileInfo = {
        type: 'NONE' as unknown as PaymentCardType,
        isCard: false,
        pic: uploadedFile,
        imageFilename: uploadedFile.name,
        imageSrc: null,
        isNew: false,
      };
      if (typeof (FileReader) !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          uploadedFileInfo.imageSrc = e.target.result as string;
        };
        reader.readAsDataURL(uploadedFile as unknown as Blob);
      }
      uploadedFileInfo.type = type as unknown as PaymentCardType;
      uploadedFileInfo.isCard = String(type) !== 'CASH';
      const idx = this.cardImages.findIndex(c => String(c.type) === String(type));
      uploadedFileInfo.isNew = this.cardImages[idx].isNew;
      this.cardImages[idx] = uploadedFileInfo;

      setTimeout(() => {
        this.saveBtn.nativeElement.scrollIntoView();
        this.saveBtn.nativeElement.setAttribute('aria-label', 'Image changes are still not saved! Save changed images now!');
        this.saveBtn.nativeElement.setAttribute('data-balloon-visible', '');
        setTimeout(() => {
          this.saveBtn.nativeElement.removeAttribute('data-balloon-visible');
          this.saveBtn.nativeElement.removeAttribute('aria-label');
        }, 15000);
      }, 1000);
    }
  }

  cardForImageSelected(evt: Event) {
    const eventTarget = evt.target as HTMLSelectElement;
    const selectedCardValue = eventTarget.value as unknown as PaymentCardType;
    if (selectedCardValue !== 'NONE') {
      this.selectedCardForImage = selectedCardValue;
    }
  }

  addCardImage(evt: MouseEvent) {
    evt.preventDefault();
    if (this.selectedCardForImage !== 'NONE') {
      const idx = this.cardImagesOptions.findIndex((option) => option === String(this.selectedCardForImage));
      const key = this.cardImagesOptions.splice(idx, 1)[0];
      const isCard = key !== 'CASH';
      this.cardImages.push({
        type: key as unknown as PaymentCardType,
        isCard,
        pic: null,
        imageFilename: isCard ? 'Choose ' + key + ' Card Image' : 'Choose ' + key + ' Image',
        imageSrc: null,
        isNew: true,
      });
      this.selectedCardForImage = 'NONE';
    }
  }

}
