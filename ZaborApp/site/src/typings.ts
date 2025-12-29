// import DataTables, { Config as DatatablesNetConfig, ConfigColumns as DatatablesNetConfigColumns1, Api as DatatablesNetApi } from 'datatables.net';
import { ADTSettings } from 'angular-datatables/src/models/settings';


export { ADTColumns as DatatablesNetConfigColumns } from 'angular-datatables/src/models/settings';

// export type { Config as DatatablesNetConfig, ConfigColumns as DatatablesNetConfigColumns, Api as DatatablesNetApi } from 'datatables.net';
// export type { Api as DatatablesNetApi } from '@types/datatables.net';

// tslint:disable-next-line:no-empty-interface
// export interface DatatablesNetConfigColumns extends ADTColumns { }
// tslint:disable-next-line:no-empty-interface
// export interface DatatablesNetConfigColumns extends DatatablesNetConfigColumns { }

export interface MyDataTablesSettings extends ADTSettings {
// export interface MyDataTablesSettings extends DataTables.Settings {
// export interface MyDataTablesSettings extends DatatablesNetConfig {
  responsive?: boolean;
  language?: any;
  buttons?: any[]; // add the buttons property here
}

// tslint:disable-next-line:no-empty-interface
export interface DatatablesNetApi<T> extends DataTables.Api { }

// tslint:disable-next-line:no-empty-interface
export interface DatatablesNetConfig /*extends DataTables.Configs*/ {
  responsive?: boolean;
  language?: any;
  buttons?: any[]; // add the buttons property here
}
