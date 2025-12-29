import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { dataURLtoFile, defaultDropdownSettings } from "../../../../shared/helpers/commonFunctions";
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import {ActivatedRoute, Router} from '@angular/router';
import { environment } from "../../../../../environments/environment";
import { Lightbox } from 'ngx-lightbox';
import {ClientStorageService} from '../../../../shared/services/client-storage.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  @ViewChild('fileselector') fileselector: ElementRef<HTMLElement>;

  public fileurl: string = environment.fileurl;
  public res_id: number = parseInt(this.route.snapshot.paramMap.get("id"), 10);
  public token: string | null = null;
  public loggedInUser_Id = localStorage.getItem("currentUserId");
  public url: string = environment.apiUrl + "/user/gallaryImage?loggedInUser_Id=" + this.loggedInUser_Id + "&res_id=" + this.res_id;
  public resetVar = false;

  private _album: Array<any> = [];

  public galleryImages: Array<any> = [];

  afuConfig: {
    multiple: boolean;
    formatsAllowed: string;
    maxSize: number;
    uploadAPI: {
      url: string;
      headers: {
        Authorization: string;
      }
    };
    hideProgressBar: boolean;
    replaceTexts: {
      selectFileBtn: string,
      resetBtn: string,
      uploadBtn: string,
      dragNDropBox: string,
      attachPinBtn: string,
      afterUploadMsg_success: string,
      afterUploadMsg_error: string,
      sizeLimit: string
    }
  };

  // tslint:disable-next-line:max-line-length
  constructor(private _lightbox: Lightbox, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private route: ActivatedRoute, private clientStorage: ClientStorageService, private _router: Router,private translate: TranslateService) {
    this.token = this.clientStorage.retrieveToken();
    this.afuConfig = {
      multiple: true,
      formatsAllowed: ".jpg,.png,.jpeg",
      maxSize: 2,
      uploadAPI: {
        url: this.url,
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      },
      hideProgressBar: false,
      replaceTexts: {
        selectFileBtn: this.translate.instant('Select Files'),
        resetBtn: this.translate.instant('Reset'),
        uploadBtn: this.translate.instant('Upload'),
        dragNDropBox: this.translate.instant('Drag N Drop'),
        attachPinBtn: this.translate.instant('Attach Files...'),
        afterUploadMsg_success: this.translate.instant('Successfully Uploaded !'),
        afterUploadMsg_error: this.translate.instant('Upload Failed !'),
        sizeLimit: this.translate.instant('Size Limit')
      }
    };
  }

  ngOnInit() {
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));

    this.spinner.show();
    this.restaurantService.getGalleryImage(this.res_id).subscribe(
      data => {
        this.galleryImages = data.response;
        data.response.forEach(element => {
          let album = {
            src: this.fileurl + '/' + element.image
          }
          this._album.push(album);

        });
      },
      error => {

      }
    ).add(() => {
      this.spinner.hide();
    })
  }


  buttonclick() {
    let el: HTMLElement = this.fileselector.nativeElement;
    el.click();
  }

  DocUpload(event) {
    let response = JSON.parse(event.response);
    if (response.status) {
      Swal.fire(Swaldata.SwalSuccessToast(response.msg));
      this.galleryImages = response.data;
      response.data.forEach(element => {
        let album = {
          src: this.fileurl + '/' + element.image
        }
        this._album.push(album);
      });
    }
    this.resetVar = true;
  }

  deleteImage(id, index, img_path) {

    this.spinner.show();
    this.restaurantService.deletegalleryimage(id, this.res_id, img_path).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
          this.galleryImages.splice(index, 1);
          this._album.splice(index, 1);
        } else
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
      },
      error => {

      }
    ).add(() => {
      this.spinner.hide();
    })
  }

  open(index: number): void {
    // open lightbox
    this._lightbox.open(this._album, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this._router.navigate(['owner', 'restaurants', 'list']);
  }
}
