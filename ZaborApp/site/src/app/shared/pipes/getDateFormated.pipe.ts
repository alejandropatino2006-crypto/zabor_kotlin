import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getDateFormated' })
export class GetDateFormated implements PipeTransform {
    transform(value: string): string {
        if (value != null && value != '') {

            let d = new Date(value)
            var datestring = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

            return datestring;
        } else {
            return 'Closed'
        }
    }
}