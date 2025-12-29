import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatablesNetApi, MyDataTablesSettings } from '../../../../../typings';
import { Subject } from 'rxjs/internal/Subject';

const defaultGridOptions = {
  "destroy": true,
  "ordering": true,
  "paging": true,
  "searching": true,
  "serverSide": false,
  "processing": false,
  // "select": false,
  // "lengthMenu": [ [50, 100, 250, -1], [50, 100, 250, "All"] ],
  "lengthMenu": [ [10, 15, 25, 35, 50, -1], [10, 15, 25, 35, 50, "All"] ],
  // "lengthMenu": [ [50, 100, 250, -1], [50, 100, 250, "All"] ],
  language: { // https://datatables.net/reference/option/language
    "emptyTable": "No data available",
    // "info": "Showing [_START_ .. _END_] of _TOTAL_ entries",
    "loadingRecords": "Loading data now! wait...",
    // "lengthMenu": "Displayed number of entries _MENU_",
    // "searchPlaceholder": "Search records",
    // "search": "Search:",
    // "paginate": {
    //   "first": "&lt;&lt;",
    //   "next": '<i class="fa fa-fw fa-long-arrow-right">',
    //   "previous": '<i class="fa fa-fw fa-long-arrow-left">',
    //   "last": "&gt;&gt;"
    // }
  },
};

@Component({
  selector: 'app-datatables-net-table',
  templateUrl: './datatables-net-table.component.html',
  styleUrls: ['./datatables-net-table.component.scss'],
})
export class DatatablesNetTableComponent implements OnInit, AfterViewInit {
  @ViewChild("datatablesNetTable") dtDomElement: ElementRef<HTMLTableElement>;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  _dtOptions: MyDataTablesSettings = {};
  _dtTrigger: Subject<any> = new Subject<any>();
  // dtInstanceCallback: Promise<DataTables.Api>;
  dtInstanceCallback: Promise<DatatablesNetApi<any>>;
  // dtInstance: DataTables.Api;
  // dtInstance: DatatablesNetApi<any>;
  _headings: string[] = ["#", "A", "B", "C", "D", "E", "F"];

  @Input() rowsCount = 0;
  @Input() headingColumnsCount = 0;

  constructor() { }

  setDtOptions(value: MyDataTablesSettings) {
    this._dtOptions = {
      ...defaultGridOptions,
      ...value,
    };
  }

  setHeadings(value: string[]) {
    this._headings = value;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  load(): void {
    this.dtDomElement.nativeElement.classList.remove('hidden');
    this._dtTrigger.next(null);
  }

  rerender(): void {
    // this.rowsCount = 0; // bug here - does not reset afterwards to value set from parent component
    // this.dtInstance.destroy();
    // this.dtTrigger.next();

    // this.dtElement.dtInstance.then((dtInstanceCurr: DataTables.Api) => {
    this.dtElement.dtInstance.then((dtInstanceCurr: DatatablesNetApi<any>) => {
      // Destroy the table first
      dtInstanceCurr.destroy();
      // Call the dtTrigger to rerender again
      this._dtTrigger.next(null);
      // // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // this.dtElement.dtInstance.then((dtInstance: DatatablesNetApi<any>) => {
      //   dtInstance.on('draw.dt', () => {
      //     if ($('.dataTables_empty').length > 0) {
      //       $('.dataTables_empty').remove();
      //     }
      //   });
      // });
    });
  }

}
