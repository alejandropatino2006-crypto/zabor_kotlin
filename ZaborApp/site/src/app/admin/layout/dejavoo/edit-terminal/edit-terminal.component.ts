import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import * as Swaldata from "../../../../shared/helpers/swalFunctionsData";
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-terminal',
  templateUrl: './edit-terminal.component.html',
  styleUrls: ['./edit-terminal.component.scss']
})
export class EditTerminalComponent implements OnInit {

  terminalForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private _router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.terminalForm = this.formBuilder.group({          
      id: ["", [Validators.required]],
      tpn: ["", [Validators.required]],
      register_id: ["", [Validators.required]],
      authkey: ["", [Validators.required]],
      security_key: [""],
      rest_id: ["", [Validators.required]],
      device_id: ["", [Validators.required]],
      device_name: ["", [Validators.required]],
    })
    const id = this.route.snapshot.paramMap.get('terminalid');
    this.getTerminal(id);
  }

  public getTerminal(id) {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}` + "/api/get-dejavoo-terminal?id=" + id)
      .subscribe(
        (resp:any) => {
          console.log(resp);
          this.terminalForm
            .get("tpn")
            .setValue(resp.response[0].tpn);
          this.terminalForm
            .get("register_id")
            .setValue(resp.response[0].register_id);
          this.terminalForm
            .get("authkey")
            .setValue(resp.response[0].authkey);
          this.terminalForm
            .get("security_key")
            .setValue(resp.response[0].security_key);
          this.terminalForm
            .get("id")
            .setValue(id);
          this.terminalForm
            .get("rest_id")
            .setValue(resp.response[0].rest_id);
          this.terminalForm
            .get("device_id")
            .setValue(resp.response[0].device_id);
          this.terminalForm
            .get("device_name")
            .setValue(resp.response[0].device_name);
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
      .get("id")
      .setValue(this.terminalForm.get("id").value);
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
      .put(`${environment.apiUrl}` + "/api/update-dejavoo-terminal", {
        ...this.terminalForm.value,
      })
      .subscribe(
        (resp) => {
          this.terminalForm.reset();
          Swal.fire(Swaldata.SwalSuccessToast("Terminal updated successfully"));
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
