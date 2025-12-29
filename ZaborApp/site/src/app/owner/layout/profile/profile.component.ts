import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { UserService } from "../../../shared/services/user.service";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from "ngx-image-cropper";
import { environment } from "../../../../environments/environment";
import Swal from "sweetalert2";
import * as Swaldata from "../../../shared/helpers/swalFunctionsData";
import * as moment from "moment";
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { dataURLtoFile, toBase64 } from '../../../shared/helpers/commonFunctions';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styles: [
    ".profileImage{ margin: 20px 0px }",
    ".profile - pic - div{ width: 100px; height: 100px; border: 1px gray solid; }"
  ]
})
export class ProfileComponent implements OnInit {
  ProfileForm: FormGroup;
  imagepath: string = "";
  private file: File | null = null;
  ProfileImage: string = "";
  oldProfileImage: string = "";
  userRole: string = "";
  UserID;
  oldEmailAddress: String;
  dob: string = "";

  dataURLtoFile: (dataurl: any, filename: any) => File;
  showImagecropper: Boolean = false;
  maxDate: moment.Moment;

  constructor(
    private _router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService
  ) {
    this.maxDate = moment();
  }

  ngOnInit() {
    this.dataURLtoFile = (dataurl, filename) => {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    };
    this.ProfileForm = this.formBuilder.group({
      name: [
        "",
        [
          Validators.required,
          noOnlyWhitespaceValidator,
          Validators.maxLength(40)
        ]
      ],
      email: [
        "",
        [Validators.required, Validators.email, Validators.maxLength(40)]
      ],
      city: [
        "",
        [
          Validators.required,
          noOnlyWhitespaceValidator,
          Validators.maxLength(25)
        ]
      ],
      address: [
        "",
        [
          Validators.required,
          noOnlyWhitespaceValidator,
          Validators.maxLength(200)
        ]
      ],
      phone: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern("[0-9+-]+")
        ]
      ],
      about: [
        "",
        [
          Validators.required,
          noOnlyWhitespaceValidator,
          Validators.maxLength(200)
        ]
      ],
      dob: ["", [Validators.required]],
      profilepic: [null],
      close_shift_email: [
        "",
        [Validators.required, Validators.email, Validators.maxLength(40)]
      ],
    });

    this.spinner.show();
    //get current user
    this.UserID = parseInt(localStorage.getItem("currentUserId"));

    this.userService.getCurrentUser(this.UserID).subscribe(
      res => {
        if (res.status) {
          this.ProfileForm.patchValue({
            name: res.data.name,
            email: res.data.email,
            city: res.data.city,
            address: res.data.address,
            phone: res.data.phone,
            about: res.data.about,
            close_shift_email: res.data.close_shift_email
          });

          if (res.data.dob != null && moment(res.data.dob).isValid())
            this.ProfileForm.patchValue({
              dob: {
                startDate: moment(res.data.dob),
                endDate: moment(res.data.dob)
              }
            });

          this.userRole = res.data.role;
          if (res.data.profileimage != null) {
            this.ProfileImage = environment.fileurl + "/" + res.data.profileimage;
            this.oldProfileImage = res.data.profileimage;
          }

          this.oldEmailAddress = res.data.email;
        } else {
          this._router.navigate(["/owner/dashboard"]);
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went wrong')));
        }

      },
      error => {
        this._router.navigate(["/owner/dashboard"]);
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went wrong')));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  imageChangedEvent: any = "";
  croppedImage: any = "";
  private profileImageFile: File | undefined;
  base64GroupPic: any = '';
  dataUrlToFile = dataURLtoFile;


  async fileChangeEvent(event: any, field): Promise<void> {
    const eventTarget = event.target as HTMLInputElement;
    if (eventTarget.files && eventTarget.files.length === 1) {
      this.profileImageFile = eventTarget.files[0];
      this.base64GroupPic = await toBase64(this.profileImageFile);
      const base64File = this.dataUrlToFile(
        this.base64GroupPic,
        this.profileImageFile.name
      );
      // this.ProfileForm.patchValue({
      //   groupImage: base64File,
      // });
      if (!this.profileImageFile.type.startsWith("image")) {
        this.ProfileForm.get(field).setErrors({
          required: true
        });
      } else {
        this.ProfileForm.patchValue({
          // [field]: file,
          [field]: base64File,
        });
      }
    }
    this.showImagecropper = true;
    this.imageChangedEvent = event;

    // this.showImagecropper = true;
    // this.imageChangedEvent = event;
    // if (event.target.files && event.target.files.length) {
    //   const file = event.target.files[0];
    //   // just checking if it is an image, ignore if you want
    //   if (!file.type.startsWith("image")) {
    //     this.ProfileForm.get(field).setErrors({
    //       required: true
    //     });
    //   } else {
    //     this.ProfileForm.patchValue({
    //       [field]: file
    //     });
    //   }
    // }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.ProfileForm.patchValue({
      profilepic: this.dataURLtoFile(
        event.base64,
        this.imageChangedEvent.target.files[0].name
      )
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

    if (this.ProfileForm.get("email").value != this.oldEmailAddress) {
      Swal.fire({
        title: this.translate.instant("Are you sure want to update your email"),
        text: this.translate.instant("Next time you have to login with updated email address"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes"
      }).then(result => {
        if (result.value) {
          this.submitForm();
        }
      });
    } else {
      this.submitForm();
    }
  }

  submitForm() {
    this.spinner.show();

    var formData = new FormData();
    Object.entries(this.ProfileForm.value).forEach(([key, value]: any[]) => {
      formData.set(key, value);
    });
    formData.set("role", this.userRole);
    formData.set("id", this.UserID);

    if (moment(this.ProfileForm.value.dob.startDate).isValid)
      formData.set(
        "dob",
        moment(this.ProfileForm.value.dob.startDate).format("YYYY-MM-DD")
      );
    if (this.ProfileForm.value.close_shift_email.trim() == "") {
      formData.set("close_shift_email", this.ProfileForm.value.email);
    }
    formData.set("old_profile_image", this.oldProfileImage.trim());

    if (this.profileImageFile != null) {
      formData.delete('profilepic');
      formData.set(`profile_pic`, this.profileImageFile);
    } else {
      formData.delete('profilepic');
      formData.set(`profile_pic`, String(this.ProfileForm.get('profilepic').value));
    }

    this.userService.updateProfile(formData).subscribe(
      data => {
        console.log('data', data);
        if (data.status) {

        }

        Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant("Profile Update Successfully")));
        let loggedInUserdata = JSON.parse(localStorage.getItem("currentuser"));
        //change profile image
        if (data.data.profilepic != "") {
          this.ProfileImage = environment.fileurl + "/" + data.data.profilepic;
          loggedInUserdata.user.profileimage = data.data.profilepic;
        }
        loggedInUserdata.user.name = this.ProfileForm.get("name").value;
        localStorage.setItem("currentuser", JSON.stringify(loggedInUserdata));
        this.userService.Setuserdata();
      },
      error => {

        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.showImagecropper = false;
      this.spinner.hide();
    });
  }
}
