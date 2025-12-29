import { Component, OnInit, ViewChild } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { adminService } from "./../../../../shared/services/admin.service";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
import { noOnlyWhitespaceValidator } from 'src/app/shared/helpers/custom.validator';


@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService]

})
export class AddComponent implements OnInit {
  public Editor = ClassicEditor;
  // pagecontent: string = "";
  form: FormGroup;

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
  constructor(private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      page: ['', [Validators.required, noOnlyWhitespaceValidator]],
      content: ['', [Validators.required, noOnlyWhitespaceValidator]],
      page_es: ['', [Validators.required, noOnlyWhitespaceValidator]],
      content_es: ['', [Validators.required, noOnlyWhitespaceValidator]]
    })
  }

  create() {
    if (this.form.invalid) {
      return;
    }

    this.spinner.show();
    this.adminsService.createPage(this.form.value).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));

          this.adminsService.staticPages.push({ id: data.pageId, page: this.form.get('page').value })
        }

        else
          Swal.fire(Swaldata.SwalErrorToast(data.msg));

      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.spinner.hide();
      this.form.reset();

    });
  }

}
