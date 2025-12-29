import {Component, OnDestroy, OnInit} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { SwalErrorToast, SwalSuccessToast } from 'src/app/shared/helpers/swalFunctionsData';
import { environment } from "../../../../environments/environment";
import {interval, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {addressValidator, noOnlyWhitespaceNotRequiredValidator, noOnlyWhitespaceValidator} from '../../../shared/helpers/custom.validator';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import {AuthenticationService} from '../../../shared/services/frontServices/authentication.service';
import {StepModel} from '../../../shared';
import {RegistrationStepsService} from './registration-steps.service';
import {LoginStepsService} from './login-steps.service';

declare var $: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  styles: ['.total-ul{border-bottom: 1px #d6d6d6 solid;}']
})
export class MenuComponent implements OnInit, OnDestroy {
  public stepsType$: 'register' | 'login';

  Routersubscription: Subscription | undefined;
  res_id = -1;
  menu: any = [];
  customizations: any = [];

  itemId: number;
  itemName: string;
  itemPrice: number;
  itemCustomization: any;

  maxObj: any = {};

  cart: Array<any> = [];
  addeditems: Array<any> = [];

  filePath: string = environment.fileurl + '/';
  galleryImgs: Array<any> = [];
  resDetail: any = [];

  alreadyItems: Array<any> = [];

  taxes: any = {};

  subtotal = 0;
  total = 0;
  foodTax = 0;
  drinkTax = 0;
  convenienceFeeType = 0;
  convenienceFee = 0;
  // convenienceFeePercentage = 0;
  grandTax = 0;
  convenienceFeeValue = 0;

  isLoggedIn = false;
  resOpened = false;
  specialNotes = '';
  isNoteItem = true;
  // currentStep: Observable<StepModel>;
  currentRegisterStep: Observable<StepModel>;
  currentLoginStep: Observable<StepModel>;

  availableGroupsCount = 0;

  // constructor(private _route: Router, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private route: ActivatedRoute, private stepsService: StepsService) { }
  // tslint:disable-next-line:max-line-length
  constructor(private _route: Router, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private route: ActivatedRoute, private registrationStepsService: RegistrationStepsService, private loginStepsService: LoginStepsService) { }

  HardReset() {
    this.res_id = -1;
    this.menu = [];
    this.customizations = [];

    this.itemId = -1
    this.itemName = "";
    this.itemPrice = 0;
    this.itemCustomization = []

    this.cart = [];
    this.addeditems = [];
    this.galleryImgs = [];
    this.resDetail = [];

    this.alreadyItems = [];

    this.taxes = {};

    this.subtotal = 0;
    this.total = 0;
    this.foodTax = 0;
    this.drinkTax = 0;
    this.grandTax = 0;
    this.convenienceFeeValue = 0;

    this.resOpened = false;
  }
  ngOnInit() {
    this.currentRegisterStep = this.registrationStepsService.getCurrentStep();
    this.currentLoginStep = this.loginStepsService.getCurrentStep();
    // this.changeStepsType('login');
    this.changeStepsType('register');

    const params = new URLSearchParams(window.location.search);
    if (params.has('shouldAddItemsAgain') && params.get('shouldAddItemsAgain') === 'true') {
      Swal.fire(Swaldata.SwalWarnToast('Checkout cancelled! Add your items again!'));
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }

    if (localStorage.getItem('currentUserId'))
      this.isLoggedIn = true
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"), 10)
    this.getRestaurantMenu()
    this.routeEvent(this._route);
  }

  routeEvent(router: Router) {
    this.Routersubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.HardReset();
        this.res_id = parseInt(this.route.snapshot.paramMap.get("id"), 10);
        this.getRestaurantMenu()
        // this.changeStepsType('register');
      }
    });
  }

  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }


  getTaxValueOfItem(itemId) {
    // get tax of that item

    const tax = [];
    tax['tax'] = 0
    tax['is_food'] = false
    tax['is_state'] = false

    this.menu.forEach(element => {
      element.items.forEach(ele => {
        if (ele.item_id == itemId) {
          console.log("item+:", element)
          if (ele.is_food) {
            tax['tax'] = Number(this.resDetail.food_tax)
            tax['is_food'] = true
          }
          if (ele.is_state) {
            tax['tax'] += Number(this.resDetail.drink_tax)
            tax['is_state'] = true
          }
          if (ele.is_bar) {
            tax['tax'] += Number(this.resDetail.drink_tax)
            tax['is_bar'] = true
          }
          tax['is_city'] = ele.is_city
          tax['price'] = ele.item_price
        }
      })
    })
    return tax
  }

  getAlreadyMenu() {
    if (this.restaurantservice.cart['cart'] == undefined) {
      this.spinner.show()
      this.restaurantservice.getcart().subscribe(data => {
        if (data.status) {
          if (data.data && data.data.res_id != this.res_id) {
            Swal.fire(
              'You have items from other Restaurant',
              'If you choose item from here old Restaurant item will be remove',
              'warning'
            )
          } else {
            if (data.data) {
              console.log('cart response field type', typeof data.data.cart);
              const cartData = (typeof data.data.cart === 'string') ? JSON.parse(data.data.cart) : data.data.cart;
              this.updateAlreadyitem(cartData);
            }
          }
        }
      }).add(() => {
        this.spinner.hide()
      })
    } else {
      this.spinner.show()
      if (this.restaurantservice.cart['res_id'] != this.res_id) {
        Swal.fire(
          'You have items from other Restaurant',
          'If you choose item from here old Restaurant item will be remove',
          'warning'
        )
      }
      this.updateAlreadyitem([...this.restaurantservice.cart['cart']])

      // this.updateCartforQuantityCheck()
      this.spinner.hide()
    }
  }

  updateAlreadyitem(alreadyMenu) {

    this.cart = [...alreadyMenu]
    this.cart.forEach(ele => {
      this.alreadyItems.push(ele.itemId)
    })
    this.updateCartforQuantityCheck()

    console.log('customizations', this.customizations)
    this.cart.forEach((e, i) => {
      let t = this.getTaxValueOfItem(e.itemId)
      // this.cart[i].taxtype = t['type'];
      this.cart[i].taxper = t['tax'];
      this.cart[i].is_food = t['is_food'];
      this.cart[i].is_state = t['is_state'];
      this.cart[i].is_city = t['is_city'];
      let proPrice = t['price']
      console.log(e.customization)
      if (e.customization != null) {
        e.customization.forEach((element, index) => {
          let t1 = this.getCusItemPrice(element.option_id)
          if (t1.proAvail)
            proPrice += t1.price
          else
            delete this.cart[i].customization[index]
        });
        this.cart[i].customization = this.cart[i].customization.filter(c => (c != null))
      }
      this.cart[i].itemPrice = proPrice
      console.log(this.cart[i])
    })
    this.updateTotalTax()
  }

  getCusItemPrice(id) {
    let temp = { proAvail: false, price: 0 };
    this.customizations.forEach(element => {
      if (element.items && element.items != null) {
        element.items.forEach(e => {
          if (e.ci_id === id)
            temp = { proAvail: true, price: e.option_price };
        });
      }
    });
    console.log(id, temp);
    return temp;
  }

  getRestaurantMenu() {
    this.spinner.show()
    this.restaurantservice.getResMenu(this.res_id).subscribe(
      data => {
        if (data.status) {
          console.log("getRestaurantMenu: ", data);
          data.customizations.forEach(element => {
            element.selectedCount = 0;
            if (!element.max) {
              element.max = element.items.length;
            }
          });
          this.menu = data.data;
          this.menu.forEach(element => {
            element['isAvailable'] = this.restaurantservice.checkifGroupAvailable(element);
            console.log("isAvailable", element['isAvailable']);
            element.items.forEach(ele => {
              console.log("ele.discount_period", ele.discount_period);
              if (ele.discount_period != null && ele.discount_period != '' && ele.discount_period != 'null' && ele.discount_period != undefined) {
                const [startDateString, endDateString] = ele.discount_period.split(' - ');
                const startDate = new Date(startDateString);
                const endDate = new Date(endDateString);
                const currentDate = new Date();
                const isWithinRange = currentDate >= startDate && currentDate <= endDate;
                if (isWithinRange) {
                  ele.isWithinRange = true;
                  if (ele.discount_type == "FIXED") {
                    ele.d_price = ele.item_price - ele.discount_amount;
                  } else if (ele.discount_type == "PERCENTAGE") {
                    ele.d_price = ele.item_price - ((ele.item_price * ele.discount_amount) / 100);
                  } else {
                    ele.d_price = ele.item_price
                  }
                } else {
                  ele.isWithinRange = false;
                  ele.d_price = ele.item_price
                }
              } else {
                ele.d_price = ele.item_price
                ele.isWithinRange = false
              }
              console.log("ele", ele);
            })
          });
          this.availableGroupsCount = this.menu.filter(group => group.isAvailable).length;
          this.customizations = data.customizations;
          this.galleryImgs = data.gallery;
          this.taxes = data.taxes;
          // console.log("taxes: ", this.taxes);
          this.resDetail = data.res;
          this.resDetail.food_tax = Number(data.res.food_tax);
          this.resDetail.drink_tax = Number(data.res.drink_tax);
          this.resDetail.grand_tax = Number(data.res.grand_tax);
          // this.resDetail.driver_fee = Number(data.res.driver_fee);
          // this.resDetail.delivery_charge = Number(data.res.delivery_charge);
          this.resDetail.convenience_fee_type = Number(data.res.convenience_fee_type);
          this.convenienceFeeType = this.resDetail.convenience_fee_type;
          // console.log('restaurant convenience fee', data.res.convenience_fee);
          this.convenienceFee = Number(data.res.convenience_fee == null ? 0 : data.res.convenience_fee);
          // if (this.convenienceFeeType == "0") {
          //   this.convenienceFee = 0
          // } else if (this.convenienceFeeType == "1") {
          //   this.convenienceFee = data.res.convenience_fee
          // } else {
          //   this.convenienceFeePercentage = data.res.convenience_fee
          // }
          this.resOpened = this.restaurantservice.checkifResAvailable(this.resDetail) && this.resDetail.status == 1
        } else {
          Swal.fire(SwalErrorToast("something went wrong"))
        }
      },
      err => {
        Swal.fire(SwalErrorToast("something went wrong"))
      }
    ).add(() => {
      this.spinner.hide()
      if (localStorage.getItem('currentUserId'))
        this.getAlreadyMenu()
    })
  }

  showCustomization(id, cus, name, price, isNote) {
    console.log("isNote:", isNote)
    this.reset()
    this.itemId = id
    this.itemName = name;
    this.itemPrice = price;
    this.specialNotes = ''
    this.isNoteItem = isNote

    if (cus && cus != null && cus != 'null') {

      this.customizations.forEach(ele => {
        if (cus.includes(ele.cusid)) {
          ele.selectedCount = 0
          this.itemCustomization.push(ele)
          ele.items.forEach(item => {
            this.maxObj[item.ci_id] = false
          });
        }
      })

      console.log("itemCustomization: ", this.itemCustomization)
      console.log("maxObj: ", this.maxObj)

      $('#customizationModal').modal('show')
    }

    $('#customizationModal').modal('show')

  }

  reset() {
    this.itemId = -1;
    this.itemName = "";
    this.itemPrice = 0;
    this.itemCustomization = [];
    this.addeditems = []
  }


  addOptions(e, name, price, ci_id, index) {
    this.maxObj[ci_id] = e.target.checked
    console.log("maxObj: ", this.maxObj)
    if (e.target.checked) {
      this.itemCustomization[index].selectedCount++;
      this.itemPrice = Number(this.itemPrice) + Number(price)
      this.addeditems.push({ option_id: ci_id, option_name: name, option_price: price });
    } else {
      this.itemCustomization[index].selectedCount--;
      if (Number(this.itemPrice) > 0) {
        this.itemPrice = Number(this.itemPrice) - Number(price)
        this.addeditems = this.addeditems.filter(ele => ele.option_id != ci_id)
      }
    }
  }

  closeModal() {
    this.reset()
  }

  addProductToCart() {
    let qua = 0
    let alreadyAddedItemIndex = -1;
    this.cart.forEach((ele, i) => {
      if (ele.itemId == this.itemId) {
        alreadyAddedItemIndex = i;
        qua = this.cart[i].quantity + 1;
      }
    })

    if (this.getmanuItemmaxquantity(this.itemId) != null && qua >= this.getmanuItemmaxquantity(this.itemId)) {
      Swal.fire(SwalErrorToast('Item quantity reached to limit'));
      return;
    }

    this.alreadyItems.push(this.itemId)
    let itemTax = this.getTaxValueOfItem(this.itemId);
    let taxvalue = itemTax['tax']

    if (alreadyAddedItemIndex < 0) {
      // tslint:disable-next-line:max-line-length
      this.cart.push({ itemId: this.itemId, itemName: this.itemName, itemPrice: Number(this.itemPrice), customization: this.addeditems, quantity: 1, is_food: itemTax['is_food'], is_bar: itemTax['is_bar'], is_state: itemTax['is_state'], is_city: itemTax['is_city'], taxper: taxvalue, note: this.specialNotes })
    } else {
      this.cart[alreadyAddedItemIndex].quantity = qua;
    }

    this.updateTotalTax()
    this.reset();

  }

  itemIncre(id, quantity, cart_id) {
    let qua = 0
    this.cart.forEach((ele, i) => {
      if (ele.itemId == id) {
        qua += this.cart[i].quantity
      }
    })

    if (this.getmanuItemmaxquantity(id) != null && qua >= this.getmanuItemmaxquantity(id)) {
      Swal.fire(SwalErrorToast('Item quantity reached to limit'));
      return;
    }

    this.cart[cart_id].quantity++;
    this.updateTotalTax();
  }

  itemDecre(id, cart_id) {
    this.cart.forEach((ele, i) => {
      if (ele.itemId == id && i == cart_id) {
        if (this.cart[i].quantity > 1) {
          this.cart[i].quantity--;
        } else {
          this.cart.splice(i, 1)  //remove from already item and cart
          this.alreadyItems.forEach((ele1, ind) => {
            if (ele1 == id) {
              this.alreadyItems.splice(ind, 1)
            }
          })
        }
      }
    })

    this.updateTotalTax();
  }

  getQuantity(id, cart_id) {
    let temp = 0;
    this.cart.forEach((ele, i) => {
      if (ele.itemId == id && cart_id == i) {
        temp = this.cart[i].quantity
      }
    })
    return temp
  }

  updateTotalTax() {

    this.foodTax = 0;
    this.drinkTax = 0;
    this.grandTax = 0;
    this.subtotal = 0;
    this.total = 0;
    this.convenienceFeeValue = 0;

    // update subtotal, bothtax , Total
    this.cart.forEach(ele => {
      console.log("ele: ", ele);
      if (ele.is_food) {
        this.foodTax += Number(((ele.itemPrice * ele.quantity) * this.resDetail.food_tax / 100).toFixed(2));
      }
      if (ele.is_state) {
        this.drinkTax += Number(((ele.itemPrice * ele.quantity) * this.resDetail.drink_tax / 100).toFixed(2));
      }
      if (ele.is_bar) {
        this.drinkTax += Number(((ele.itemPrice * ele.quantity) * this.resDetail.drink_tax / 100).toFixed(2));
      }
      if (ele.is_city) {
        this.grandTax += Number(((ele.itemPrice * ele.quantity) * this.resDetail.grand_tax / 100).toFixed(2));
      }

      this.subtotal += (ele.itemPrice * ele.quantity);
    });
    // if (this.convenienceFeeType == '2') {
    //   this.convenienceFee =  Number((this.subtotal * this.convenienceFeePercentage / 100).toFixed(2))
    // }
    // this.subtotal = Number((this.subtotal + this.foodTax + this.drinkTax + this.grandTax + this.convenienceFee).toFixed(2));
    this.subtotal = this.subtotal + this.foodTax + this.drinkTax + this.grandTax;
    // this.grandTax = Number((this.subtotal * this.taxes.grand_tax / 100).toFixed(2));
    // this.total = Number((this.subtotal).toFixed(2));
    this.total = this.subtotal;

    console.log('foodTax', this.foodTax);
    console.log('drinkTax', this.drinkTax);
    console.log('grandTax', this.grandTax);
    console.log('convenienceFee', this.convenienceFee);
    console.log('subtotal', this.subtotal);
    console.log('total', this.total);
    this.calculateConvenienceFeeValue(this.total);
    this.total += this.convenienceFeeValue;
  }

  private calculateConvenienceFeeValue(subtotal: number) {
    this.convenienceFeeValue = 0;
    if (this.convenienceFeeType === 1) {
      this.convenienceFeeValue = this.convenienceFee;
    }
    if (this.convenienceFeeType === 2) {
      this.convenienceFeeValue = subtotal * this.convenienceFee / 100.0;
    }
  }


  getmanuItemmaxquantity(item_id) { // get item quantity from menu
    for (const e of this.menu) {
      if (e.items && e.items.length > 0) {
        for (const ele of e.items) {
          if (ele.item_id === item_id) {
            return ele.item_quantity;
          }
        }
      }
    }
    return 0
  }

  updateCartforQuantityCheck() {
    this.cart = [...this.cart].filter(e => {
      const itemmaxQua = this.getmanuItemmaxquantity(e.itemId);
      if (itemmaxQua == null || e.quantity <= itemmaxQua) {
        return e;
      } else {
        const index = this.alreadyItems.indexOf(e.itemId);
        if (index > -1) {
          this.alreadyItems.splice(index, 1);
        }
        return false;
      }
    });

    this.updateTotalTax();
  }

  updateCart() { // insert all cart data in to database
    if (this.cart.length < 1) {
      return;
    }

    this.updateCartforQuantityCheck();

    const cart = [];
    cart['user_id'] = this.isLoggedIn ? parseInt(localStorage.getItem('currentUserId'), 10) : -1;
    cart['res_id'] = this.res_id;
    cart['cart'] = this.cart;

    cart['food_tax'] = this.foodTax;
    cart['drink_tax'] = this.drinkTax;
    cart['convenience_fee'] = this.convenienceFee;
    cart['tax'] = this.grandTax;
    cart['total'] = this.total;
    cart['subtotal'] = this.subtotal;
    cart['note'] = "";
    cart['ordered'] = 0;

    if (this.isLoggedIn) {
      this.spinner.show()
      this.restaurantservice.updateCart({ ...cart }).subscribe(
        data => {
          if (data.status) {
            Swal.fire(SwalSuccessToast(data.msg));
            cart['cart_id'] = data.insertId
            this.restaurantservice.cart = cart;
            this._route.navigate(['checkout'])
          } else {
            Swal.fire(SwalErrorToast(data.msg))
          }
        },
        err => {
          Swal.fire(SwalErrorToast('Something went wrong'))
        }
      ).add(() => {
        this.spinner.hide()
      })
    } else {
      // Swal.fire(SwalSuccessToast('Successfully updated cart'));
      cart['reslat'] = this.resDetail['latitude']
      cart['reslng'] = this.resDetail['longitude']
      cart['res_name'] = this.resDetail['name']
      cart['min_order_value'] = this.resDetail['min_order_value']
      cart['max_order_value'] = this.resDetail['max_order_value']
      cart['cod'] = this.resDetail['cod']
      this.restaurantservice.cart = cart;
      // this._route.navigate(['checkout'])
      (<any>$('#loginUserModal')).modal('show');
    }
  }

  clearCart() { // clear cart and remove from database
    this.reset();
    this.alreadyItems = []
    this.cart = [];
    this.foodTax = 0;
    this.drinkTax = 0;
    this.grandTax = 0;
    this.total = 0;
    this.subtotal = 0;
    this.convenienceFeeValue = 0;

    if (this.isLoggedIn) {
      this.spinner.show();
      this.restaurantservice.clearCart().subscribe(
        data => {
          if (data.status) {
            Swal.fire(SwalSuccessToast(data.msg))
            this.restaurantservice.cart = []
          } else {
            Swal.fire(SwalErrorToast(data.msg))
          }
        },
        err => {
          Swal.fire(SwalErrorToast(err))
        }
      ).add(() => {
        this.spinner.hide();
      })
    }
  }

  changeStepsType(type: 'register' | 'login') {
    this.stepsType$ = type;
    // this.stepsService.setup(type);
    // if (type === 'register') {
    //   this.currentRegisterStep = this.stepsService.getCurrentStep();
    // }
    // if (type === 'login') {
    //   this.currentLoginStep = this.stepsService.getCurrentStep();
    // }
  }

}
