import { Component, Input, OnInit } from '@angular/core';
import { RestaurantService } from '../../../services/restaurant.service';

// import * as jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfMake.vfs;

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html'
})
export class InvoiceComponent implements OnInit {

  @Input() orderDetail: any;
  @Input() invoiceby: string;
  orderId: any;
  adsImage: any = [];
  testingPdf = true;

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit() {
    console.log('orderDetail.cart', this.orderDetail.cart);
    this.orderId = this.orderDetail.id;
    for (let i = 0 ; i < 4 ; i++) {
      this.getAds(i);
    }
  }

  generatePdf(eventTarget: EventTarget) {
    // const documentDefinition = {
    //   content: [
    //     {
    //       columns: [
    //         [
    //           {
    //             text: this.getOrderDate(),
    //             style: 'light',
    //             alignment: 'left',
    //           }
    //         ],
    //         [
    //           {
    //             text: 'Order No.: #' + this.orderId,
    //             style: 'name',
    //             bold: true,
    //             lineHeight: 2,
    //             alignment: 'right',
    //           }
    //
    //         ],
    //       ]
    //     },
    //
    //     {
    //       columns: [
    //         [
    //           {
    //             text: 'Invoice',
    //             bold: true,
    //             fontSize: 30,
    //             alignment: 'left',
    //             margin: [0, 20, 0, 20]
    //           }
    //         ],
    //         [
    //           {
    //             image: this.getImage(),
    //             width: 75,
    //             alignment: 'right'
    //           }
    //         ]
    //       ]
    //     },
    //     {
    //       columns: [
    //         [{
    //           text: 'Billing Address',
    //           margin: [0, 20, 0, 0],
    //           bold: true,
    //           fontSize: 16,
    //         },
    //         {
    //           text: this.orderDetail.firstname + ' ' + this.orderDetail.lastname,
    //           margin: [0, 10, 0, 0]
    //         },
    //         {
    //           text: 'Email : ' + this.orderDetail.email,
    //         },
    //         {
    //           text: this.orderDetail.houseno + ' ' + this.orderDetail.address,
    //         },
    //         {
    //           text: this.orderDetail.city
    //         },
    //         {
    //           text: 'Contant No : ' + this.orderDetail.phone,
    //         },
    //         ],
    //         [
    //           {
    //             text: 'Restaurant',
    //             margin: [0, 20, 0, 0],
    //             bold: true,
    //             fontSize: 16,
    //           },
    //           {
    //             text: this.orderDetail.r_name,
    //             margin: [0, 10, 0, 0]
    //           },
    //           {
    //             text: 'Email : ' + this.orderDetail.r_email,
    //           },
    //           {
    //             text: this.orderDetail.r_address,
    //           },
    //           {
    //             text: this.orderDetail.r_city
    //           },
    //           {
    //             text: 'Contant No : ' + this.orderDetail.r_contact,
    //           },
    //         ]
    //       ]
    //     },
    //
    //     {
    //       text: 'Items',
    //       style: 'header'
    //     },
    //     this.getCartItems(),
    //     {
    //       columns: [
    //         [{
    //
    //         }
    //         ],
    //         [
    //           {
    //             alignment: 'right',
    //             margin: [0, 20, 0, 20],
    //             layout: 'noBorders', // optional
    //             table: {
    //               // headers are automatically repeated if the table spans over multiple pages
    //               // you can declare how many rows should be treated as headers
    //               headerRows: 1,
    //               widths: [100, 100],
    //
    //               body: this.getinvoiceBody()
    //             }
    //           }
    //         ],
    //       ]
    //     },
    //
    //   ],
    //   info: {
    //     title: 'Invoice',
    //   },
    //   styles: {
    //     header: {
    //       fontSize: 18,
    //       bold: true,
    //       margin: [0, 20, 0, 10],
    //       decoration: 'underline'
    //     },
    //     light: {
    //       fontSize: 12,
    //       bold: false
    //     },
    //     jobTitle: {
    //       fontSize: 14,
    //       bold: true,
    //       italics: true
    //     },
    //     sign: {
    //       margin: [0, 50, 0, 10],
    //       alignment: 'right',
    //       italics: true
    //     },
    //     tableHeader: {
    //       bold: true,
    //     }
    //   }
    // };
    const documentDefinition = {
      content: [
        {
          columns: [
            [
              {
                text: this.getOrderDate(),
                style: 'light',
                alignment: 'left',
              }
            ],
            [
              {
                text: 'Order No.: #' + this.orderId,
                style: 'name',
                bold: true,
                lineHeight: 2,
                alignment: 'left',
              }

            ],
          ]
        },

        {
          columns: [
            [
              {
                text: 'Invoice',
                bold: true,
                fontSize: 30,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              }
            ],
            [
              {
                image: this.getImage(),
                width: 75,
                alignment: 'left'
              }
            ]
          ]
        },

        {
          columns: [
            [{
              text: 'Billing Address',
              margin: [0, 20, 0, 0],
              bold: true,
              fontSize: 16,
            },
            {
              text: this.orderDetail.firstname + ' ' + this.orderDetail.lastname,
              margin: [0, 10, 0, 0]
            },
            {
              text: 'Email : ' + this.orderDetail.email,
            },
            {
              text: this.orderDetail.houseno + ' ' + this.orderDetail.address,
            },
            {
              text: this.orderDetail.city
            },
            {
              text: 'Contant No : ' + this.orderDetail.phone,
            },
            ]
          ]
        },
        {
          columns: [
            [
              {
                text: 'Restaurant',
                margin: [0, 20, 0, 0],
                bold: true,
                fontSize: 16,
              },
              {
                text: this.orderDetail.r_name,
                margin: [0, 10, 0, 0]
              },
              {
                text: 'Email : ' + this.orderDetail.r_email,
              },
              {
                text: this.orderDetail.r_address,
              },
              {
                text: this.orderDetail.r_city
              },
              {
                text: 'Contant No : ' + this.orderDetail.r_contact,
              },
            ]
          ]
        },

        {
          text: 'Items',
          style: 'header'
        },
        this.getCartItems(),
        {
          columns: [
            [
              {
                alignment: 'right',
                margin: [0, 20, 0, 20],
                layout: 'noBorders', // optional
                table: {
                  // headers are automatically repeated if the table spans over multiple pages
                  // you can declare how many rows should be treated as headers
                  headerRows: 1,
                  widths: [100, 100],

                  body: this.getinvoiceBody()
                }
              }
            ],
          ]
        },

        {
          columns: [
            [
              {
                image: this.adsImage[0],
                width: 75,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              }
            ],
            [
              {
                image: this.adsImage[1],
                width: 75,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              }
            ]
          ]
        },

        {
          columns: [
            [
              {
                image: this.adsImage[2],
                width: 75,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              }
            ],
            [
              {
                image: this.adsImage[3],
                width: 75,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              }
            ]
          ]
        },

      ],
      info: {
        title: 'Invoice',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        light: {
          fontSize: 12,
          bold: false
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },
        tableHeader: {
          bold: true,
        }
      }
    };
    const tableLayouts = {
      exampleLayout: {
        hLineWidth(i, node) {
          if (i === 0 || i === node.table.body.length) {
            return 0;
          }
          return (i === node.table.headerRows) ? 2 : 1;
        },
        vLineWidth(i) {
          return 0;
        },
        hLineColor(i) {
          return i === 1 ? '#FFBD14' : '#aaa';
        },
        paddingLeft(i) {
          return i === 0 ? 0 : 8;
        },
        paddingRight(i, node) {
          return (i === node.table.widths.length - 1) ? 0 : 8;
        },
        paddingTop(i) {
          return 5;
        },
        paddingBottom(i) {
          return 5;
        }
      }
    };
    pdfMake.createPdf(documentDefinition, tableLayouts).open();
  }

  getinvoiceBody() {
    if (this.testingPdf) { return 'inv-body'; }
    const arr = [
      [{ text: 'Food Tax', bold: true }, '$' + this.orderDetail.food_tax.toFixed(2)],
      [{ text: 'Drink Tax', bold: true }, '$' + this.orderDetail.drink_tax.toFixed(2)],
      [{ text: 'Convenience Fee', bold: true }, '$' + this.orderDetail.convenience_fee.toFixed(2)],
      [{ text: 'SubTotal', bold: true }, '$' + this.orderDetail.subtotal.toFixed(2)],
      [{ text: 'Tax', bold: true }, '$' + this.orderDetail.tax.toFixed(2)],
      [{ text: 'Credit Card', bold: true }, JSON.parse(this.orderDetail.payment_data).payment_method_details.card.last4],
      [{ text: 'Total', bold: true }, '$' + this.orderDetail.without_discount.toFixed(2)],
    ];

    if (this.orderDetail.discount !== 0) {
      arr.push([{ text: 'Discount', bold: true }, '- $' + this.orderDetail.discount.toFixed(2)]);
    }

    if (this.orderDetail.delivery_mode === 1 && this.orderDetail.delivery_charge > 0) {
      arr.push([{ text: 'Delivery Charges', bold: true }, '$' + this.orderDetail.delivery_charge.toFixed(2)], );
    }
    arr.push([{ text: 'Total', bold: true }, '$' + this.orderDetail.total.toFixed(2)]);
    return arr;
  }

  getImage() {
    if (this.testingPdf) { return 'img'; }
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0iQzAzRDRGQjA5Rjc0MDkyODJFQTBCN0I5MDJEOTY5N0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RUQ5NUIwNEIxMzc0MTFFQTkwMDJCNjIzRjNFMDhEM0MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RUQ5NUIwNEExMzc0MTFFQTkwMDJCNjIzRjNFMDhEM0MiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjMzOWRiNTIyLTMwZjMtYWU0My1hNDJkLWE3YjUyYWY3ZTNhMCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmNjOTRkMzI5LWI2MjctMmY0OS1hN2E3LWI5YWRkYWE2MTA2ZiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu5HmNYAAJ03SURBVHja7N0HWFNXwP9xkxD2BpGlIIqCMlRwoKKgoqA4cLfOVltrax21e1m7p9qp3VU7rFr33nsvnIgLRJC9NyH5x/q+fftvrQLJvbmB7+fh4bEUck7OyTi/mzNkPpM+aAQAAACgYZDTBAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAAIAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAACAAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAEAAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAAAAAgAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAABAAAAAAAAIADQBAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAAQAAAAAAACAAAAAAACAAAAAAA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AAAAAAAAAAIAAAAAAAAEAAAAAAAAgAAAAAAAAAAQAAAAAAAAAAIAAAAAAABAAAAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAAACAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAAACAAAAAAAAQAAAAAAAAAAIAAAAAAAAAAEAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAAAAgAAAAAAAEAAAAAAAAAACAAAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAgAAAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAgAAAAAAAAAAQAAAAAAAAAAIAAAAAAABAAAAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAAACAAAAAAAAQAAAAAAAAAAIAAAAAAAAAAEAAAAAAAAgAAAAAAAAQAAAAAAAAAAIAAAAAAAAAAEAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAAAAgAAAAAAAEAAAAAAAAAACAAAAAAAAAABAAAAAAAAIAAAAAAAAEAAAAAAAAAACAAAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAgAAAAAAAAAAQAAAAAAAAAAIAAAAAAABAAAAAAAAAAAgAAAAAAAAAAQAAAAAAAAIAAAAAAABAAAAAAAAAAAgAAAAAAAAAAQAAAAAAACAAAAAAAAAABAAAAAAAAIAAAAAAAAAAEAAAAAAAAAACAAAAAAAAQAAAAAAAAAAIAAAAAAAAEAAAAAAAAAACAAAAAAAAQAAAAAAAAAAIAAAAAAAAAAEAAAAAAMD/Y7+OaQAAAAAE9W9tDwcR/MQAAAAABgAAADAAAACAAQAAAAwAAABgAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAMgAQAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAGAAAAmEuAAQA/yMl23ydLTwAAAABJRU5ErkJggg==";
  }
  getCartItems() {
    if (this.testingPdf) { return 'cart-items'; }
    return {
      layout: 'exampleLayout', // optional
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['10%', '30%', '10%', '10%'],
        body: [
          [{ text: 'UPC', bold: true }, { text: 'Items name', bold: true }, { text: 'Quantity', bold: true }, { text: 'Price', bold: true }],
          ...JSON.parse(this.orderDetail.cart).map((ele, i) => {
            let upc = ele.upc_no;
            if (upc) {
              upc = "*" + upc.slice(-4);
            }
            return [upc, ele.itemName, ele.quantity, '$' + (ele.quantity * ele.itemPrice).toFixed(2)];
          })
        ]
      }
    };
  }
  getOrderDate() {
    if (this.testingPdf) { return '01/01/2019'; }
    // let today = new Date();

    // let dd = String(today.getDate()).padStart(2, '0');
    // let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // let yyyy = today.getFullYear();

    // return dd + '/' + mm + '/' + yyyy;
    const tempDate = new Date(this.orderDetail.created_date);
    let hours;
    hours = tempDate.getHours();
    let minutes;
    minutes = tempDate.getMinutes();
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return tempDate.getFullYear() + "-" + (tempDate.getMonth() + 1) + "-" + tempDate.getDate() + " " + hours + ":" + minutes;
    // + tempDate.getHours() + ":" + tempDate.getMinutes() + ":" + tempDate.getSeconds()
  }

  getAds(index) {
    this.restaurantService.getInvoiceImages(index).subscribe((res: any) => {
      console.log("getInvoiceImages: ", res);
      const TYPED_ARRAY = new Uint8Array(res.file.data);
      const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
      }, '');
      const base64String = btoa(STRING_CHAR);
      this.adsImage[index] = 'data:image/png;base64,' + base64String;
    });
  }

}
