import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { adminService } from "./../../../../shared/services/admin.service";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from "../../../../../environments/environment";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
import { ActivatedRoute } from "@angular/router";
import { dataURLtoFile } from "./../../../../shared/helpers/commonFunctions";

@Component({
  selector: 'app-profile',
  templateUrl: './edit.component.html',
  styles: ['.profileImage{ margin: 20px 0 }', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid; }'],

})
export class EditComponent implements OnInit {
  userid: Number;
  fileurl: string = "";
  public userdata: any


  constructor(private route: ActivatedRoute, private _router: Router, private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) {
    this.userdata = {
      name: '',
      email: "",
      about: "",
      address: "",
      city: "",
      created_date: "",
      dob: "",
      phone: "",
      profileimage: "",
      role: "",
      status: ""
    }
  }


  ngOnInit() {

    this.fileurl = environment.fileurl;
    //Get userId from Param
    this.userid = parseInt(this.route.snapshot.paramMap.get("id"));
    this.adminsService.getCurrentUser(this.userid).subscribe(res => {

      if (res.status) {
        this.userdata = res.data

      } else {
        this._router.navigate(['dashboard']);
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }

    }, error => {
      this._router.navigate(['dashboard']);
      Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
    })


  }



}
