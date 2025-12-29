import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminService } from "./../../../shared/services/admin.service";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';
import { Subject } from 'rxjs';
import { noOnlyWhitespaceValidator } from "./../../../shared/helpers/custom.validator";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DataTableDirective } from 'angular-datatables';
import { dataURLtoFile } from "./../../../shared/helpers/commonFunctions";
import { environment } from 'src/environments/environment';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styles: ['.profileImage{ margin : 20px 0px}', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid;}'],
})
export class CategoryComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};

  dtTrigger: any = new Subject<any>();
  categories = [];
  cat_id: Number = -1;
  title: string = "Add Category";

  category_file_name: string = "Choose File";

  CategoryForm: FormGroup;
  editcategoryForm: Boolean = false;
  dataURLtoFile = dataURLtoFile;

  catimg: string = "";
  uploderCatImg: File = null;

  imgpath = environment.fileurl + '/';


  constructor(private _router: Router, private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    //get list of categories
    this.spinner.show();
    this.adminsService.getCategories().subscribe(res => {

      if (res.status == 200) {
        this.categories = res.data;
        this.dtTrigger.next();
      }
      else {
        this._router.navigate(['/admin/dashboard']);
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }

    }).add(() => {
      this.spinner.hide();
    });

    this.CategoryForm = this.formBuilder.group(
      {
        name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(30)]],
        description: ["", [Validators.required, noOnlyWhitespaceValidator]],
      })
  }

  fileChangeEvent(event: any, field): void {
    var reader = new FileReader();

    reader.onload = (e: any) => {
      this.catimg = e.target.result;
      this.uploderCatImg = this.dataURLtoFile(e.target.result, event.target.files[0].name)
    };

    reader.readAsDataURL(event.target.files[0]);

  }


  onSubmit() {
    this.spinner.show();

    var formData = new FormData();
    Object.entries(this.CategoryForm.value).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    )
    formData.set('catid', <any>this.cat_id);
    if (this.uploderCatImg != null)
      formData.set('catimg', this.uploderCatImg);

    this.adminsService.saveCategory(formData).subscribe(
      res => {
        if (res.status == 200) {
          this.categories = res.data;
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
          this.CategoryForm.reset();
          this.editcategoryForm = false;
          this.title = "Add Category";
          this.catimg = "";
          this.uploderCatImg = null;
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
          this.editcategoryForm = true;
          this.cat_id = parseInt(res.data.id);
          this.title = " Edit category"
          this.CategoryForm.patchValue({
            name: res.data.name,
            description: res.data.description
          })
          this.catimg = environment.fileurl + '/' + res.data.catimg;
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
    this.CategoryForm.reset();
    this.editcategoryForm = false;
    this.cat_id = -1;
    this.title = "Add Category";
    this.catimg = ""
  }

  deleteCat(categoryId) {
    Swal.fire(Swaldata.SwalConfirm("Category will delete")).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.adminsService.deleteCat(categoryId).subscribe(
          res => {
            if (res.status == 200) {
              Swal.fire(Swaldata.SwalSuccessToast(res.msg));
              this.categories = res.data;
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
        });

      }
    })
  }


}
