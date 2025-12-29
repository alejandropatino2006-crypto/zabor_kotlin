import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {IZaborCartInfo, IZaborCartItem, PaymentsManager} from '../../../../shared/terminal/payments-manager';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { Reader, Location } from "@stripe/terminal-js";
import {isErrorResponse, isPaymentIntentCaptureResponse} from '../../../../shared/terminal/api-client';
import {noOnlyWhitespaceValidator} from '../../../../shared/helpers/custom.validator';
import {ILineItem} from '@stripe/terminal-js/types/proto';

@Component({
  selector: 'app-payment-test',
  templateUrl: './payment-test.component.html',
  styleUrls: ['./payment-test.component.scss']
})
export class PaymentTestComponent implements OnInit, AfterViewInit {
  private paymentMgr: PaymentsManager;
  currentReader: Reader;
  paymentForm: FormGroup;
  canPay = false;
  discovering = false;
  connecting = false;
  connectFailed = false;
  currentLocation: Location;
  lineItems: IZaborCartItem[] = [];
  cartInfo: IZaborCartInfo;
  currency: string;
  usingSimulator = false;
  readerid:string;
  type:string;
  locationid:string;
  account_id:string;

  constructor(private _router: Router, private formBuilder: FormBuilder, private spinner: NgxSpinnerService,  private route: ActivatedRoute) {
    this.paymentMgr = new PaymentsManager();
  }

  ngOnInit() {

    this.readerid = this.route.snapshot.paramMap.get("readerid");
    this.type = this.route.snapshot.paramMap.get("type");
    this.locationid = this.route.snapshot.paramMap.get("locationid");

    this.account_id = this.route.snapshot.paramMap.get("accountid");


    if (this.type == "simulator") {
      this.usingSimulator = true;
    }

    this.lineItems.push(this.createCartItemNamedColored('Ice Cream', 'Vanilla', 20, 2));
    this.lineItems.push(this.createCartItemNamedColored('T-Shirt', 'RED', 20, 2));
    this.currency = 'USD';
    const fullAmount = this.lineItems.reduce((prev, curr) => prev + (curr.pricePerItem * curr.quantity), 0);
    this.cartInfo = { currency: this.currency, total: fullAmount, summary: `${this.lineItems.length} items purchased!` };

    this.paymentForm = this.formBuilder.group(
        {
          array: this.formBuilder.array(
            this.lineItems.map(x => this.formBuilder.group({
              itemName: this.formBuilder.control(x.name),
              itemAttr: this.formBuilder.control(x.attribute),
              quantity: this.formBuilder.control(x.quantity),
              pricePerItem: this.formBuilder.control(x.pricePerItem),
              amount: this.formBuilder.control(x.quantity * x.pricePerItem)
            }))
          ),
          grandTotal: [{value: '', disabled: true}, [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(48)]],
          currency: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(48)]],
          card_number: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(48)]],
          payment_method: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(48)]],
        },
    );
  }

  ngAfterViewInit(): void {
    this.paymentForm.patchValue({
      grandTotal: this.cartInfo.total,
      currency: this.cartInfo.currency,
      card_number: '4242424242424242',
      payment_method: 'visa',
    });

    // this.paymentForm.get('quantity').valueChanges.subscribe(
    //   value => {
    //     console.log('TEST - value', value);
    //     const amountField = this.paymentForm.get('amount');
    //     const singleItemPriceField = this.paymentForm.get('pricePerItem');
    //     const pricePerItem = singleItemPriceField.value;
    //     console.log('TEST - pricePerItem', pricePerItem);
    //     amountField.setValue(isNaN(value) ? 0 : value * pricePerItem);
    //   }
    // );

    this.paymentForm.valueChanges.subscribe(
      val => {
        // console.log('TEST1', val);
        // console.log('TEST2', val.array);
        // console.log('TEST2', val.array.length);
        // console.log('TEST3 - amount', val.array[0].amount);
        // console.log('TEST4 - quantity', val.array[0].quantity);
        // console.log('TEST5 - pricePerItem', val.array[0].pricePerItem);
        // console.log('XXXXX1', this.paymentForm.get('array'));
        // console.log('XXXXX2', this.paymentForm.controls.array);
        // console.log('XXXXX3', this.paymentForm.controls.array['controls']);
        let grandTotal = 0;
        for (let i = 0; i < val.array.length; i++) {
          // group.amount.patchValue(group.quantity * group.pricePerItem);
          // console.log('XXXXXZZZZ', this.paymentForm.controls.array['controls'][i]);
          // console.log('XXXXXZZZZ', this.paymentForm.controls.array['controls'][i]['controls']);
          // console.log('XXXXXYYYY', this.paymentForm.controls.array['controls'][i]['controls'].amount.value);
          const amountControl = this.paymentForm.controls.array['controls'][i]['controls'].amount;
          const quantityControl = this.paymentForm.controls.array['controls'][i]['controls'].quantity;
          const pricePerItemControl = this.paymentForm.controls.array['controls'][i]['controls'].pricePerItem;
          const amount = quantityControl.value * pricePerItemControl.value;
          amountControl.patchValue(amount, {emitEvent: false});
          // this.paymentForm.controls.array[i].amount.patchValue(this.paymentForm.controls.array[i].quantity * this.paymentForm.controls.array[i].pricePerItem);
          grandTotal += amount;
        }

        this.paymentForm['controls'].grandTotal.patchValue(grandTotal, {emitEvent: false});

        const cardControl = this.paymentForm['controls'].card_number;
        console.log('cardControl', cardControl);
        // console.log('cardControl', cardControl.options[cardControl.value].text);
        // this.paymentForm['controls'].payment_method.patchValue(grandTotal, {emitEvent: false});
      }
    );

    // this.paymentForm.get('array')['controls'][2].valueChanges
    //   .subscribe((newVal) => {
    //     const arr = <FormArray>this.paymentForm.controls['array'];
    //     const total = 100;
    //     arr.controls.forEach((c: any) => {
    //       console.log(c.value);
    //       // total += +c.value.v;
    //     });
    //     console.log('total', total);
    //     alert(total);
    //     this.paymentForm.get('grandTotal').patchValue(total);
    //     this.paymentForm.patchValue({
    //       grandTotal: total,
    //     });
    //   });

    // const paymentDataString = localStorage.getItem('payment-data');
    // const paymentData = JSON.parse(paymentDataString) as { reader: Reader; location: Location };
    // const passedReader = paymentData.reader;
    // this.currentLocation = paymentData.location;
    // this.init(paymentData.reader);

    this.discovering = true;
    this.connecting = false;
    this.connectFailed = false;

    // the call for getLocations is unnecessary but useful when page is refreshed to get token from API
    // otherwise discovery will not work - Note: getLocations call automatically triggers get-token API call
    this.paymentMgr.getLocations().then(() => {
      this.usingSimulator = this.readerid === 'SIMULATOR';
      this.paymentMgr.discoverReaders(this.usingSimulator ? 'st_simulated' : this.locationid, this.usingSimulator).then((discoverResult) => {
        console.log("discoverResult",discoverResult);
        if (discoverResult.success) {
          let tempReader: Reader | null = null;
          for (const discoveredReader of this.paymentMgr.discoveredReaders) {
            console.log("this.readerid",this.readerid);
            console.log("discoveredReader.id",discoveredReader.id);
            if (discoveredReader.id === this.readerid) {
              tempReader = discoveredReader;
              console.log("tempReader",tempReader);
              break;
            }
          }
          this.discovering = false;
          if (tempReader != null) {
            this.connecting = true;
            console.log("Connecting to reader...");
            this.paymentMgr.connectToReader(tempReader).then((result) => {
              console.log('connect result =', result);
              this.connecting = false;
              if (!isErrorResponse(result)) {
                console.log('reader connected =', result);
                console.log("Connected to simulator successfully!");
                this.currentReader = result.reader;
                this.canPay = true;
              } else {
                this.connectFailed = true;
                console.error('Failed to connect to selected reader...');
                Swal.fire(Swaldata.SwalErrorToast("Failed to connect to selected reader...\n" + tempReader.label));
              }
            });
          }
        } else {
          Swal.fire(Swaldata.SwalErrorToast("Failed to discover...\n" + discoverResult.error));
        }
      });
    });
  }

  private createCartItemNamedColored(name: string, attribute: string, pricePerItem: number, quantity: number): IZaborCartItem {
    const totalAmount = pricePerItem * quantity;
    return {description: `${name}, ${attribute}`, name, attribute, amount: totalAmount, quantity, pricePerItem, amountText: `${pricePerItem} * ${quantity} = ${totalAmount}`};
  }

  // private async init(reader: Reader) {
  //   console.log('reader =', reader);
  //   const result = await this.paymentMgr.connectToReader(reader);
  //   console.log('reader connection =', result);
  //   console.log('Connected Successfully!');
  //   Swal.fire(Swaldata.SwalSuccessToast('Connected Successfully!'));
  //   if (!isErrorResponse(result)) {
  //     this.currentReader = result.reader;
  //   }
  // }

  async onPaymentSubmit(form: NgForm) {
    if (!this.paymentForm.valid) {
      const controls = this.paymentForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          alert('invalid data -> ' + name);
        }
      }
      return;
    }

    // enable disable controls
    this.paymentForm.controls['payment_method'].enable();

    this.spinner.show();

    const formData = this.paymentForm.value;
    console.log('formData', formData.array);
    console.log('formData', formData.array[0]);
    console.log('formData', formData.array[1]);
    this.lineItems.length = 0;
    for (let i = 0; i < formData.array.length; i++) {
      const formGroup = formData.array[i];
      this.lineItems.push(this.createCartItemNamedColored(formGroup.itemName, formGroup.itemAttr, formGroup.pricePerItem, formGroup.quantity));
    }

    // add optional fields if not empty
    // if (formData.line2 && formData.line2.trim().length > 0) {
    //   dataToPost.address.line2 = formData.line2;
    // }

    const fullAmount = this.lineItems.reduce((prev, curr) => prev + (curr.pricePerItem * curr.quantity), 0);
    this.cartInfo = { currency: formData.currency, total: fullAmount * 100, summary: `${this.lineItems.length} items purchased!` };
    const success = await this.paymentMgr.collectCardPayment({cartInfo: this.cartInfo, cartItems: this.lineItems, paymentMethod: formData.payment_method, cardNumber: formData.card_number });
    if (success) {
      this.spinner.hide();
      (<any>$('#confirmPaymentModal')).modal('show');
    } else {
      Swal.fire(Swaldata.SwalErrorToast('Payment error!'));
    }
  }

  async processPayment(evt: MouseEvent) {
    evt.preventDefault();
    (<any>$('#confirmPaymentModal')).modal('hide');
    this.spinner.show();
    const result = await this.paymentMgr.processPayment();
    if (!isPaymentIntentCaptureResponse(result)) {
      console.log('automatic payment success');
    } else {
      console.log('manual payment success');
    }
    this.spinner.hide();
    Swal.fire(Swaldata.SwalSuccessToast('Paid successfully!'));
  }

  async cancelPayment(evt: MouseEvent) {
    evt.preventDefault();
    (<any>$('#confirmPaymentModal')).modal('hide');
    this.spinner.show();
    await this.paymentMgr.cancelReaderAction();
    // await this.paymentMgr.cancelPendingPayment();
    this.spinner.hide();
    Swal.fire(Swaldata.SwalSuccessToast('Payment cancelled!'));
  }

  updateCardText(text: string) {
    const tmp = text.replace(/\s/g, '');
    let selectedCartPaymentMethod = tmp.split('-')[1];
    if (selectedCartPaymentMethod === 'insufficient_funds') {
      selectedCartPaymentMethod = 'charge_declined_insufficient_funds';
    }
    if (selectedCartPaymentMethod === 'lost_card') {
      selectedCartPaymentMethod = 'charge_declined_lost_card';
    }
    if (selectedCartPaymentMethod === 'stolen_card') {
      selectedCartPaymentMethod = 'charge_declined_stolen_card';
    }
    if (selectedCartPaymentMethod === 'expired_card') {
      selectedCartPaymentMethod = 'charge_declined_expired_card';
    }
    if (selectedCartPaymentMethod === 'processing_error') {
      selectedCartPaymentMethod = 'charge_declined_processing_error';
    }
    this.paymentForm['controls'].payment_method.patchValue(selectedCartPaymentMethod, {emitEvent: false});
  }

}
