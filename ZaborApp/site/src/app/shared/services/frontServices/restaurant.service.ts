import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  public cart: any
  public categories: Array<any>;

  constructor(private http: HttpClient) {
    this.cart = []

    this.setcategories()
    if (localStorage.getItem('currentUserId'))
      this.setCart()


  }


  setCart() {
    if (localStorage.getItem('currentUserId'))
      this.getcart().subscribe(data => {
        this.cart = []
        if (data.status && data.data) {
          const cartData = typeof data.data.cart !== 'object' ? JSON.parse(data.data.cart) : data.data.cart;
          this.cart['user_id'] = data.data.user_id
          this.cart['res_id'] = data.data.res_id;
          this.cart['cart'] = [...cartData];
          this.cart['food_tax'] = data.data.food_tax;
          this.cart['drink_tax'] = data.data.drink_tax;
          this.cart['tax'] = data.data.tax;
          this.cart['total'] = data.data.total;
          this.cart['subtotal'] = data.data.subtotal;
          this.cart['cart_id'] = data.data.id
        }
      })
  }

  setcategories() {
    this.getCategories().subscribe(data => {
      if (data.status && data.data) {
        this.categories = [...data.data]
      }
    })
  }

  getcart() {
    let user_id = parseInt(localStorage.getItem('currentUserId'))
    let url = `${environment.apiUrl}` + `/api/getcart?user_id=${user_id}`;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  clearCart() {
    let user_id = parseInt(localStorage.getItem('currentUserId'))
    let url = `${environment.apiUrl}` + `/api/clearCart?user_id=${user_id}`;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }


  checkifResAvailable(value) {

    let days = ['sun', 'mon', 'tue', 'wed ', 'thu', 'fri', 'sat'];
    let d = new Date();
    let day = days[d.getDay()].trim()
    //get open and close time of day of restaurant

    const openTimeString = value[day + 'open_time'];
    const closeTimeString = value[day + 'close_time'];
    // if (value[day + 'open_time'] && value[day + 'open_time'] != '' && value[day + 'close_time'] && value[day + 'close_time'] != '') {
    if (openTimeString != null && openTimeString.length > 0 && closeTimeString != null && closeTimeString.length > 0) {
      // tslint:disable-next-line:max-line-length
      // if (d.getTime() > new Date(d.getFullYear(), d.getMonth(), d.getDate(), value[day + 'open_time'].split(':')[0], value[day + 'open_time'].split(':')[1]).getTime() && d.getTime() < new Date(d.getFullYear(), d.getMonth(), d.getDate(), value[day + 'close_time'].split(':')[0], value[day + 'close_time'].split(':')[1]).getTime()) {
      const openTimeParts = value[day + 'open_time'].split(':');
      const openTimestamp = new Date(d.getFullYear(), d.getMonth(), d.getDate(), openTimeParts[0], openTimeParts[1]).getTime();
      // const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      // console.log(dateFormatter.format(openTimestamp));
      const closeTimeParts = value[day + 'close_time'].split(':');
      const closeTimestamp = new Date(d.getFullYear(), d.getMonth(), d.getDate(), closeTimeParts[0], closeTimeParts[1]).getTime();
      return d.getTime() > openTimestamp && d.getTime() < closeTimestamp;
    }
    return false;
  }

  checkifGroupAvailable(value) {
    let days = ['sun', 'mon', 'tue', 'wed ', 'thu', 'fri', 'sat'];
    let d = new Date();
    let day = days[d.getDay()].trim()

    // get open and close time of day of restaurant
    const openTimeString = value[day + 'open_time'];
    const closeTimeString = value[day + 'close_time'];
    const currentTimestamp = d.getTime();
    console.log('group-check', openTimeString, closeTimeString, value);

    // if (value[day + 'open_time'] && value[day + 'open_time'] != '' && value[day + 'close_time'] && value[day + 'close_time'] != '') {
    if (openTimeString != null && openTimeString.length > 0 && closeTimeString != null && closeTimeString.length > 0) {
      // tslint:disable-next-line:max-line-length
      // if (d.getTime() > new Date(d.getFullYear(), d.getMonth(), d.getDate(), value[day + 'open_time'].split(':')[0], value[day + 'open_time'].split(':')[1]).getTime() && d.getTime() < new Date(d.getFullYear(), d.getMonth(), d.getDate(), value[day + 'close_time'].split(':')[0], value[day + 'close_time'].split(':')[1]).getTime()) {
      //   return true;
      // } else {
      //   return false
      // }
      const openTimeParts = openTimeString.split(':');
      const openDateTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), openTimeParts[0], openTimeParts[1]);
      const openTimestamp = openDateTime.getTime();
      const closeTimeParts = closeTimeString.split(':');
      const closeDateTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), closeTimeParts[0], closeTimeParts[1]);
      const closeTimestamp = closeDateTime.getTime();
      console.log(d, openDateTime, 'opening time check', currentTimestamp > openTimestamp, closeDateTime, 'closing time check', currentTimestamp < closeTimestamp);
      return currentTimestamp > openTimestamp && currentTimestamp < closeTimestamp;
    }
    return true;
  }


  getCategories() {
    let url = `${environment.apiUrl}` + "/api/get-categories";
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  payMagicPay(amount, firstName, lastName, email, payment_token) {
    let url = `${environment.apiUrl}` + "/api/paymagicpay";
    console.log("url to ping",url);
    let data = { 'amount': amount, 'firstName': firstName,'lastName': lastName, 'email': email, 'payment_token': payment_token}
    console.log("ping data",data);
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        console.log("resp",resp);
        return resp;
      })
    );
  }

  getHomeRestaurant(lat, long) {
    let url = `${environment.apiUrl}` + "/api/homepageRestaurant";
    let data = { 'latitude': lat, 'longitude': long, }
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getStaticPages(id) {
    let url = `${environment.apiUrl}/api/getstaticPages?pageid=${id}`;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getCatRestaurant(cat_id, page, latitude, longitude) {
    let url = `${environment.apiUrl}/api/getrestaurantbycat`;
    return this.http.post(url, { cat_id, page, latitude, longitude }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getRestaurants(restaurant, city, page, latitude, longitude) {
    let url = `${environment.apiUrl}/api/restaurant/search`;
    return this.http.post(url, { restaurant, city, page, latitude, longitude }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getRestaurantdetail(res_id) {
    let url = `${environment.apiUrl}/api/restaurant-detail`;
    return this.http.post(url, { res_id }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getGalleryImages(res_id) {
    let url = `${environment.apiUrl}/api/restaurant/review`;
    return this.http.post(url, { res_id }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getPopularRestaurant() {
    //get lat and long
    let data = {
      latitude: localStorage.getItem('lat'),
      longitude: localStorage.getItem('long'),
      page: 1
    }

    let url = `${environment.apiUrl}/api/allpopular-restaurant`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );

  }

  getAllRestaurant(filter, page, latitude, longitude) {
    // 1: popular
    // 2: newRestaurant
    // 3:review
    // 4:newest
    //5:popular
    let url = "";
    let data = { page, latitude, longitude };

    if (filter == 5)
      url = `${environment.apiUrl}/api/allpopular-restaurant`;
    else if (filter == 4)
      url = `${environment.apiUrl}/api/allnewest-restaurant`;
    else {
      url = `${environment.apiUrl}/api/filter-restaurant`;
      data['filtertype'] = filter
    }
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  rateRestaurant(data) {
    let url = `${environment.apiUrl}/api/rateRestaurant`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getResMenu(resid) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/restaurant/menu`;
    return this.http.post(url, { res_id: resid }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getGallery(data) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/restaurant/gallery`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  claimRes(email, res_id) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/restaurant/claim`;
    return this.http.post(url, { email, res_id }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  updateCart(data) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/addtocart`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getReview(data) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/restaurant/review`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  getreviewstatus(res_id) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/getreviewstatus?res_id=${res_id}`;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  placeOrder(address, total, cart_id, cart, user_id, res_id, extra, token, payment_mode, delivery_mode, selectOffer, Anet_credit_card, tb_num, discount, without_discount, shift_id, payment_status, email?: string) {
    // let url = `${environment.apiUrl}/api/get-menu`;
    // tslint:disable-next-line:max-line-length
    const data = { token, address, total, cart_id, cart, user_id, res_id, extra, payment_mode, delivery_mode, selectOffer, Anet_credit_card, tb_num, orderby: 'web', discount, without_discount, shift_id, payment_status, email: email || undefined }
    const url = `${environment.apiUrl}/api/placeorder`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getTaxs() {
    // let url = `${environment.apiUrl}/api/get-menu`;
    let url = `${environment.apiUrl}/api/getTaxs`;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getAdverts(lat, long) {
    let url = `${environment.apiUrl}` + "/user/getadverts";
    let data = { 'latitude': lat, 'longitude': long, }
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  autoSearch(search) {
    return this.http.get(`${environment.apiUrl}/api/autosearch?search=${search}`, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getOrderDetail(data) {
    let url = `${environment.apiUrl}/api/getOrderDetail`;
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getongoingOrders(user_id) {
    return this.http.get(`${environment.apiUrl}/api/getongoingOrders?user_id=${user_id}`, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  getOrderStages(order_id, user_id) {
    return this.http.get(`${environment.apiUrl}/api/getOrderStages?user_id=${user_id}&order_id=${order_id}`, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  getDiscounts(user_id, res_id) {
    return this.http.get(`${environment.apiUrl}/api/getDiscounts?user_id=${user_id}&res_id=${res_id}`, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  getofferwithinlocation() {
    let url = `${environment.apiUrl}/api/getDiscountsWithinLocation`;
    return this.http.post(url, { lat: localStorage.getItem('lat'), lng: localStorage.getItem('long') }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  giveDriverRating(rating, driveruser_id, order_id) {
    let user_id = localStorage.getItem('currentUserId') ? parseInt(localStorage.getItem('currentUserId')) : -1
    let url = `${environment.apiUrl}/api/giveDriverRating`;
    return this.http.post(url, { rating, driveruser_id, order_id, user_id }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  driverTip(stripetoken, payment_method, tip, order_id, driver_user_id, Anet_credit_card) {
    let url = `${environment.apiUrl}/api/driverTip`;
    return this.http.post(url, { stripetoken, payment_method, tip, order_id, driver_user_id, Anet_credit_card }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  cancelOrder(order_id) {
    let url = `${environment.apiUrl}/api/cancelOrder`;
    return this.http.post(url, { order_id }, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
}
