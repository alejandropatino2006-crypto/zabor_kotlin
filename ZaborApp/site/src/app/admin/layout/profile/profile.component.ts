import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { adminService } from "./../../../shared/services/admin.service";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from "../../../../environments/environment";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: ['.profileImage{ margin : 20px 0}', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid;}'],

})
export class ProfileComponent implements OnInit {
  ProfileForm: FormGroup;
  imagepath: string = "";
  private file: File | null = null;
  ProfileImage: string = "";

  dataURLtoFile: (dataurl: any, filename: any) => File;
  showImagecropper: Boolean = false;
  oldEmailAddress: String;



  constructor(private _router: Router, private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) {

  }


  ngOnInit() {
    this.dataURLtoFile = (dataurl, filename) => {

      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    }
    this.ProfileForm = this.formBuilder.group(
      {
        name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(40)]],
        email: ["", [Validators.required, Validators.email, Validators.maxLength(40)]],
        city: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
        address: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
        phone: ["", [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+')]],
        role: ["", Validators.required],
        profilepic: [null],
        id: ["", Validators.required]
      },
    );

    this.spinner.show();
    //get current user
    const UserID = localStorage.getItem('currentUserId');

    this.adminsService.getCurrentUser(UserID).subscribe(res => {

      if (res.status) {
        this.ProfileForm.patchValue({
          name: res.data.name,
          email: res.data.email,
          city: res.data.city,
          address: res.data.address,
          phone: res.data.phone,
          id: res.data.id,
          role: res.data.role
        });
        if (res.data.profileimage != null)
          this.ProfileImage = environment.fileurl + '/' + res.data.profileimage;

        this.oldEmailAddress = res.data.email

      } else {
        this._router.navigate(['dashboard']);
        Swal.fire(Swaldata.SwalErrorToast(res.msg));
      }

    },
      error => {
        this._router.navigate(['dashboard']);
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }).add(() => {
        this.spinner.hide();
      });


  }

  imageChangedEvent: any = '';
  croppedImage: any = '';

  fileChangeEvent(event: any, field): void {
    this.showImagecropper = true;
    this.imageChangedEvent = event;
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      // just checking if it is an image, ignore if you want
      if (!file.type.startsWith('image')) {
        this.ProfileForm.get(field).setErrors({
          required: true
        });
      } else {
        this.ProfileForm.patchValue({
          [field]: file
        });
      }
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.ProfileForm.patchValue({
      profilepic: this.dataURLtoFile(event.base64, this.imageChangedEvent.target.files[0].name)
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

  onSubmit() {
    if (this.ProfileForm.invalid) {
      return;
    }

    if (this.ProfileForm.get('email').value != this.oldEmailAddress) {
      Swal.fire({
        title: 'Are you sure want to update your email',
        text: "Next time you have to login with updated email address",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          this.SubmitForm();
        }
      });
    } else {
      this.SubmitForm();
    }
  }

  SubmitForm() {
    this.spinner.show();

    var formData = new FormData();
    Object.entries(this.ProfileForm.value).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    )

    this.adminsService.updateProfile(formData).subscribe(
      data => {
        this.showImagecropper = false;

        Swal.fire(Swaldata.SwalSuccessToast("Profile update SuccessFully"));
        //change profile image
        let loggedInUserdata = JSON.parse(localStorage.getItem('currentuser'));
        //change profile image
        if (data.data.profilepic != "") {
          this.ProfileImage = environment.fileurl + '/' + data.data.profilepic;
          loggedInUserdata.user.profileimage = data.data.profilepic;
        }
        loggedInUserdata.user.name = this.ProfileForm.get('name').value;
        localStorage.setItem('currentuser', JSON.stringify(loggedInUserdata));
        this.adminsService.Setuserdata();
      },
      error => {

        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

}
