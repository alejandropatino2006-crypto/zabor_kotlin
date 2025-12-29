import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import Swal from 'sweetalert2';
import * as Swaldata from '../../shared/helpers/swalFunctionsData';
import {NgxSpinnerService} from 'ngx-spinner';
import { Reader, Location } from "@stripe/terminal-js";
import {noOnlyWhitespaceValidator} from '../../shared/helpers/custom.validator';
import {PaymentsManager} from '../../shared/terminal/payments-manager';
import {TerminalLocationRequest, TerminalReaderRequest} from '../../shared/terminal/api-client';
import {Router} from '@angular/router';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, AfterViewInit, OnDestroy {
  terminalForm: FormGroup;
  useSimulatedTerminal = false;
  restoreValues: {
    // display_name: string;
    label: string;
    registration_code: string;
  };
  private paymentMgr: PaymentsManager;
  discoveredReadersList: Reader[] = [];
  showDiscoveryResults = false;
  canRegister = false;
  discovering = false;
  registering = false;
  locationsList: Location[] = [];
  currentLocation: Location;
  locationForm: FormGroup;
  canDiscover = false;
  locationFormTitle = "Register a new location";
  canRegisterLocation = true;
  canUpdateLocation = false;
  discoveredOnce = false;
  submittingLocation = false;

  @ViewChild('locationFormWrapper', { static: true }) locationFormWrapperTemplate: TemplateRef<any>;
  @ViewChild('discoverWrapper', { static: true }) discoverWrapperTemplate: TemplateRef<any>;

  constructor(private _router: Router, private formBuilder: FormBuilder/*, private admService: adminService*/, private spinner: NgxSpinnerService) {
    this.paymentMgr = new PaymentsManager();
  }

  ngOnInit() {
    this.terminalForm = this.formBuilder.group(
      {
        display_name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        registration_code: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(64)]],
        is_simulated: [false, [Validators.required]],
        // label: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(48)]],
        // line1: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(256)]],
        // line2: ["", [Validators.maxLength(256)]],
        // city: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        // state: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        // country: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        // postal_code: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(16)]],
      },
    );
    this.restoreValues = {
      // display_name: "",
      label: "",
      registration_code: "",
    };

    this.locationForm = this.formBuilder.group(
      {
        display_name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        line1: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(256)]],
        line2: ["", [Validators.maxLength(256)]],
        city: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        state: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        country: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(32)]],
        postal_code: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(16)]],
      },
    );

    this.loadLocations();
  }

  ngAfterViewInit(): void {
    this.terminalForm.patchValue({
      registration_code: "",
      label: "Reader Simulator",
    });
    // this.locationForm.patchValue({
    //   display_name: "HQ Terminal 1",
    //   line1: '72ND AVE, NW',
    //   city: 'Miami',
    //   state: 'Florida',
    //   country: 'US',
    //   postal_code: '33122',
    // });
  }

  onTerminalFormSubmit(form: NgForm) {
    this.registering = true;
    this.useSimulatedTerminal = false;
    if (!this.terminalForm.valid) {
      const controls = this.terminalForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          alert('invalid data -> ' + name);
        }
      }
      this.registering = false;
      return false;
    }

    // enable disable controls
    this.terminalForm.controls['registration_code'].enable();

    this.spinner.show();

    const formData = this.terminalForm.value;
    const dataToPost: TerminalReaderRequest = {
      registration_code: formData.registration_code,
      label: formData.label,
      is_simulated: this.useSimulatedTerminal,
    };

    if (!this.useSimulatedTerminal) {
      // this.paymentMgr.registerStripeTerminal(dataToPost).subscribe(
      //     data => {
      //         if (data.status) {
      //             Swal.fire(Swaldata.SwalSuccessToast(data.msg));
      //         } else {
      //             Swal.fire(Swaldata.SwalErrorToast(data.msg));
      //         }
      //     },
      //     err => {
      //         Swal.fire(Swaldata.SwalErrorToast(err));
      //     }
      // ).add(() => {
      //     // again disable controls
      //     if (this.useSimulatedTerminal) {
      //         this.terminalForm.controls['registration_code'].disable();
      //     }
      //
      //     this.spinner.hide();
      // });

      this.paymentMgr.registerStripeTerminal(dataToPost)
        .then(async (data: { message: string; reader: Reader }) => {
          // Swal.fire(Swaldata.SwalSuccessToast(data.message));

          // After registering a new reader, we can connect immediately using the reader object returned from the server.
          const result = await this.paymentMgr.connectToReader(data.reader);
          console.log('reader connection =', result);
          console.log("Registered and Connected Successfully!");
          Swal.fire(Swaldata.SwalSuccessToast("Registered and Connected Successfully!"));
        }, (reason) => {
          Swal.fire(Swaldata.SwalErrorToast(reason));
        })
        .catch((reason) => {
          Swal.fire(Swaldata.SwalErrorToast(reason));
        })
        .finally(() => {
          // again disable controls
          if (this.useSimulatedTerminal) {
            this.terminalForm.controls['registration_code'].disable();
          }
          this.registering = false;
          this.spinner.hide();
        });
    } else {
      this.registering = false;
      alert('invalid call');
    }
    return this.registering;
  }

  onSimulatedCheckChange(evt: Event) {
    const targetElement = evt.target as HTMLInputElement;
    // const val = this.terminalForm.get('is_simulated').value;
    this.useSimulatedTerminal = targetElement.checked;
    if (this.useSimulatedTerminal) {
      this.restoreValues = {
        // display_name: this.terminalForm.controls['display_name'].value,
        label: this.terminalForm.controls['label'].value,
        registration_code: this.terminalForm.controls['registration_code'].value,
      };
      this.terminalForm.patchValue({
        // display_name: "",
        label: "Reader Simulator",
        registration_code: "",
      });
      // this.terminalForm.controls['display_name'].disable();
      // this.terminalForm.controls['label'].disable();
      this.terminalForm.controls['registration_code'].disable();
    } else {
      // this.terminalForm.controls['display_name'].enable();
      // this.terminalForm.controls['label'].enable();
      this.terminalForm.controls['registration_code'].enable();
      this.terminalForm.patchValue({
        // display_name: this.restoreValues.display_name,
        label: this.restoreValues.label,
        registration_code: this.restoreValues.registration_code,
      });
    }
  }

  private async startDiscovery() {
    this.discoveredReadersList = [];
    this.discoveredOnce = true;
    this.discovering = true;
    this.showDiscoveryResults = false;
    this.useSimulatedTerminal = false;
    if (this.discovering) {
      console.group('Discovery');
      const discoverResult = await this.paymentMgr.discoverReaders(this.currentLocation.id, false/*this.useSimulatedTerminal*/);
      let error = false;
      let errorMsg = '';
      if (!discoverResult.success) {
        error = true;
        if (discoverResult.error) {
          errorMsg = 'Failed to discover...\n' + discoverResult.error;
        }
        if (discoverResult.reason) {
          errorMsg = 'Failed to discover...\n' + discoverResult.reason;
          if (discoverResult.reason === 'Cancelled') {
            console.log('discovery cancelled');
          }
        }
      } else {
        this.showDiscoveryResults = true;
        this.canRegister = true;
        if (this.paymentMgr.discoveredReaders.length > 0) {
          this.discoveredReadersList = this.paymentMgr.discoveredReaders;
        } else {
          error = true;
          errorMsg = 'No terminals/readers could be found...';
        }
      }

      if (error) {
        console.log(errorMsg);
        // alert(errorMsg);
      }
      console.groupEnd();
    } else {
      console.group('Cancel Discovery');
      await this.paymentMgr.cancelReadersDiscovery();
      console.groupEnd();
    }
    this.discovering = false;
  }

  async handleDiscoverClicked(evt: MouseEvent) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLButtonElement;
    (targetElement.nextElementSibling as HTMLButtonElement).disabled = true;
    // targetElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.querySelector('button').disabled = true;
    await this.startDiscovery();
    (targetElement.nextElementSibling as HTMLButtonElement).disabled = false;
    // targetElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.querySelector('button').disabled = false;
  }

  async handleSimulatorConnectClicked(evt: MouseEvent) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLButtonElement;
    targetElement.disabled = true;
    (targetElement.previousElementSibling as HTMLButtonElement).disabled = true;
    // targetElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.querySelector('button').disabled = true;
    this.useSimulatedTerminal = true;
    if (this.useSimulatedTerminal) {
      console.group('Discovery');
      const discoverResult = await this.paymentMgr.discoverReaders("", this.useSimulatedTerminal);
      let error = false;
      let errorMsg = "";
      if (!discoverResult.success) {
        error = true;
        if (discoverResult.error) {
          errorMsg = "Failed to discover...\n" + discoverResult.error;
        }
        if (discoverResult.reason) {
          errorMsg = "Failed to discover...\n" + discoverResult.reason;
        }
      } else {
        if (this.paymentMgr.discoveredReaders.length <= 0) {
          error = true;
          errorMsg = 'No terminal readers could be found...';
          // } else {
          //     alert('found');
        }
      }

      if (error) {
        console.log(errorMsg);
        alert(errorMsg);
        Swal.fire(Swaldata.SwalErrorToast(errorMsg));
      } else {
        const tempReader = this.paymentMgr.discoveredReaders[0];
        const result = await this.paymentMgr.connectToReader(tempReader);
        console.log('reader connection =', result);
        console.log("Connected to simulator successfully!");

        setTimeout(() => {
          const paymentData = {
            reader: tempReader,
          };
          localStorage.setItem('payment-data', JSON.stringify(paymentData));
          this._router.navigate(['terminalTest/paymentTest']);
        }, 500);
      }
      console.groupEnd();
    } else {
      alert('invalid call');
    }

    setTimeout(() => {
      targetElement.disabled = false;
      (targetElement.previousElementSibling as HTMLButtonElement).disabled = false;
      // targetElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.querySelector('button').disabled = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    this.paymentMgr.disconnectReader().then(() => {
      console.log('reader disconnected...');
    });
  }

  async handleConnectReaderClicked(evt: MouseEvent) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLButtonElement;
    const index = parseInt(targetElement.dataset.readerIndex, 10);
    const selectedReader = this.paymentMgr.discoveredReaders[index];
    if (this.paymentMgr.matchedCurrentReaderId(selectedReader.id)) {
      this.paymentMgr.reconnectCurrentReader();
    } else {
      this.paymentMgr.disconnectReader().then(async () => {
        console.log('reader disconnected...');
        // const result = await this.paymentMgr.connectToReader(selectedReader);
        // console.log('reader connection =', result);
        // console.log('Connected Successfully!');
        // Swal.fire(Swaldata.SwalSuccessToast('Connected Successfully!'));

        setTimeout(() => {
          const paymentData = {
            reader: selectedReader,
            location: this.currentLocation,
          };
          localStorage.setItem('payment-data', JSON.stringify(paymentData));
          this._router.navigate(['admin/terminal/test']);
        }, 500);
      });
    }
  }

  private selectLocation(index: number) {
    this.currentLocation = this.locationsList[index];
    this.locationForm.patchValue({
      display_name: this.currentLocation.display_name,
      line1: this.currentLocation.address.line1,
      line2: this.currentLocation.address.line2,
      city: this.currentLocation.address.city,
      state: this.currentLocation.address.state,
      country: this.currentLocation.address.country,
      postal_code: this.currentLocation.address.postal_code,
    });
    this.locationFormTitle = 'Update this location';
    this.canRegisterLocation = false;
    this.canUpdateLocation = true;
  }

  handleViewLocationClicked(evt: MouseEvent) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLButtonElement;
    const index = parseInt(targetElement.dataset.locationIndex, 10);
    this.selectLocation(index);
  }

  async handleDiscoverForLocationClicked(evt: MouseEvent) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLButtonElement;
    const index = parseInt(targetElement.dataset.locationIndex, 10);
    this.selectLocation(index);
    this.canDiscover = true;
    await this.startDiscovery();
  }

  handleDeleteLocationClicked(evt: MouseEvent) {
    evt.preventDefault();
    const targetElement = evt.target as HTMLButtonElement;
    const index = parseInt(targetElement.dataset.locationIndex, 10);
    const selectedLocation = this.locationsList[index];
    this.paymentMgr.deleteLocation(selectedLocation.id).then((response) => {
      if (response.success) {
        console.log(`location with label/name = ${response.data.display_name} deleted successfully`);
        this.locationsList.splice(index, 1);
        Swal.fire(Swaldata.SwalSuccessToast("Deleted Successfully!"));
      } else {
        console.error(`could not delete location with label/name = ${response.data.display_name}`);
        Swal.fire(Swaldata.SwalErrorToast("Could not deleted selected location!!!!"));
      }
    });
  }

  handleRegisterNewLocationClicked(evt: MouseEvent) {
    evt.preventDefault();
    this.canUpdateLocation = false;
    this.canRegisterLocation = true;
    this.locationFormTitle = "Register a new location";
    this.locationForm.patchValue({
      display_name: "",
      line1: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    });
  }

  getTopTemplate() {
    return this.discoveredOnce ? this.discoverWrapperTemplate : this.locationFormWrapperTemplate;
  }

  getBottomTemplate() {
    return !this.discoveredOnce ? this.discoverWrapperTemplate : this.locationFormWrapperTemplate;
  }

  onLocationFormSubmit(form: NgForm) {
    this.submittingLocation = true;
    if (!this.locationForm.valid) {
      const controls = this.locationForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          alert('invalid data -> ' + name);
        }
      }
      this.submittingLocation = false;
      return false;
    }


    this.spinner.show();

    let operationSuccessful = true;
    const formData = this.locationForm.value;
    const dataToPost: TerminalLocationRequest = {
      display_name: formData.display_name,
      address: {
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
      }
    };

    // add optional fields if not empty
    if (formData.line2 && formData.line2.trim().length > 0) {
      dataToPost.address.line2 = formData.line2;
    }

    if (this.canRegisterLocation) {
      this.paymentMgr.registerStripeLocation(dataToPost)
        .then(async (result: { message: string; location: Location }) => {
          console.log("New location registered Successfully!");
          Swal.fire(Swaldata.SwalSuccessToast("Registered Successfully!"));
        }, (reason) => {
          Swal.fire(Swaldata.SwalErrorToast(reason));
          operationSuccessful = false;
        })
        .catch((reason) => {
          Swal.fire(Swaldata.SwalErrorToast(reason));
          operationSuccessful = false;
        })
        .finally(() => {
          if (operationSuccessful) {
            this.submittingLocation = false;
            this.spinner.hide();
            this.loadLocations();
          }
        });
    }

    if (operationSuccessful && this.canUpdateLocation) {
      dataToPost.locationId = this.currentLocation.id;
      this.paymentMgr.updateStripeLocation(dataToPost)
        .then(async (result: { message: string; location: Location }) => {
          console.log("location updated registered Successfully!");
          Swal.fire(Swaldata.SwalSuccessToast("Updated Successfully!"));
        }, (reason) => {
          Swal.fire(Swaldata.SwalErrorToast(reason));
          operationSuccessful = false;
        })
        .catch((reason) => {
          Swal.fire(Swaldata.SwalErrorToast(reason));
          operationSuccessful = false;
        })
        .finally(() => {
          if (operationSuccessful) {
            this.submittingLocation = false;
            this.spinner.hide();
            this.loadLocations();
          }
        });
    }
    return operationSuccessful;
  }

  private loadLocations() {
    this.paymentMgr.getLocations().then((response) => {
      this.locationsList = response.data;
    });
  }

}
