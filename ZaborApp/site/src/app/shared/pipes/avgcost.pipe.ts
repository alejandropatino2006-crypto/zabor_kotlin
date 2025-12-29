import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avgcost'
})
export class AvgcostPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (value <= 10)
      return '$';
    else if (value > 10 && value <= 25)
      return '$$'
    else if (value > 25 && value <= 50)
      return '$$$'
    else
      return '$$$$'
  }

}
