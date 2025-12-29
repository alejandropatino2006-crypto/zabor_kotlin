import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Reader } from '@stripe/terminal-js';
import { NgxSpinnerService } from 'ngx-spinner';
import { PaymentsManager } from 'src/app/shared/terminal/payments-manager';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-readers',
  templateUrl: './readers.component.html',
  styleUrls: ['./readers.component.scss']
})
export class ReadersComponent implements OnInit, AfterViewInit {

  private paymentMgr: PaymentsManager;
  private paymentMgrForSimulation: PaymentsManager;
  account_id: String;
  location_id: string;
  discoveredReadersList: Reader[] = [];
  discoveredSimlatedReadersList: Reader[] = [];

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private spinner: NgxSpinnerService,
    private http: HttpClient
  ) {
    this.paymentMgr = new PaymentsManager();
    this.paymentMgrForSimulation = new PaymentsManager();
  }

  ngAfterViewInit(): void {
    
  }

  ngOnInit() {
    
    this.account_id = this.route.snapshot.paramMap.get("accountid");
    this.location_id = this.route.snapshot.paramMap.get("locationid");

    

    

    this.startDiscovery();
    this.startSimulatedDiscovery();

    
  }

  async handleDiscoverClicked() {
    await this.startDiscovery();
  }

  async handleSimulatedDiscoverClicked() {
    await this.startSimulatedDiscovery();
  }

  

  private async startSimulatedDiscovery() {
    console.log("coming inside startSimulatedDiscovery");
    console.log("this.spinner",this.spinner);
    this.spinner.show();  

    const simulatedDiscoverResult = await this.paymentMgrForSimulation.discoverReaders(this.location_id, true);

    console.log("simulatedDiscoverResult",simulatedDiscoverResult);

    this.discoveredSimlatedReadersList = this.paymentMgrForSimulation.discoveredReaders;

    //this.discoveredSimlatedReadersList = [];

    console.log("this.discoveredSimlatedReadersList",this.discoveredSimlatedReadersList);

    this.spinner.hide();
  }

  private async startDiscovery() {
    console.log("coming inside startDiscovery");
    this.spinner.show();    

    // this.http
    //       .get(`${environment.apiUrl}` + "/pmt/readers-list?accountId=" + this.account_id + "&locationId="+this.location_id)
    //       .subscribe((resp:any) => {
    //         this.discoveredReadersList = resp?.data;
    //         console.log("readers-list", resp);
    //       });

    // const discoverResult = await this.paymentMgr.discoverReaders(this.location_id, false);

    // console.log("discoverResult",discoverResult);

    // this.discoveredReadersList = this.paymentMgr.discoveredReaders;

    // console.log("this.discoveredReadersList",this.discoveredReadersList);

    this.spinner.hide();

    // this.simulatedDiscoveredReadersList = this.paymentMgr.discoveredReaders;

    // this.discoveredReadersList = [];
    // this.discoveredOnce = true;
    // this.discovering = true;
    // this.showDiscoveryResults = false;
    // this.useSimulatedTerminal = false;
    //if (this.discovering) {
      //console.group('Discovery');
      // const discoverResult = await this.paymentMgr.discoverReaders(this.location_id, false/*this.useSimulatedTerminal*/);
      // let error = false;
      // let errorMsg = '';
      // if (!discoverResult.success) {
      //   error = true;
      //   if (discoverResult.error) {
      //     errorMsg = 'Failed to discover...\n' + discoverResult.error;
      //   }
      //   if (discoverResult.reason) {
      //     errorMsg = 'Failed to discover...\n' + discoverResult.reason;
      //     if (discoverResult.reason === 'Cancelled') {
      //       console.log('discovery cancelled');
      //     }
      //   }
      // } else {
        // this.showDiscoveryResults = true;
        // this.canRegister = true;
        // if (this.paymentMgr.discoveredReaders.length > 0) {
        //   this.discoveredReadersList = this.paymentMgr.discoveredReaders;
        // } else {
        //   error = true;
        //   errorMsg = 'No terminals/readers could be found...';
        // }
      //}

      // if (error) {
      //   console.log(errorMsg);
      //   // alert(errorMsg);
      // }
      // console.groupEnd();
    // } else {
    //   console.group('Cancel Discovery');
    //   await this.paymentMgr.cancelReadersDiscovery();
    //   console.groupEnd();
    // }
    // this.discovering = false;
  }

}
