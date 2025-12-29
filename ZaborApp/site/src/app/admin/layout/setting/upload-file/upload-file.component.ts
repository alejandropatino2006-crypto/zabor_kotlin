import { Component, OnDestroy } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { adminService } from 'src/app/shared/services/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnDestroy {

  files: any = [];
  userinfo: any;
  private _stop$: Subject<any>;
  description: any;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';


  constructor(
    public router: Router,
    private adminsService: adminService,
    private spinner: NgxSpinnerService
  ) {
    this._stop$ = new Subject();
  }

  uploadFile(eventTarget: EventTarget) {
    const event = (eventTarget as HTMLInputElement).files;
    console.log("event: ", this.files.length);
    if (this.files.length === 4) {
      return;
    }
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      if (element.name.substr(element.name.length - 3) == 'jpg' || element.name.substr(element.name.length - 3) === 'png') {
      } else {
        return
      }
      console.log("element: ", element);
      const reader = new FileReader();
      reader.onload = e => {
        this.files.push({
          name: element.name,
          src: reader.result,
          file: element
        })
      }
      reader.readAsDataURL(element);

    }
  }
  deleteAttachment(index) {
    this.files.splice(index, 1)
  }
  upload() {
    this.spinner.show()
    var formData = new FormData();
    formData.set('loggedInUser_Id', localStorage.getItem("currentUserId"))
    this.files.forEach((element, i) => {
      if (element.name.substr(element.name.length - 3) == 'jpg') {
        formData.append('file[]', element.file, 'image' + i + '.jpg');
      } else if (element.name.substr(element.name.length - 3) == 'png') {
        formData.append('file[]', element.file, 'image' + i + '.png');
      }
    });
    this.adminsService.uploadInvoiceImages(formData).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
    // this.gs.newPostData(this.description, this.files.length).subscribe((post: any) => {
    //   console.log("newPostData: ", post)
    //   this.uploadData = new FormData();
    //   console.log("files: ", this.files)
    //   this.files.forEach((element, i) => {
    //     if (element.name.substr(element.name.length - 3) == 'jpg') {
    //       if (i == 0) {
    //       this.uploadData.append('file[]', element.file, post.post._id + '.jpg');
    //       } else {
    //         this.uploadData.append('file[]', element.file, post.post._id + '-' + i + '.jpg');
    //       }
    //     } else if (element.name.substr(element.name.length - 3) == 'png') {
    //       if (i == 0) {
    //         this.uploadData.append('file[]', element.file, post.post._id + '.png');
    //       } else {
    //         this.uploadData.append('file[]', element.file, post.post._id + '-' + i + '.png');
    //       }
    //     } else if (element.name.substr(element.name.length - 4) == 'jpeg') {
    //       if (i == 0) {
    //         this.uploadData.append('file[]', element.file, post.post._id + '.jpeg');
    //       } else {
    //         this.uploadData.append('file[]', element.file, post.post._id + '-' + i + '.jpeg');
    //       }
    //     }
    //   });
    //   this.gs.newPost(this.uploadData).subscribe((res: any) => {
    //     console.log("res", res)
    //     this.router.navigate(['/dashboard'])
    //   })
    // })
  }
  ngOnDestroy(): void {
    this._stop$.next();
    this._stop$.complete();
  }
}
