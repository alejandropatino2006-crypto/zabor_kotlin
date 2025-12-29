import { Component, OnInit,ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from "../../../../../environments/environment";
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { RestaurantService } from '../../../../shared/services/restaurant.service';
import * as moment from 'moment';
import { dataURLtoFile, defaultDropdownSettings } from "../../../../shared/helpers/commonFunctions";
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../shared/services/translation.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';
import { FileChangeEvent } from '@angular/compiler-cli/src/perform_watch';

@Component({
  selector: 'app-advert',
  templateUrl: './advert.component.html',
  styles: ['.card{min-height:600px}', '.form-control[readonly]{background-color: #ffffff }', '#advert-image{width:100%}', 'td img{cursor: pointer;}', '.modal-content{border:none}']
})
export class AdvertComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();

  showAddform: boolean = false;
  advertForm: FormGroup;
  fileUrl: string = "";
  userid: Number = parseInt(localStorage.getItem("currentUserId"));
  restaurantList = [];
  dataURLtoFile = dataURLtoFile;
  showImagecropper: boolean = false;
  uploadedAdvertImage: any = "";
  startDate;
  endDate;
  Adverts;
  promoAdImage = "";
  ButtonTitle: string = "+ New Advert";
  advertId: any = -1
  minDate: moment.Moment;

  pic_url = environment.fileurl + '/';
  chooseFileText:string;
  currentLang: any;


  constructor(private _router: Router, private formBuilder: FormBuilder, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, public translation: TranslationService,
    private translate: TranslateService,private changeDetector: ChangeDetectorRef) {
    this.minDate = moment();
    this.chooseFileText = this.translate.instant('ChooseFile');
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang; // Get initial language

    this.translate.onLangChange.subscribe((newLang:any) => {
      this.currentLang = newLang.lang;
      // Perform actions on language change (e.g., update UI, reload data)
      console.log('Language changed to:', newLang);
      console.log('Language changed to:', newLang.lang);
      this.updateDtOptions();
    });

    this.dtOptions = {
      language : (this.currentLang == "es")? DatatableLanguage.datatableSpanish: DatatableLanguage.datatableEnglish,
    };

    this.fileUrl = environment.fileurl;
    this.advertForm = this.formBuilder.group({
      restaurant: ["", [Validators.required]],
      dateRange: ["", [Validators.required]],
      advertPic: [null, Validators.required]
    });

    //get restaurant lists of user
    this.spinner.show();
    this.restaurantService.getrestaurantslist().subscribe(
      response => {
        response.data.map(data => {
          this.restaurantList.push(data);
        });

      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }
    ).add(() => {
      this.spinner.hide();
    });
    // end Restaurant list

    // get advert list and show them
    this.spinner.show();
    this.restaurantService.getadvert().subscribe(
      response => {
        if (response.status) {
          this.Adverts = response.data;
          this.dtTrigger.next();
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Unable to get adverts')));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Unable to get adverts')));
      }
    ).add(() => {
      this.spinner.hide();
    })


  }

  updateDtOptions() {
    console.log("current lang in update options",this.currentLang)
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions",this.dtOptions.language)
    //this.changeDetector.detectChanges();
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any): void {
    this.showImagecropper = true;
    this.imageChangedEvent = event;
    this.advertForm.patchValue({
      advertPic: event.target.file,
    });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.uploadedAdvertImage = this.dataURLtoFile(event.base64, this.imageChangedEvent.target.files[0].name);
  }

  editad(id) {
    this.showAddform = true;
    this.ButtonTitle = "+ " + this.translate.instant('New Advert')
    //get advert of id
    this.spinner.show();
    this.restaurantService.getadvertbyId(id).subscribe(
      response => {
        if (response.status) {
          this.resetForm();
          const responseData = response.data;
          this.advertForm.patchValue({
            restaurant: responseData.restaurant_id,
            dateRange: { startDate: moment(responseData.start_date), endDate: moment(responseData.end_date) }
          });
          this.promoAdImage = this.fileUrl + "/" + responseData.pic;
          this.advertId = responseData.id;
        }
        else
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }
    ).add(() => {
      this.spinner.hide();
    })
  }

  addAd() {
    this.showAddform = false;
    this.resetForm();
    this.promoAdImage = "";

  }

  submitAdvert() {
    if (this.advertForm.invalid) {
      return;
    }

    if (this.uploadedAdvertImage == "" && this.advertId == -1) {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Please select advert image')));
      return;
    }

    this.spinner.show();
    if (moment(this.advertForm.value.dateRange.startDate).isValid)
      this.startDate = moment(this.advertForm.value.dateRange.startDate).format('YYYY-MM-DD');

    if (moment(this.advertForm.value.dateRange.endDate).isValid)
      this.endDate = moment(this.advertForm.value.dateRange.endDate).format('YYYY-MM-DD');

    const formData = new FormData();
    formData.set('restaurant_id', this.advertForm.value.restaurant);
    formData.set('start_date', this.startDate);
    formData.set('end_date', this.endDate);
    formData.set('advertPic', this.uploadedAdvertImage);
    formData.set('advertId', this.advertId);

    this.restaurantService.addAdvert(formData).subscribe(
      response => {
        if (response.status) {
          this.Adverts = response.data;

          Swal.fire(Swaldata.SwalSuccessToast(response.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
        this.spinner.hide();
      }
    ).add(() => {
      this.resetForm();
      this.spinner.hide();
    })
  }

  resetForm() {
    this.advertForm.reset();
    this.startDate = "";
    this.endDate = "";
    this.uploadedAdvertImage = "";
    this.showImagecropper = false;
    this.advertId = -1;
    this.promoAdImage = ""
  }

  deletead(advert_id) {
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("Are You sure?"))).then((result) => {
      if (result.value) {
        if (isNaN(advert_id)) {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Advert is invalid')));
          return;
        }
        this.spinner.show();
        this.restaurantService.deleteAdvert(advert_id).subscribe(
          data => {
            if (data.status) {
              this.Adverts.forEach((element, i) => {
                if (element.id == advert_id)
                  this.Adverts.splice(i, 1);
              });


              Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant('Advert deleted succefully')));
            }
            else {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went wrong!')));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went wrong!')));
          }
        ).add(() => {
          this.spinner.hide();
        })
      }
    })
  }

  changeStatus(event, id) {
    let status = (event == true) ? 1 : 0;
    let data = { status, id };
    this.spinner.show();
    this.restaurantService.changeadvertStatus(data).subscribe(res => {
      if (res.status)
        Swal.fire(Swaldata.SwalSuccessToast(res.msg));
      else
        Swal.fire(Swaldata.SwalErrorToast(res.msg));
    },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }).add(() => {
        this.spinner.hide();
      });
  }

  openModel(imgsrc) {
    $("#advert-image").attr('src', imgsrc);
    (<any>$('#advertModal')).modal('show');
  }
}
