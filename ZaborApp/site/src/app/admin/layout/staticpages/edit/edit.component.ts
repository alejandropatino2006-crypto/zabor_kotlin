import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { adminService } from "./../../../../shared/services/admin.service";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
import { noOnlyWhitespaceValidator } from 'src/app/shared/helpers/custom.validator';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService],
})
export class EditComponent implements OnInit, OnDestroy {
  public Editor = ClassicEditor;
  public pageid = -1;
  // pagecontent: string = "";
  form: FormGroup;
  public Routersubscription: any;

  public tools: object = {
    items: ['Undo', 'Redo', '|',
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'SubScript', 'SuperScript', '|',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
      'Indent', 'Outdent', '|', 'CreateLink',
      '|', 'ClearFormat', 'Print', 'SourceCode']
  };
  constructor(private route: ActivatedRoute, private _router: Router, private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) {

  }

  routeEvent(router: Router) {
    this.Routersubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.spinner.show();
        this.pageid = parseInt(e.url.split("/")[e.url.split("/").length - 1], 10);
        this.getPageContent();
      }
    });
  }

  getPageContent() {
    this.adminsService.getStaticpageContent(this.pageid).subscribe(
      data => {
        if (data) {
          this.form.patchValue({
            id: data.data.id,
            page: data.data.page,
            content: data.data.content,
            page_es: data.data.page_es,
            content_es: data.data.content_es
          })
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }
    ).add(() => {
      this.spinner.hide();
    })
  }
  ngOnInit() {
    this.pageid = parseInt(this.route.snapshot.paramMap.get("id"));
    this.getPageContent();
    this.form = this.formBuilder.group({
      id: ['', [Validators.required]],
      page: ['', [Validators.required, noOnlyWhitespaceValidator]],
      page_es: ['', [Validators.required, noOnlyWhitespaceValidator]],
      content: ['', [Validators.required, noOnlyWhitespaceValidator]],
      content_es: ['', [Validators.required, noOnlyWhitespaceValidator]]
    })
    this.routeEvent(this._router);

  }

  update() {
    if (this.form.invalid) {
      return;
    }

    this.spinner.show();
    this.adminsService.updatePage(this.form.value).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          this.adminsService.staticPages.map((item: any) => {
            if (item.id == this.pageid)
              item.page = this.form.get('page').value
          })
        }

        else
          Swal.fire(Swaldata.SwalErrorToast(data.msg));

      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }
  ngOnDestroy() {
    this.Routersubscription.unsubscribe();
  }

}
