import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminService } from "./../../../shared/services/admin.service";
import { Subject } from 'rxjs';
import { noOnlyWhitespaceValidator } from "./../../../shared/helpers/custom.validator";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: 'app-subcategory',
  templateUrl: './subcategory.component.html',
  styles: ['.profileImage{ margin : 20px 0px}', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid;}'],
})
export class SubcategoryComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};

  dtTrigger: any = new Subject<any>();
  subcategories = [];
  parentCategories = [];
  cat_id: Number = -1;
  title: string = "Add SubCategory"

  subcategoryform: FormGroup;
  editsubcategory: Boolean = false;

  constructor(private _router: Router, private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    //get list of subcategories
    this.spinner.show();
    this.adminsService.getSubCategories().subscribe(res => {

      if (res) {
        this.subcategories = res.data.subcat;
        this.parentCategories = res.data.cat;
        this.dtTrigger.next();
      }
      else {
        this._router.navigate(['/admin/dashboard']);
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }
    }).add(() => {
      this.spinner.hide();
    });

    this.subcategoryform = this.formBuilder.group(
      {
        name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(40)]],
        description: ["", [Validators.required, noOnlyWhitespaceValidator]],
        parentid: ["", [Validators.required]]
      })
  }

  onSubmit() {

    this.spinner.show();

    if (this.editsubcategory == true && this.cat_id) {
      this.subcategoryform.value.catid = this.cat_id;
    }
    this.adminsService.saveSubCategory(this.subcategoryform.value).subscribe(
      res => {
        if (res.status == 200) {
          this.subcategories = res.data;
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
          this.subcategoryform.reset();
          this.editsubcategory = false;
          this.title = "Add Sub Category";
        }
        else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }).add(() => {
        this.spinner.hide();
      });

  }

  editCat(catid) {
    this.spinner.show();
    //get category data
    this.adminsService.getCategory(catid).subscribe(
      res => {

        if (res.status == 200) {
          this.editsubcategory = true;
          this.cat_id = parseInt(res.data.id);
          this.title = " Edit Subcategory"
          this.subcategoryform.patchValue({
            name: res.data.name,
            description: res.data.description,
            parentid: res.data.parent_id
          })
        } else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }
    ).add(() => {
      this.spinner.hide();
    });

  }

  addCat() {
    this.subcategoryform.reset();
    this.editsubcategory = false;
    this.cat_id = -1;
    this.title = "Add Category";
  }

  deleteCat(categoryId) {
    Swal.fire(Swaldata.SwalConfirm("Sub category will delete")).then((result) => {
      if (result.value) {
        this.spinner.show();

        this.adminsService.deleteSubCat(categoryId).subscribe(
          res => {
            if (res.status == 200) {
              Swal.fire(Swaldata.SwalSuccessToast(res.msg));
              this.subcategories = res.data;
            }
            else {
              Swal.fire(Swaldata.SwalErrorToast(res.msg));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
          }
        ).add(() => {
          this.spinner.hide();
        })
      }
    });
  }


}
