import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getCus'
})
export class GetCus implements PipeTransform {

    transform(value: any, args?: any): any {

        let cusname = [];
        if (value && value.length > 0) {
            value.forEach(element => {
                if (element && element.option_name && element.option_name != '')
                    cusname.push(element.option_name)
            });
        }

        return cusname.join()
    }

}
