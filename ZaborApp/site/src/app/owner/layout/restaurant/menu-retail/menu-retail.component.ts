import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { RestaurantService } from '../../../../shared/services/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { noOnlyWhitespaceValidator } from '../../../../shared/helpers/custom.validator';
import { dataURLtoFile, defaultDropdownSettings, cleanForm, toBase64 } from '../../../../shared/helpers/commonFunctions';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { TranslatePipe } from '@ngx-translate/core';

declare var $: JQueryStatic;
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { DropdownSettings } from 'angular2-multiselect-dropdown/lib/multiselect.interface';

@Component({
  selector: 'app-menu-retail',
  templateUrl: './menu-retail.component.html',
  // tslint:disable-next-line:max-line-length
  styles: [
    '.low-quantity{display: flex; color: blue; font-weight: bolder;}',
    '.zero-quantity{display: flex; color: red; font-weight: bolder;}',
    '.errorMenuItem{background-color: papayawhip; border: 0.5px solid red;}',
    '.activeGroup{background-color: papayawhip; font-weight: bolder;}',
    '.btn-div{padding: 10px 0.5rem;}',
    '.detailcard .menus{border-top: 1px solid #e8e0e0;}',
    '.detailcard .menus:first-child {border-top: none !important;}',
    '.dropdown-list {display: inline-block}',
    '.dropdown-list.tagToBody.animated.fadeIn {position: absolute; top: 38px; left: 0;}',
    '.menu-row-del{position: absolute; top: 10px; left: 0; margin: 12px 5px;}',
    '.menu-row{padding: 0 12px;}',
    '.upload-btn-wrapper {position: relative; overflow: hidden; display: inline-block;}',
    '.cus-btn {border: 2px solid #fdbd34; color: #ffffff; background-color: #fdbd34; padding: 0 10px; border-radius: 0.25rem; font-size: 17px; cursor: pointer;}',
  ],
  // styleUrls: ['./menu-retail.component.scss']
  styleUrls: ['../restaurant.component.scss', './menu-retail.component.scss'],
})
export class MenuRetailComponent implements OnInit {

  private static defaultStartTime = '01:00';
  private static defaultEndTime = '00:59';

  existingUpcNos: Set<string> = new Set();

  public UserhasRestaurant = false;
  public restaurantId: number;
  public groupList = [];
  // public items = [];
  public groupID = -1;
  public showItempic = [];
  public itemImagePath = environment.fileurl + '/';

  public showaddedit = true;
  public ShowDetail = false;
  public showcoustmization = false;

  public detailGroupName = '';
  public detailGroupMenuitems: Array<any> = [];

  public groupForm: FormGroup;
  public customizationGroup: FormGroup;
  public selectedItemCus = [];
  public customizationslist: Array<any> = [];
  public inventorylist: Array<any> = [];

  dropdownSettings: DropdownSettings = {
    ...defaultDropdownSettings,
    singleSelection: false,
    text: 'Select Customization',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: 'myclass custom-class',
    position: 'bottom',
    enableCheckAll: true,
  };

  public groupCustomizationOption: any;
  useOtherResmenu = false;
  RestaurantList: Array<any> = [];
  selectedRes = -1;

  openTimeForm: FormGroup;
  openTimeFormvalue: any = null;
  editMode = false;


  currentItemId = -1;
  currentItemName = '';

  @ViewChild('excelInput', {static: false}) excelInput: ElementRef;
  @ViewChild('quaexcelInput', {static: false}) quaexcelInput: ElementRef;

  public allowAdd = false;
  public enableAddForWorkingHoursOnly = false;

  @ViewChild('breadcrumbMenu', {static: false}) breadcrumbMenu: ElementRef<HTMLDivElement>;
  @ViewChild('buttonMenu', {static: false}) buttonMenu: ElementRef<HTMLButtonElement>;
  @ViewChild('saveBtn1', {static: false}) saveBtn1: ElementRef<HTMLButtonElement>;
  @ViewChild('foodTaxCheckbox', {static: false}) foodTaxCheckbox: ElementRef<HTMLInputElement>;
  scrollIndex = 1;

  private groupImageFile: File | undefined;
  showImagecropper = true;
  // restaurantImage = "";
  imageChangedEvent: any = null;
  croppedImage: any = '';
  base64GroupPic: any = '';
  dataUrlToFile = dataURLtoFile;

  maxDate = moment();

  isActive: boolean;
  collapsed: boolean;
  pushRightClass: string;
  @Output() collapsedEvent = new EventEmitter<boolean>();

  @ViewChild('menuTable', {static: false}) menuTable: ElementRef<HTMLTableElement>;

  constructor(
    private route: ActivatedRoute,
    private routingRouter: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private restaurantService: RestaurantService,
    private translate: TranslateService,
  ) {
    this.routingRouter.events.subscribe(val => {
      if (
        val instanceof NavigationEnd &&
        window.innerWidth <= 992 &&
        this.isToggled()
      ) {
        this.toggleSidebar();
      }
    });
  }

  get fg() {
    return this.groupForm as FormGroup;
  }

  get Items(): FormArray {
    return this.fg.get('items') as FormArray;
  }

  get Options(): FormArray {
    return this.customizationGroup.get('options') as FormArray;
  }

  private static isNullOrUndefinedExcplicitly(val) {
    return val == null || val === 'undefined' || val === 'null';
  }

  private static getDefaultValueIfNullOrUndefinedExcplicitly(val, defaultVal) {
    if (MenuRetailComponent.isNullOrUndefinedExcplicitly(val)) {
      return defaultVal;
    }
    return val;
  }

  uniqueUpcValidator(control: AbstractControl): { [key: string]: any } | null {
    const upcNo = control.value as string | null;
    return this.handleUpcNoChanged(upcNo);
  }

  getResGroup() {
    // get menu group list
    this.restaurantService.getgroupsofMenu(this.restaurantId)
      .subscribe(
        (data) => {
          if (data.status === 200) {
            this.groupList = data.data;
            this.UserhasRestaurant = true;
          } else {
            this.UserhasRestaurant = false;
            Swal.fire(Swaldata.SwalErrorToast(data.msg));
          }
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant('Something went wrong!')
            )
          );
          this.routingRouter.navigate(['/owner/restaurants/list']);
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  ngOnInit() {
    this.isActive = false;
    this.collapsed = false;
    this.pushRightClass = 'push-right';
    this.spinner.show();

    this.fetchExistingUpcNos();

    // get restaurant id
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get('id'), 10);

    this.getResGroup();

    this.groupForm = this.formBuilder.group({
      groupname: ['', [Validators.required, noOnlyWhitespaceValidator]],
      groupImage: [''],
      items: this.formBuilder.array(
        [this.createMenuItemGroup()],
        [Validators.required, Validators.minLength(1)]
      ),
    });

    this.customizationGroup = this.formBuilder.group({
      customize_id: [-1],
      name: ['', [Validators.required, noOnlyWhitespaceValidator]],
      max: [''],
      // type: [0, Validators.required],
      options: this.formBuilder.array(
        [this.createOptions()],
        [Validators.required, Validators.minLength(1)]
      ),
    });

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
    });


    this.allowAdd = false;
  }

  createOptions() {
    return this.formBuilder.group({
      itemid: [null],
      option_name: ['', [Validators.required, noOnlyWhitespaceValidator]],
      option_price: ['', [Validators.required]],
    });
  }

  createOptionsEdit(data) {
    return this.formBuilder.group({
      itemid: [data.id],
      option_name: [
        data.option_name,
        [Validators.required, noOnlyWhitespaceValidator],
      ],
      option_price: [data.option_price, [Validators.required]],
    });
  }

  createMenuItemGroup() {
    return this.formBuilder.group({
      item_id: [null],
      name: ['', [Validators.required, noOnlyWhitespaceValidator]],
      // price: ['', [Validators.required]],
      // price: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*(?:\\.\\d{1,2})?$')]],
      price: ['', [Validators.required, Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      itempic: [null],
      pic: [null, [Validators.required]],
      cus: [''],
      taxtype: ['' /*, [Validators.required]*/],
      // quantity: ['', [Validators.pattern('^[0-9]*[1-9][0-9]*$')]],
      quantity: ['', [Validators.required, Validators.pattern('^[1-9]\\d*$')]],
      // upc_no: ["", [Validators.required, this.uniqueUpcValidator.bind(this)]],
      upc_no: this.formBuilder.control(
        '',
        {
          validators: [Validators.required, this.uniqueUpcValidator.bind(this)],
          updateOn: 'blur',
        }
      ),
      min_qty: ['', [Validators.pattern('^[1-9]\\d*$')]],
      max_qty: ['', [Validators.pattern('^[1-9]\\d*$')]],
      vendor_cost: [null, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      item_des: ['', []],
      is_show: [false, []],
      is_food: [false, []],
      is_bar: [false, []],
      is_state: [false, []],
      is_city: [false, []],
      is_note: [false, []],
      printer_2: [false, []],
      printer_3: [false, []],
      printer_4: [false, []],
      printer_5: [false, []],
      printer_6: [false, []],
      printer_7: [false, []],
      is_new: [true, []],
      discount_type: ['PERCENTAGE', []],
      discount_amount: ['0', []],
      discount_period: ['', []],
      // ingredients: [[], []]
      points: [null, [Validators.pattern('^[1-9]\\d*$')]],
      price_2: [null, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      price_3: [null, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      price_4: [null, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      price_5: [null, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      is_reduced: [false, []],
      is_local: [false, []],
    });
  }

  // this.discountPeriodValidator.bind(this)


  createMenuItemGroupbyEdit(data) {
    console.log('data2: ', data);
    console.log('discount_period2 :', data.discount_period);
    let dateRange: any = '';
    if (data.discount_period != null) {
      const [startDateString, endDateString] = data.discount_period.split(' - ');
      dateRange = {
        startDate: new Date(startDateString),
        endDate: new Date(endDateString)
      };
    }

    let isShow = false;
    // let isDiscountValidationBound = false;
    if (data.is_show == null || data.is_show === 1) {
      isShow = true;
    }
    return this.formBuilder.group({
      item_id: [data.id],
      name: [data.item_name, [Validators.required]],
      // price: [data.item_price, [Validators.required]],
      // price: [data.item_price == null ? 0 : data.item_price, [Validators.required, Validators.pattern('^[1-9][0-9]*(?:\\.\\d{1,2})?$')]],
      price: [
        data.item_price == null ? 0 : data.item_price,
        [
          Validators.required,
          Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$'),
        ],
      ],
      itempic: [data.item_pic],
      pic: [],
      cus: [],
      taxtype: [data.taxtype /*, [Validators.required]*/],
      // quantity: [data.item_quantity == null ? 0 : data.item_quantity, [Validators.pattern('(?:0|^[0-9]*[1-9][0-9]*$)')]],
      quantity: [
        data.item_quantity == null ? 0 : data.item_quantity,
        [Validators.required, Validators.pattern('^[1-9]\\d*$')],
      ],
      upc_no: [data.upc_no, []],
      min_qty: [data.item_min_qty, [Validators.pattern('^[1-9]\\d*$')]],
      max_qty: [data.item_max_qty, [Validators.pattern('^[1-9]\\d*$')]],
      vendor_cost: [data.item_vendor_cost, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      item_des: [data.item_des, []],
      is_show: [isShow, []],
      is_food: [data.is_food, []],
      is_bar: [data.is_bar, []],
      is_state: [data.is_state, []],
      is_city: [data.is_city, []],
      is_note: [data.is_note, []],
      printer_2: [data.printer_2 === 1, []],
      printer_3: [data.printer_3 === 1, []],
      printer_4: [data.printer_4 === 1, []],
      printer_5: [data.printer_5 === 1, []],
      printer_6: [data.printer_5 === 1, []],
      printer_7: [data.printer_5 === 1, []],
      is_new: [false, []],
      discount_type: [data.discount_type, []],
      discount_amount: [data.discount_amount, []],
      discount_period: [dateRange, []],
      // ingredients: [data.ingredients, []],
      points: [data.points, [Validators.pattern('^[1-9]\\d*$')]],
      price_2: [data.price_2, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      price_3: [data.price_3, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      price_4: [data.price_4, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      price_5: [data.price_5, [Validators.pattern('^(?=.+)(?:[1-9]\\d*|0)?(?:\\.\\d{1,2})?$')]],
      is_reduced: [data.is_reduced, []],
      is_local: [data.is_local, []],
    });
  }

  // this.convertStringToDateRange(data.discount_period)
  // isDiscountValidationBound ?[this.discountPeriodValidator.bind(this)]:

  // convertStringToDateRange(inputString) {
  //   if (inputString != "") {
  //     const [startDateString, endDateString] = inputString.split(' - ');

  //     // Parse the start date and end date
  //     const startDate = new Date(startDateString);
  //     const endDate = new Date(endDateString);

  //     return {
  //       startDate: startDate,
  //       endDate: endDate
  //     }
  //   } else {
  //     return "";
  //   }
  // }

  // parseDiscountPeriodString(discountPeriodString: string): any {
  //   console.log("discountPeriodString: ", discountPeriodString);
  //   if (discountPeriodString !== "" && typeof discountPeriodString === "string") {
  //     console.log("coming inside 7");

  //     const [startDateString, endDateString] = discountPeriodString.split(" - ");
  //     const startDate = moment(startDateString, "YYYY-MM-DD HH:mm:ss");
  //     const endDate = moment(endDateString, "YYYY-MM-DD HH:mm:ss");

  //     return {
  //       startDate: startDate,
  //       endDate: endDate,
  //     };
  //   } if(
  //     discountPeriodString !== "" && typeof discountPeriodString !== "string"
  //   ){
  //     return discountPeriodString;
  //   }else {
  //     return "";
  //   }
  // }

  // discountPeriodValidator(control: AbstractControl): ValidationErrors | null {
  //   console.log("control: ", control);
  //   const value = control.value;
  //   console.log("value1dsdsds: ", value);
  //   if (value && (value.startDate && value.endDate)) {
  //     console.log("coming inside");
  //     // Concatenate start and end dates as needed (similar to previous code)
  //     const combinedString = this.getDiscountPeriodString(value); // Implement getDiscountPeriodString function
  //     control.setValue(combinedString); // Update the form control value

  //     return null;
  //   } else if (value) {
  //     console.log("coming inside2");
  //     //control.setValue(value);
  //     return null;
  //     //return { invalidPeriod: "Invalid discount period format" }; // Error if not a moment object
  //   }
  //   return null; // No error if empty
  // }

  // getDiscountPeriodString(value: any): string {
  //   if (value && value.startDate && value.endDate) {
  //     const startDateString = value.startDate.format("YYYY-MM-DD HH:mm:ss");
  //     const endDateString = value.endDate.format("YYYY-MM-DD HH:mm:ss");
  //     console.log("value inside: ", value);
  //     console.log("startDateString: ", startDateString);
  //     console.log("endDateString: ", endDateString);
  //     return startDateString + " - " + endDateString;
  //   } else {
  //     return ""; // Or handle the case where value is invalid
  //   }
  // }

  addOptions() {
    const fg = this.createOptions();
    this.Options.push(fg);
  }

  fetchExistingUpcNos() {
    // Replace with your logic to fetch existing UPC codes from the database
    // This example assumes you have a service that fetches data

    this.restaurantService.getExistingUpcNos().subscribe((existingUpcNosResponse) => {
      if (existingUpcNosResponse.status && existingUpcNosResponse.data.length > 0) {
        this.existingUpcNos = new Set(existingUpcNosResponse.data); // Update the existing UPC set
      }
    });
  }

  addItems() {
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.add('hidden');
    }
    this.groupCustomizationOption = [];
    const fg = this.createMenuItemGroup();
    this.Items.push(fg);
    // setTimeout(() => {
    //   // document.getElementById('addMoreBtnContainer').scrollIntoView();
    //   window.scrollTo(0, document.body.scrollHeight);
    // }, 500);
  }

  deleteItem(idx: number) {
    if (this.Items.value.length > 1) {
      delete this.showItempic[idx];
      this.showItempic.forEach((element, index) => {
        if (index > idx) {
          this.showItempic[index - 1] = element;
          delete this.showItempic[index];
        }
      });
      this.Items.removeAt(idx);
    }
  }

  deleteCustomizeOption(idx: number) {
    if (this.Options.value.length > 1) {
      this.Options.removeAt(idx);
    }
  }

  editsec() {
    this.ShowDetail = false;
    this.showcoustmization = false;
    this.showaddedit = true;
  }

  detailsec() {
    this.ShowDetail = true;
    this.showcoustmization = false;
    this.showaddedit = false;
  }

  customizesec() {
    this.ShowDetail = false;
    this.showcoustmization = true;
    this.showaddedit = false;
  }

  addgroup() {
    this.editsec();
    this.groupID = -1;
    this.resetForm();
    this.addItems();
  }

  resetForm() {
    this.showItempic = [];
    this.fg.reset();
    this.Items.clear();
    this.groupCustomizationOption = [];
  }

  resetCoustomizationForm() {
    this.customizationGroup.reset();
    this.Options.clear();
  }

  UploadExcel(e) {
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.add('hidden');
    }
    const validExts = new Array('.xlsx');

    if (e.target.files[0].length < 1) {
      return false;
    }

    const filename = e.target.files[0].name;
    const fileext = filename.substring(filename.lastIndexOf('.'));

    if (validExts.indexOf(fileext) < 0) {
      Swal.fire(
        Swaldata.SwalErrorToast(
          `Invalid file selected, valid files are of  ${validExts.toString()} types.`
        )
      );
      return false;
    }

    Swal.fire(Swaldata.SwalConfirm('Excel data will updated')).then(
      async (result) => {
        if (result.value) {
          await this.readExcel(e).then((r) => {
            console.log('r: ', r);
            // const excelDataColumns = r.columns;
            const excelDataRows = r.excelData;
            this.menuTable.nativeElement.tBodies[0].remove();
            const tbody = this.menuTable.nativeElement.createTBody();
            for (let i = 0; i < excelDataRows.length; i++) {
              const row = tbody.insertRow();
              for (let j = 0; j < excelDataRows[i].length; j++) {
                row.insertCell(j).textContent = excelDataRows[i][j];
              }
            }
            // this.spinner.show();
            // this.restaurantService.uploadmenu({
            //   result: r,
            //   res_id: this.restaurantId,
            //   loggedInUser_Id: localStorage.getItem('currentUserId'),
            // })
            //   .subscribe(
            //     (data) => {
            //       if (data.status) {
            //         Swal.fire(Swaldata.SwalSuccessToast(data.msg));
            //       } else {
            //         Swal.fire(Swaldata.SwalErrorToast(data.msg));
            //       }
            //     },
            //     (err) => {
            //       Swal.fire(Swaldata.SwalErrorToast(err));
            //     }
            //   )
            //   .add(() => {
            //     this.excelInput.nativeElement.value = null;
            //     this.spinner.hide();
            //     this.getResGroup();
            //   });
          });
        } else {
          this.excelInput.nativeElement.value = null;
        }
      }
    );
    return true;
  }

  editGroup(id) {
    this.onPageSectionChanged();
    this.editsec();
    if (id < 1) {
      return;
    }
    this.spinner.show();
    this.groupID = id;
    this.resetForm();
    // get group detail and its list;
    this.restaurantService.getGroup(this.restaurantId, this.groupID)
      .subscribe(
        (data) => {
          console.log('getGroup: ', data);
          if (data.status) {
            this.openTimeForm.patchValue({
              monopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.monopen_time, MenuRetailComponent.defaultStartTime),
              monclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.monclose_time, MenuRetailComponent.defaultEndTime),
              tueopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.tueopen_time, MenuRetailComponent.defaultStartTime),
              tueclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.tueclose_time, MenuRetailComponent.defaultEndTime),
              wedopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.wedopen_time, MenuRetailComponent.defaultStartTime),
              wedclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.wedclose_time, MenuRetailComponent.defaultEndTime),
              thuopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.thuopen_time, MenuRetailComponent.defaultStartTime),
              thuclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.thuclose_time, MenuRetailComponent.defaultEndTime),
              friopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.friopen_time, MenuRetailComponent.defaultStartTime),
              friclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.friclose_time, MenuRetailComponent.defaultEndTime),
              satopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.satopen_time, MenuRetailComponent.defaultStartTime),
              satclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.satclose_time, MenuRetailComponent.defaultEndTime),
              sunopen_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.sunopen_time, MenuRetailComponent.defaultStartTime),
              sunclose_time: MenuRetailComponent.getDefaultValueIfNullOrUndefinedExcplicitly(data.group.sunclose_time, MenuRetailComponent.defaultEndTime),
            });
            this.openTimeFormvalue = this.openTimeForm.value;
            this.checkAllowAdd();
            this.selectedItemCus = [];
            this.groupID = data.group.id;
            this.fg.patchValue({
              groupname: data.group.group_name,
              groupImage: data.group.group_image,
            });

            this.groupCustomizationOption = [];

            data.cus.forEach((ele) => {
              this.groupCustomizationOption.push({
                id: ele.id,
                itemName: ele.name,
              });
            });

            // console.log('checking', data.menuitems.filter(d => d.item_name === 'Filete de Mero')[0]); // debugging of validation bug (quantity null in database)
            data.menuitems.forEach((element, index) => {
              if (element.item_pic !== 'null' && element.item_pic) {
                this.showItempic[index] = this.itemImagePath + element.item_pic;
              }
              const fg = this.createMenuItemGroupbyEdit(element);
              this.Items.push(fg);

              if (element.customizations && element.customizations !== 'null') {
                const temp = [];
                element.customizations.split(',').forEach((ele) => {
                  let cusId = parseInt(ele, 10);
                  temp.push({
                    id: cusId,
                    itemName: this.getCusName(cusId),
                  });
                });
                // this.selectedItemCus.push(temp);
                setTimeout(() => {
                  temp.forEach((ele) => {
                    this.selectedItemCus.push({'id': ele.id, 'itemName': ele.itemName});
                  });
                }, 200);
              } else {
                this.selectedItemCus.length = 0;
              }
            });
          } else {
            Swal.fire(
              Swaldata.SwalErrorToast(
                this.translate.instant('Something went wrong!')
              )
            );
          }
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant('Something went wrong!')
            )
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  deleteallmenu() {
    this.onPageSectionChanged();
    // confirm to remove group
    Swal.fire(
      Swaldata.SwalConfirm(
        this.translate.instant('All Groups and their data will deleted')
      )
    ).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.restaurantService.deleteallmenu(this.restaurantId)
          .subscribe(
            (data) => {
              if (data.status) {
                Swal.fire(Swaldata.SwalSuccessToast(data.msg));
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
            this.getResGroup();
          });
      }
    });
  }

  getCusName(id) {
    let name = '';
    this.groupCustomizationOption.forEach((ele) => {
      if (ele.id === id) {
        name = ele.itemName;
      }
    });
    return name;
  }

  fileChangeEvent(event, controlId) {
    this.fg.value.items[controlId].itempic = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) =>
      (this.showItempic[controlId] = e.target.result);

    reader.readAsDataURL(event.target.files[0]);
  }

  onSubmit() {
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.add('hidden');
    }
    this.saveBtn1.nativeElement.removeAttribute('data-balloon-visible');
    this.saveBtn1.nativeElement.removeAttribute('aria-label');
    // this.logFormErrors();
    if (!this.fg.valid) {
      return;
    }

    if (this.openTimeFormvalue == null) {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Please fill opening and closing hours')));
      this.availableTime();
      return;
    }

    cleanForm(this.fg);

    this.spinner.show();

    const formValue = this.fg.value;
    formValue['resid'] = this.restaurantId;
    formValue['groupId'] = this.groupID;

    console.log('formValue: ', formValue);

    const formData = new FormData();
    if (this.openTimeFormvalue == null) {
      // bug fix - on update the timings fields in database are set to undefined
      this.openTimeFormvalue = this.openTimeForm.value;
    }
    console.log('openTimeFormvalue: ', this.openTimeFormvalue);
    if (this.openTimeFormvalue != null) {
      Object.entries(this.openTimeFormvalue).forEach(([key, value]: any[]) => {
        formData.set(key, value);
      });
    }
    Object.entries(formValue).forEach(([key, value]: any[], index) => {
      if (key === 'items') {
        // value = form array of items
        value.map((itemObj, itemIndex) => {
          console.log('itemObj: ', itemObj);
          console.log('itemIndex: ', itemIndex);
          itemObj.name = itemObj.name.trim();
          if (itemObj.cus == null || itemObj.cus.length < 1) {
            itemObj.cus = null;
          } else {
            const temp = [];
            itemObj.cus.forEach((ele) => {
              temp.push(ele.id);
            });
            itemObj.cus = temp.join();
          }
          itemObj.quantity =
            itemObj.quantity != null &&
            itemObj.quantity !== 'null' &&
            itemObj.quantity !== ''
              ? itemObj.quantity
              : null;

          itemObj.min_qty =
            itemObj.min_qty != null &&
            itemObj.min_qty !== 'null' &&
            itemObj.min_qty !== ''
              ? itemObj.min_qty
              : null;

          itemObj.max_qty =
            itemObj.max_qty != null &&
            itemObj.max_qty !== 'null' &&
            itemObj.max_qty !== ''
              ? itemObj.max_qty
              : null;

          if (itemObj.is_show) {
            itemObj.is_show = 1;
          } else {
            itemObj.is_show = 0;
          }
          if (itemObj.is_food) {
            itemObj.is_food = 1;
          } else {
            itemObj.is_food = 0;
          }
          if (itemObj.is_bar) {
            itemObj.is_bar = 1;
          } else {
            itemObj.is_bar = 0;
          }
          if (itemObj.is_state) {
            itemObj.is_state = 1;
          } else {
            itemObj.is_state = 0;
          }
          if (itemObj.is_city) {
            itemObj.is_city = 1;
          } else {
            itemObj.is_city = 0;
          }
          if (itemObj.is_note) {
            itemObj.is_note = 1;
          } else {
            itemObj.is_note = 0;
          }
          itemObj.printer_2 = !!itemObj.printer_2 ? 1 : 0;
          itemObj.printer_3 = !!itemObj.printer_3 ? 1 : 0;
          itemObj.printer_4 = !!itemObj.printer_4 ? 1 : 0;
          itemObj.printer_5 = !!itemObj.printer_5 ? 1 : 0;
          itemObj.printer_6 = !!itemObj.printer_5 ? 1 : 0;
          itemObj.printer_7 = !!itemObj.printer_5 ? 1 : 0;
          itemObj.discount_type =
            itemObj.discount_type != null &&
            itemObj.discount_type !== 'null' &&
            itemObj.discount_type !== ''
              ? itemObj.discount_type
              : 'PERCENTAGE';
          itemObj.discount_amount =
            itemObj.discount_amount != null &&
            itemObj.discount_amount !== 'null' &&
            itemObj.discount_amount !== ''
              ? itemObj.discount_amount
              : 0;

          // itemObj.ingredients =
          // itemObj.ingredients.length !== 0
          //   ? itemObj.ingredients
          //   : [];

          if (itemObj.discount_period != null &&
            itemObj.discount_period !== 'null' &&
            itemObj.discount_period !== '') {
            itemObj.discount_period = `${moment(itemObj.discount_period.startDate).toISOString()} - ${moment(itemObj.discount_period.endDate).toISOString()}`;
          } else {
            itemObj.discount_period = '';
          }
          itemObj.is_reduced = itemObj.is_reduced ? 1 : 0;
          itemObj.is_local = itemObj.is_local ? 1 : 0;
          console.log('itemObj.discount_period: ', itemObj.discount_period);
        });
        formData.set(key, JSON.stringify(value));
        console.log('value: ', value);
        // console.log("formData: ", formData)
      } else {
        typeof value === 'string'
          ? formData.set(key, value.trim())
          : formData.set(key, value);
      }
    });

    this.fg.value.items.forEach((element, index) => {
      if (element.itempic != null && element.itempic !== 'null') {
        // bug fix - element.itempic can also contain string value null
        formData.set('itemPic_' + index, element.itempic);
      }
    });

    if (this.groupImageFile != null) {
      formData.delete('groupImage');
      formData.set(`group_image`, this.groupImageFile);
    } else {
      formData.delete('groupImage');
      formData.set(`group_image`, String(this.fg.get('groupImage').value));
    }

    // this.logAllFormData(formData);
    this.restaurantService.createGroup(formData)
      .subscribe(
        (data) => {
          console.log('datares: ', data);
          if (data.status === true || data.status === 200) {
            const tmpGroupId = this.groupID;
            this.addgroup();
            if (this.groupID === -1) {
              this.groupList = data.groups;
              this.editGroup(tmpGroupId);
            }
            this.imageChangedEvent = null;
            Swal.fire(
              Swaldata.SwalSuccessToast(
                this.translate.instant('Successfully') +
                ` ${tmpGroupId === -1 ? 'inserted' : 'updated'}`
              )
            );
          } else {
            Swal.fire(
              Swaldata.SwalErrorToast(
                this.translate.instant('Something went wrong!')
              )
            );
          }
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant('Something went wrong!')
            )
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  deleteGroupbymenu(id) {
    this.onPageSectionChanged();
    // this.groupID = id;
    this.deleteGroup(id);
  }

  deleteGroup(gid) {
    this.onPageSectionChanged();
    // if (gid != this.groupID)
    //   return;

    // confirm to remove group
    Swal.fire(
      Swaldata.SwalConfirm(
        this.translate.instant('All Group data will deleted')
      )
    ).then((result) => {
      if (result.value && !isNaN(gid)) {
        // delete group here
        this.spinner.show();
        this.restaurantService.deletegroup(this.restaurantId, gid)
          .subscribe(
            (data) => {
              if (data.status === 200) {
                this.addgroup();
                this.groupList = data.groups;
                Swal.fire(
                  Swaldata.SwalSuccessToast(
                    this.translate.instant('Group deleted successfully')
                  )
                );
              } else {
                Swal.fire(
                  Swaldata.SwalErrorToast(
                    this.translate.instant('Something went wrong!')
                  )
                );
              }
            },
            (error) => {
              Swal.fire(
                Swaldata.SwalErrorToast(
                  this.translate.instant('Something went wrong!')
                )
              );
            }
          )
          .add(() => {
            this.spinner.hide();
          });
      }
    });
  }

  detailGroup(gid) {
    this.onPageSectionChanged();
    this.detailsec();
    this.groupID = gid;
    this.resetForm();
    this.spinner.show();
    this.restaurantService.getGroup(this.restaurantId, this.groupID)
      .subscribe(
        (data) => {
          if (data.status === 200) {
            this.detailGroupName = data.group.group_name;
            this.detailGroupMenuitems = data.menuitems;
          } else {
            Swal.fire(Swaldata.SwalErrorToast(data.msg));
          }
        },
        (error) => {
          Swal.fire(Swaldata.SwalErrorToast(error));
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  customize(id) {
    this.onPageSectionChanged();
    this.customizesec();
    this.resetCoustomizationForm();
    this.addOptions();
    this.groupID = id;
    // get customizaions
    this.spinner.show();
    this.restaurantService.getInventoryList(this.restaurantId).subscribe(
      (data) => {
        if (data.status) {
          this.inventorylist = data.inventories;
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      }
    );
    this.restaurantService.getCustomization(this.restaurantId, id)
      .subscribe(
        (data) => {
          // console.log("data1: ", data);
          // console.log("discount_period1 :", data.discount_period);
          this.customizationslist = [];
          if (data.status === 200) {
            this.customizationslist = [...data.customizations];
            console.log('customizationslist: ', this.customizationslist);
            this.detailGroupName = data.group.group_name;
          } else {
            Swal.fire(
              Swaldata.SwalErrorToast(
                this.translate.instant('Something went wrong')
              )
            );
          }
        },
        (err) => {
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  onSubmitCustomization() {
    if (!this.customizationGroup.valid) {
      return;
    }
    const formValue = {...this.customizationGroup.getRawValue()};

    const dataToSave = (({customize_id, name, max, options}) => ({
      customize_id,
      name,
      max,
      options,
      group_id: this.groupID,
    }))(formValue);
    console.log('submit: ', dataToSave);
    console.log('openTime: ', this.openTimeFormvalue);
    this.spinner.show();
    this.restaurantService.saveCustomizations(dataToSave)
      .subscribe(
        (data) => {
          if (data.status) {
            this.customizationslist = [...data.cus];
            console.log('onSubmitCustomization: ', this.customizationslist);
            Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          } else {
            Swal.fire(Swaldata.SwalErrorToast(data.msg));
          }
        },
        (err) => {
          Swal.fire(Swaldata.SwalErrorToast(err.message));
        }
      )
      .add(() => {
        this.spinner.hide();
        this.resetCoustomizationForm();
      });
  }

  editCustomization(id) {
    // get customization details
    this.spinner.show();
    this.restaurantService.getCustomizationDetail(id)
      .subscribe(
        (data) => {
          console.log('getCustomizationDetail: ', data);
          if (data.status) {
            this.resetCoustomizationForm();
            if (!data.customize[0].max) {
              data.customize[0].max = data.options.length;
            }
            this.customizationGroup.patchValue({
              customize_id: data.customize[0].id,
              name: data.customize[0].name,
              max: data.customize[0].max,
              // type: data.customize[0].type
            });

            data.options.forEach((element, index) => {
              const fg = this.createOptionsEdit(element);
              this.Options.push(fg);
            });
            this.editMode = true;
            console.log('editmode', this.editMode);
          }
        },
        (err) => {
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  deleteCustomization(id) {
    // confirm to remove group
    Swal.fire(
      Swaldata.SwalConfirm(
        this.translate.instant('All Customization data will deleted')
      )
    ).then((result) => {
      if (result.value && !isNaN(id)) {
        // delete group here
        this.spinner.show();
        this.restaurantService.deleteCustomization(this.restaurantId, id)
          .subscribe(
            (data) => {
              if (data.status) {
                this.customizationslist = this.customizationslist.filter(
                  (ele) => ele.id !== id
                );
                Swal.fire(
                  Swaldata.SwalSuccessToast(
                    this.translate.instant(
                      'Customization has been deleted successfully'
                    )
                  )
                );
              } else {
                Swal.fire(
                  Swaldata.SwalErrorToast(
                    this.translate.instant('Something went wrong!')
                  )
                );
              }
            },
            (error) => {
              Swal.fire(
                Swaldata.SwalErrorToast(
                  this.translate.instant('Something went wrong!')
                )
              );
            }
          )
          .add(() => {
            this.spinner.hide();
          });
      }
    });
  }

  addCus() {
    this.resetCoustomizationForm();
    this.addOptions();
  }

  usemenu() {
    this.useOtherResmenu = true;
    this.restaurantService.getrestaurantslist().subscribe((data) => {
      this.RestaurantList = data.data.filter((e) => e.id !== this.restaurantId);
    });
  }

  copymenu() {
    if (this.selectedRes === -1) {
      Swal.fire(
        Swaldata.SwalErrorToast(
          this.translate.instant('Please select a Restaurant')
        )
      );
      return;
    }

    Swal.fire(
      Swaldata.SwalConfirm(
        this.translate.instant(
          'All menus will be deleted and chosen Restaurant data will be replaced!'
        )
      )
    ).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.restaurantService.usemenu(this.selectedRes, this.restaurantId)
          .subscribe(
            (res) => {
              if (res.status) {
                Swal.fire(Swaldata.SwalSuccessToast(res.msg));
              } else {
                Swal.fire(Swaldata.SwalErrorToast(res.msg));
              }
            },
            (error) => {
              Swal.fire(
                Swaldata.SwalErrorToast(
                  this.translate.instant('Something went wrong')
                )
              );
            }
          )
          .add(() => {
            this.spinner.hide();
            this.getResGroup();
          });
      }
    });
  }

  uploadInvQuan(e) {
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.add('hidden');
    }
    const validExts = new Array('.xlsx');

    if (e.target.files[0].length < 1) {
      return false;
    }

    const filename = e.target.files[0].name;
    const fileext = filename.substring(filename.lastIndexOf('.'));

    if (validExts.indexOf(fileext) < 0) {
      Swal.fire(
        Swaldata.SwalErrorToast(
          this.translate.instant('Invalid file selected, valid files are of') +
          `  ${validExts.toString()} types.`
        )
      );
      return false;
    }

    Swal.fire(
      Swaldata.SwalConfirm(this.translate.instant('Excel data will update/overwrite existing data'))
    ).then(async (result) => {
      if (result.value) {
        await this.readExcel(e).then((r) => {
          this.spinner.show();
          this.restaurantService.uploadinvQua({
            result: r.exceldata,
            res_id: this.restaurantId,
            loggedInUser_Id: localStorage.getItem('currentUserId'),
          })
            .subscribe(
              (data) => {
                if (data.status) {
                  Swal.fire(Swaldata.SwalSuccessToast(data.msg));
                } else {
                  Swal.fire(Swaldata.SwalErrorToast(data.msg));
                }
              },
              (err) => {
                Swal.fire(Swaldata.SwalErrorToast(err));
              }
            )
            .add(() => {
              this.quaexcelInput.nativeElement.value = null;
              this.spinner.hide();
            });
        });
      } else {
        this.quaexcelInput.nativeElement.value = null;
      }
    });
    return true;
  }

  async readExcel(event) {
    const workbook = new Excel.Workbook();
    const target: DataTransfer = (event.target) as DataTransfer;
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    return await new Response(target.files[0]).arrayBuffer().then(function (data) {
      const excelData = [];
      return workbook.xlsx.load(data).then(function () {
        // play with workbook and worksheet now
        const worksheet = workbook.getWorksheet(1);
        worksheet.eachRow({includeEmpty: false}, function (row, rowNumber) {
          const item = [];
          row.eachCell({includeEmpty: true}, function (cell, colNumber) {
            item.push(cell.value);
          });
          excelData.push(item);
        });
        const columns = excelData.shift();
        return {
          columns,
          excelData,
        };
      });
    });
  }

  availableTime() {
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.add('hidden');
    }
    this.openTimeFormvalue = this.openTimeForm.value;
    ($('#openTimeModal') as any).modal('show');
  }

  showIngredientsModal(itemId, name) {
    console.log('item_id', itemId);
    this.currentItemId = itemId;
    this.currentItemName = name;
    // (<any>$("#inventoryModal")).data("item_id", itemId);
    ($('#inventoryModal') as any).modal('show');
    // (<any>$("#inventoryModal")).find("app-menu-inventory").attr("item_id", itemId);
  }

  copyTiming() {
    const opentime = this.openTimeForm.value.monopen_time;
    const closetime = this.openTimeForm.value.monclose_time;

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
    });
  }

  clearTimining(day) {
    this.openTimeForm.controls[day + 'open_time'].setValue('');
    this.openTimeForm.controls[day + 'close_time'].setValue('');
  }

  submitTimeform() {
    this.openTimeFormvalue = this.openTimeForm.value;
    ($('#openTimeModal') as any).modal('hide');
    setTimeout(() => {
      this.buttonMenu.nativeElement.click();
      this.saveBtn1.nativeElement.setAttribute(
        'aria-label',
        'Timing changes are still not saved! Save available times now!'
      );
      this.saveBtn1.nativeElement.setAttribute('data-balloon-visible', '');
      setTimeout(() => {
        this.saveBtn1.nativeElement.removeAttribute('data-balloon-visible');
        this.saveBtn1.nativeElement.removeAttribute('aria-label');
      }, 15000);
    }, 1000);
  }

  onBreadCrumbClicked(evt: MouseEvent) {
    evt.preventDefault();
    // let eventTarget = evt.target as HTMLElement;
    // while (eventTarget.tagName !== 'BUTTON') { eventTarget = eventTarget.parentElement; }
    // const button = eventTarget as HTMLButtonElement;
    // (button.nextElementSibling as HTMLDivElement).classList.remove('hidden');
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.toggle('hidden');
    }
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this.routingRouter.navigate(['owner', 'restaurants', 'list']);
  }

  handleTaxTypeChange(evt: Event) {
    const eventTarget = evt.target as HTMLSelectElement;
    this.foodTaxCheckbox.nativeElement.checked = eventTarget.value === 'food';
  }

  onPageSectionChanged() {
    if (this.breadcrumbMenu != null) {
      this.breadcrumbMenu.nativeElement.classList.add('hidden');
    }
    this.scrollIndex = 1;
  }

  handleItemsScrollClicked(evt: MouseEvent, direction: string) {
    evt.preventDefault();
    if (direction === 'up' && this.scrollIndex > 1) {
      this.scrollIndex--;
    }
    if (direction === 'down' && this.scrollIndex < this.Items.controls.length) {
      this.scrollIndex++;
    }
    (document.getElementById('item-sno-' + this.scrollIndex) as HTMLDivElement).scrollIntoView();
  }

  // tslint:disable-next-line:max-line-length
  private checkAllowAdd(/*timings: { thuopen_time: any; wedopen_time: any; friclose_time: any; friopen_time: any; monopen_time: any; sunclose_time: any; tueclose_time: any; satclose_time: any; monclose_time: any; tueopen_time: any; wedclose_time: any; sunopen_time: any; thuclose_time: any; satopen_time: any }*/) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const now = new Date();
    const currentDay = now.getDay();
    const dayName3 = days[currentDay].toLowerCase().substring(0, 3);
    let todayOpenTime: Date | null = null;
    let todayCloseTime: Date | null = null;
    Object.entries(this.openTimeForm.value).forEach(([key, value]: any[]) => {
      if (key.substring(0, 3) === dayName3) {
        const hr = +value.substring(0, 2);
        const mn = +value.substring(3);
        if (key.indexOf('open_time') > -1) {
          todayOpenTime = new Date(1970, 1, 1, hr, mn, 0, 0);
        }
        if (key.indexOf('close_time') > -1) {
          todayCloseTime = new Date(1970, 1, 1, hr, mn, 0, 0);
        }
      }
    });
    if (
      this.enableAddForWorkingHoursOnly &&
      todayOpenTime != null &&
      todayCloseTime != null
    ) {
      const currentTime = new Date(
        1970,
        1,
        1,
        now.getHours(),
        now.getMinutes(),
        0,
        0
      );
      this.allowAdd =
        currentTime.getTime() >= todayOpenTime.getTime() &&
        currentTime.getTime() <= todayCloseTime.getTime();
    } else {
      this.allowAdd = !this.enableAddForWorkingHoursOnly;
    }
  }

  async fileChangeEventCustom(event: any, field) {
    // this.showImagecropper = true;
    const eventTarget = event.target as HTMLInputElement;
    if (eventTarget.files && eventTarget.files.length === 1) {
      this.groupImageFile = eventTarget.files[0];
      this.base64GroupPic = await toBase64(this.groupImageFile);
      const base64File = this.dataUrlToFile(
        this.base64GroupPic,
        this.groupImageFile.name
      );
      this.fg.patchValue({
        groupImage: base64File,
      });
    }
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.fg.patchValue({
      groupImage: this.dataUrlToFile(
        event.base64,
        this.imageChangedEvent.target.files[0].name
      ),
    });
  }

  // form data debugging code
  private logAllFormData(formDataObj: FormData) {
    // @ts-ignore
    for (const pair of formDataObj.entries()) {
      console.log(`${pair[0]}, ${pair[1]}, ${typeof pair[1]}`);
    }
  }

  // form errors debugging code
  private logFormErrors() {
    const controls = this.fg.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        console.error(
          'control name: ',
          name,
          ', errors: ',
          controls[name].errors
        );
        if (name === 'items') {
          console.error((controls[name] as FormArray).length);
        }
      }
    }
  }

  createRange(n: number) {
    // return new Array(number);
    return new Array(n).fill(0)
      .map((_n, index) => index + 1);
  }

  // onItemSelect(item:any){
  //   // console.log(item);
  //   // console.log(this.selectedItemCus);
  //   setTimeout(() => {
  //     const selectListHtmlElementList = document.querySelector(".cuppa-dropdown ul")?.children;
  //     for (let i=0; i<selectListHtmlElementList.length; i++) {
  //       let checkbox = selectListHtmlElementList[i].children[0] as HTMLInputElement;
  //       let selectedText = selectListHtmlElementList[i].children[1].innerHTML;
  //       // checkbox.checked = selectedText.trim() === item.itemName.trim();
  //       checkbox.checked = this.selectedItemCus.some((e) => e.itemName.trim() === selectedText.trim());
  //       // if (selectedText.trim() !== item.itemName.trim()) {
  //       //   // selectListHtmlElementList[i].classList.remove("selected-item");
  //       //   selectListHtmlElementList[i].className = "pure-checkbox ng-star-inserted";
  //       // }
  //     }
  //   }, 200);
  // }

  private handleUpcNoChanged(upcNo: string | null) {
    // console.log("upcNo", upcNo);
    // console.log("this.existingUpcNos", this.existingUpcNos);
    if (upcNo != null && upcNo !== '') {
      if (upcNo.length < 4) {
        return {upcLength: 'UPC code must be longer than 4 characters'}; // Custom error key with clear message
      }

      // console.log("coming inside");
      if (upcNo !== '' && this.existingUpcNos.has(upcNo)) {
        // console.log("coming inside");
        return {uniqueUpc: 'UPC code already exists'}; // Custom error key
      }

      this.existingUpcNos.add(upcNo); // Add to existing UPC set for future checks
    }
    return null;
  }

  // onUpcNoKeyDown(target: EventTarget) {
  //   const upcNo = (target as HTMLInputElement).value;
  //   this.handleUpcNoChanged(upcNo);
  // }
  //
  // onUpcNoBlur(target: EventTarget) {
  //   const upcNo = (target as HTMLInputElement).value;
  //   this.handleUpcNoChanged(upcNo);
  // }

  getPrinterPurpose(index: number) {
    if (index === 0) {
      return 'Cashier';
    }
    if (index === 1) {
      return 'Kitchen';
    }
    if (index === 2) {
      return 'Admin';
    }
    return 'Bluetooth';
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedEvent.emit(this.collapsed);
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

}
