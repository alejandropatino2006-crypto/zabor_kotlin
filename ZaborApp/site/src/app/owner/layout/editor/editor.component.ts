import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../../shared/services/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { noOnlyWhitespaceValidator, MustMatch } from 'src/app/shared/helpers/custom.validator';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  editorgroup: FormGroup;
  restaurantLists: any[] = [];
  editorId: number = -1;
  editors: any = [];

  constructor(private formBuilder: FormBuilder, private spinner: NgxSpinnerService, private restaurantService: RestaurantService,private translate: TranslateService) { }

  ngOnInit() {
    console.log('a')
    //get restaurant of user
    this.restaurantService.getrestaurantslist().subscribe(
      data => {
        console.log('data', data)
        if (data.status == 200)
          this.restaurantLists = [...data.data];
      }
    )

    this.getEditors()

    this.editorgroup = this.formBuilder.group(
      {
        'name': ["", [Validators.required, noOnlyWhitespaceValidator]],
        'email': ["", [Validators.required, Validators.email]],
        'password': ["", []],
        'confirmPassword': ["", []],
        'res_id': ['', [Validators.required]],
        'status': [1, [Validators.required]]
      },
      {
        validator: MustMatch("password", "confirmPassword")
      }
    );
  }

  getEditors() {
    // get editors of owner
    this.restaurantService.getEditors().subscribe(
      response => {
        if (response.status) {
          this.editors = response.data;
          console.log('employees', this.editors);
        }
      }
    )
  }
  get passwordControl() {
    return this.editorgroup.get('password') as FormControl;
  }

  get confirmpasswordControl() {
    return this.editorgroup.get('confirmPassword') as FormControl;
  }

  editEditor(id) {
    this.reset()
    this.editorId = id;
    this.editors.forEach(element => {
      if (element.id == id) {
        this.editorgroup.patchValue({
          'name': element.name,
          'email': element.email,
          'res_id': element.res_id,
          'status': element.status
        })
      }
    });

  }

  addEditor() {
    this.reset()
    // this.passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    // this.confirmpasswordControl.setValidators([Validators.required]);
    // this.passwordControl.updateValueAndValidity();
    // this.confirmpasswordControl.updateValueAndValidity();
    console.log(this.editorgroup);
  }

  reset() {
    this.editorgroup.reset()
    this.editorId = -1;
  }

  onSubmit() {
    if (!this.editorgroup.valid)
      return;

    if (this.editorId == -1) {
      console.log(this.editorgroup.value.password)
      if (!this.editorgroup.value.password || this.editorgroup.value.password.trim() == '') {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Please enter a valid password')));
        return;
      }
      // if()
    }

    this.spinner.show()
    console.log(this.editorgroup.value);
    let data = this.editorgroup.value
    data['editorId'] = this.editorId;
    this.restaurantService.saveEditor(data).subscribe(
      response => {
        if (response.status) {
          Swal.fire(Swaldata.SwalSuccessToast(response.msg))
          this.reset()
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg))
        }
      }, err => {

      }
    ).add(() => {
      this.spinner.hide()
      this.getEditors()
    })
  }
  deleteEditor(id) {
    this.reset();
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("Employee will be deleted"))).then((result) => {
      if (result.value) {
        this.spinner.show()
        this.restaurantService.deleteEditor(id).subscribe(
          data => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast(data.msg))
              this.reset()
            } else {
              Swal.fire(Swaldata.SwalErrorToast(data.msg))
            }
          },
          err => {
            Swal.fire(Swaldata.SwalErrorToast(err))
          }
        ).add(() => {
          this.spinner.hide()
          this.getEditors()
        })
      }
    })
  }
}
