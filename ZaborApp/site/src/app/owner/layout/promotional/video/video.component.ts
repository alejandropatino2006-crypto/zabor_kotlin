import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from "../../../../../environments/environment";
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { RestaurantService } from '../../../../shared/services/restaurant.service';
import { VideoProcessingService } from '../../../../shared/services/video-processing.service';
import * as moment from 'moment';
import { dataURLtoFile, defaultDropdownSettings } from "../../../../shared/helpers/commonFunctions";
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
declare var $: JQueryStatic;
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from 'src/app/shared/services/translation.service';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styles: ['.card{min-height:600px}', '.form-control[readonly]{background-color: #ffffff }']
})
export class VideoComponent implements OnInit {
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
  startDate;
  endDate;
  Adverts;
  ButtonTitle: string = "+ New Advert";
  advertId: any = -1;
  videoThumbnail: File = null;
  promoVideo: File = null;
  getVideoWhenEdit: string = "";
  getVideoThumbWhenEdit: string = "";
  popUpVideo: string = "";
  minDate: moment.Moment;
  currentLang: any;


  // tslint:disable-next-line:max-line-length
  constructor(public ngxSmartModalService: NgxSmartModalService, private videoService: VideoProcessingService, private _router: Router, private formBuilder: FormBuilder, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, public translation: TranslationService,
    private translate: TranslateService,private changeDetector: ChangeDetectorRef) {
    this.minDate = moment();
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
      responsive: true,
      language : (this.currentLang == "es")? DatatableLanguage.datatableSpanish: DatatableLanguage.datatableEnglish,
    };
    // stop playing the youtube video when I close the modal
    $('#videoModal').on('hide.bs.modal', function (e) {
      $("#video").attr('src', "");
    })


    this.fileUrl = environment.fileurl;
    this.advertForm = this.formBuilder.group({
      restaurant: ["", [Validators.required]],
      dateRange: ["", [Validators.required]],
      video: [null, Validators.required]
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
    this.restaurantService.getpromovideo().subscribe(
      response => {
        if (response.status) {
          this.Adverts = response.data;
          this.dtTrigger.next();
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Unable to get videos')));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Unable to get videos')));
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

  fileChangeEvent(event: any): void {
    // if (event.target.files && event.target.files.length > 0) {
    //   let file = event.target.files[0];
    //   // if (file.type != "video/mp4" || (file.size / 1024 / 1024) > 20) {
    //   //   Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Only allow Mp4 formate and Max size 20 mb")));
    //   //   return;
    //   // }
    //   this.promoVideo = file
    //   this.videoService.generateThumbnail(file).then(thumbnailData => {
    //     this.videoThumbnail = dataURLtoFile(thumbnailData, file.name);
    //   })
    // } else {
    //   this.promoVideo = null;
    //   this.videoThumbnail = null;
    // }
    this.promoVideo = event.target.file;
    this.videoService.generateThumbnail(event.target.file).then(thumbnailData => {
      this.videoThumbnail = dataURLtoFile(thumbnailData, event.target.file.name);
      this.advertForm.patchValue({
        video: event.target.file
      });
    })
  }


  editad(id) {
    this.resetForm();
    this.ButtonTitle = "+ "+this.translate.instant('New Promo Video');
    this.showAddform = true;
    //get advert of id
    this.spinner.show();
    this.restaurantService.getpromovideobyId(id).subscribe(
      response => {
        if (response.status) {
          const responseData = response.data;
          this.advertForm.patchValue({
            restaurant: responseData.restaurant_id,
            dateRange: { startDate: moment(responseData.start_date), endDate: moment(responseData.end_date) }
          });
          this.advertId = responseData.id;
          this.getVideoWhenEdit = responseData.video;
          this.getVideoThumbWhenEdit = responseData.video_thumb;
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

  }

  submitAdvert() {
    if (this.advertForm.invalid) {
      return;
    }
    if (this.videoThumbnail == null) {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Please choose a promo video ")));
      return;
    }

    this.spinner.show();
    if (moment(this.advertForm.value.dateRange.startDate).isValid)
      this.startDate = moment(this.advertForm.value.dateRange.startDate).format('YYYY-MM-DD');

    if (moment(this.advertForm.value.dateRange.endDate).isValid)
      this.endDate = moment(this.advertForm.value.dateRange.endDate).format('YYYY-MM-DD');

    var formData = new FormData();

    //create formdata
    formData.set('restaurant_id', this.advertForm.value.restaurant);
    formData.set('video', this.promoVideo);
    formData.set('start_date', this.startDate);
    formData.set('end_date', this.endDate);
    formData.set('advertId', this.advertId);
    formData.set('video_thumbnail', this.videoThumbnail);
    formData.set('delete_video', this.getVideoWhenEdit);
    formData.set('delete_video_thumb', this.getVideoThumbWhenEdit);

    this.restaurantService.addpromovideo(formData).subscribe(
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
      this.spinner.hide();
    })
  }

  resetForm() {
    this.advertForm.reset();
    this.startDate = "";
    this.endDate = "";
    this.advertId = -1;
    this.getVideoThumbWhenEdit = "";
    this.getVideoWhenEdit = "";
    this.ButtonTitle = "";
    this.showAddform = false;
  }

  deletead(advert_id) {
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("Are You sure?"))).then((result) => {
      if (result.value) {
        if (isNaN(advert_id)) {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Advert is invalid')));
          return;
        }
        this.spinner.show();
        this.restaurantService.deletePromoVideo(advert_id).subscribe(
          data => {
            if (data.status) {
              this.Adverts.forEach((element, i) => {
                if (element.id == advert_id)
                  this.Adverts.splice(i, 1);
              });

              Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant('Promotional Video delete succefully')));
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

  openModel(video) {
    $("#video").attr('src', this.fileUrl + '/' + video + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    (<any>$('#videoModal')).modal('show');
  }

  // Gets the video src from the data-src on each button

  changeStatus(event, id) {
    let status = (event == true) ? 1 : 0;
    let data = { status, id };
    this.spinner.show();
    this.restaurantService.changepromovideoStatus(data).subscribe(res => {
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

  handleFileSelection(selectedFile: File | null) {
    if (selectedFile) {
      // Handle the selected file here
      console.log('Selected file:', selectedFile.name, selectedFile.type);

      // You can perform actions here like:
      // - Uploading the file to a server
      // - Displaying a preview of the file (if applicable)
      // - Validating the file type or size
    }
  }







}
