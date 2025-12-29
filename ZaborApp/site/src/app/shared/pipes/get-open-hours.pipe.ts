import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getOpenHours'
})
export class GetOpenHoursPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    //get today day

    let days = ['sun', 'mon', 'tue', 'wed ', 'thu', 'fri', 'sat'];
    let d = new Date();
    let day = days[d.getDay()].trim()



    //get open and close time of day of restaurant

    if (value[day + 'open_time'] && value[day + 'open_time'] != '' && value[day + 'close_time'] && value[day + 'close_time'] != '') {


      // tslint:disable-next-line:max-line-length
      if (d.getTime() > new Date(d.getFullYear(), d.getMonth(), d.getDate(), value[day + 'open_time'].split(':')[0], value[day + 'open_time'].split(':')[1]).getTime() && d.getTime() < new Date(d.getFullYear(), d.getMonth(), d.getDate(), value[day + 'close_time'].split(':')[0], value[day + 'close_time'].split(':')[1]).getTime()) {
        return 'Opened';
      } else {
        return 'Closed'
      }
    }
    return 'Closed';
  }

}
