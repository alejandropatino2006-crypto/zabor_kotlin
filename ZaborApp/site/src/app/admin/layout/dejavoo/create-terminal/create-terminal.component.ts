import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import * as Swaldata from "../../../../shared/helpers/swalFunctionsData";
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-terminal',
  templateUrl: './create-terminal.component.html',
  styleUrls: ['./create-terminal.component.scss']
})
export class CreateTerminalComponent implements OnInit {

  terminalForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private _router: Router
  ) { }

  ngOnInit() {
    this.terminalForm = this.formBuilder.group({          
      tpn: ["", [Validators.required]],
      register_id: ["", [Validators.required]],
      authkey: ["", [Validators.required]],
      security_key: [""],
      rest_id: ["", [Validators.required]],
      device_id: ["", [Validators.required]],
      device_name: ["", [Validators.required]],
    })
  }

  public onTerminalSubmit() {
    this.spinner.show();      
    this.terminalForm
      .get("tpn")
      .setValue(this.terminalForm.get("tpn").value);
    this.terminalForm
      .get("register_id")
      .setValue(this.terminalForm.get("register_id").value);
    this.terminalForm
      .get("authkey")
      .setValue(this.terminalForm.get("authkey").value);
    this.terminalForm
      .get("security_key")
      .setValue(this.terminalForm.get("security_key").value);
    this.terminalForm
      .get("rest_id")
      .setValue(this.terminalForm.get("rest_id").value);
    this.terminalForm
      .get("device_id")
      .setValue(this.terminalForm.get("device_id").value);
    this.terminalForm
      .get("device_name")
      .setValue(this.terminalForm.get("device_name").value);

    console.log(this.terminalForm.value);

    this.http
      .post(`${environment.apiUrl}` + "/api/create-dejavoo-terminal", {
        ...this.terminalForm.value,
      })
      .subscribe(
        (resp) => {
          this.terminalForm.reset();
          Swal.fire(Swaldata.SwalSuccessToast("Terminal added successfully"));
          this._router.navigate(['admin/dejavoo']);
        },
        (error) => {
          console.log("error",error);
          Swal.fire(Swaldata.SwalErrorToast(error));
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }
}
