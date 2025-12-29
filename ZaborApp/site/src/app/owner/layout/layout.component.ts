import { Component, OnInit, OnDestroy } from "@angular/core";
// import { environment } from "../../../environments/environment";
// import { interval, Observable, Subscription, throwError, timer } from "rxjs";
// import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
// import { retryWhen, catchError, delay, take } from "rxjs/operators";
import { Howl, Howler } from "howler";
import { ClientStorageService } from "../../shared/services/client-storage.service";
// import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { TranslatePipe } from '@ngx-translate/core';
import { IWebSocketServiceSubscriber, WebSocketService } from '../../shared/services/web-socket.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"],
})
export class LayoutComponent implements OnInit, OnDestroy, IWebSocketServiceSubscriber {
  // message: string;
  // eventSource: EventSource;
  collapsedSideBar: boolean;
  // mySubscription: Subscription;
  audio: any;
  // public myWebSocket: WebSocketSubject<any>;
  private enableWsSocket = true; // TODO IMPORTANT set to true

  // private eventSourceUrl: string;
  // private ws: WebSocket | null = null;
  private loggedInUserId: number;

  constructor(
    private routingRouter: Router,
    private clientStorage: ClientStorageService,
    // private http: HttpClient,
    private webSocketService: WebSocketService,
    private authenticationService: AuthenticationService,
  ) {
    $("body").addClass("owner");
    this.loggedInUserId = this.clientStorage.retrieveCurrentUserId();
    this.webSocketService.subscribe(this);
  }

  handleMessageReceived(messageReceived: string) {
    console.log('WS - Received message:', messageReceived);
    const response = JSON.parse(messageReceived);
    if (response.message === "ok" && response.data != null) {
      let responseData: string | any = response.data;
      if (typeof responseData === 'string') {
        responseData = JSON.parse(responseData);
      }

      if (response.event === "INFO") {
        if (responseData.status && responseData.data != null) {
          const { orderId, messageFor } = responseData.data;
          if (messageFor.role === "owner" && messageFor.userId === this.loggedInUserId) {
            if (responseData.event === "CART-UPDATED") {
              this.routingRouter.navigate(["owner/orders"]);
              this.audio.play();
              Swal.fire({
                title: "New Order",
                text: "You have Received a new order",
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Go to Order",
                cancelButtonText: "Leave it",
              }).then((result) => {
                if (result.value) {
                  this.routingRouter.navigate(["owner/orders/edit/", orderId]);
                }
                this.audio.pause();
              });
            }

            if (responseData.event === "ORDER-CANCELLED") {
              Swal.fire({
                title: "Order Cancelled",
                text: "An order has been cancelled",
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Go to Order",
                cancelButtonText: "Leave it",
              }).then((result) => {
                if (result.value) {
                  this.routingRouter.navigate(["owner/orders/edit/", orderId]);
                }
              });
            }
          }
        }
      }

      if (response.event === "CONTROL") {
        if (responseData.status && responseData.data != null) {
          const { messageFor } = responseData.data;
          if (messageFor.role.indexOf(",") > -1) {
            messageFor.role.split(",").forEach((role: string) => {
              if (role === "owner") {
                if (responseData.event === "FORCE-LOGOUT") {
                  this.authenticationService.logout();
                }
              }
            });
          }
        }
      }
    }
  }

  // public connect1(): Observable<any> {
  //   this.eventSourceUrl = environment.socketapi; // Assuming socketapi is defined in environment
  //
  //   console.log('WS URL', this.eventSourceUrl);
  //
  //   return new Observable(observer => {
  //     if (!this.eventSourceUrl) {
  //       observer.error('WebSocket API URL not found in environment');
  //       return;
  //     }
  //
  //     // Pass the URL, empty protocols array, and only the first two arguments
  //     this.ws = new WebSocket(this.eventSourceUrl);
  //
  //     this.ws.onopen = () => {
  //       console.log('WebSocket connection opened!');
  //       observer.next('Connected to WebSocket server');
  //     };
  //
  //     this.ws.onmessage = (event: MessageEvent) => {
  //       const data = JSON.parse(event.data);
  //       // console.log('Received message:', data);
  //       if (data.status) {
  //         this.routingRouter.navigate(["owner/orders"]);
  //         this.audio.play();
  //         Swal.fire({
  //           title: "New Order",
  //           text: "You have Received a new order",
  //           icon: "info",
  //           showCancelButton: true,
  //           confirmButtonColor: "#3085d6",
  //           cancelButtonColor: "#d33",
  //           confirmButtonText: "Go to Order",
  //           cancelButtonText: "Leave it",
  //         }).then((result) => {
  //           if (result.value) {
  //             this.routingRouter.navigate(["owner/orders/edit/", data.data]);
  //           }
  //           this.audio.pause();
  //         });
  //       }
  //       observer.next(data);
  //     };
  //
  //     this.ws.onerror = (error) => {
  //       console.error('WebSocket error:', error);
  //       observer.error(error);
  //     };
  //
  //     this.ws.onclose = () => {
  //       console.log('WebSocket connection closed');
  //       observer.complete(); // Signal completion
  //     };
  //   })
  //   .pipe(
  //     retryWhen(errors => errors.pipe(delay(3000))), // Retry with 3-second delay on errors
  //     catchError(error => {
  //       console.error('WebSocket error (handled):', error);
  //       return throwError(error); // Re-throw error for component handling
  //     })
  //   );
  // }

  public sendMessage(message: any) {
    // if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    //   this.ws.send(JSON.stringify(message));
    // } else {
    //   console.error('WS - WebSocket connection not ready to send message');
    // }
    this.webSocketService.sendMessage(message);
  }

  ngOnInit() {
    if (this.enableWsSocket) {
      console.log("WS - websocket enabled");
      // this.connect().subscribe(data => {
      //   // console.log("web socket data", data);
      //   const token = this.clientStorage.retrieveToken();
      //   const userId = this.clientStorage.retrieveCurrentUserId().toString();
      //   const message = JSON.stringify({
      //     token,
      //     user_id: userId
      //   });
      //   this.sendMessage(message);
      // });
      this.webSocketService.connect();

      // {
      //   "type": "notify",
      //   "event": "CART-UPDATED",
      //   "userId": 123,
      //   "restaurantId": 2,
      //   "cartId": 100
      // }
    }
    // if (this.enableWsSocket) {
    //   this.myWebSocket = webSocket(`${environment.socketapi}`);
    //   const data = {
    //     token: this.clientStorage.retrieveToken(),
    //     user_id: localStorage.getItem("currentUserId"),
    //     rand: Math.random(),
    //   };
    //   this.myWebSocket.next(data);
    //   this.subscribeWebsocket();
    //   this.sendNextWebsocketRequest();
    // }

    // const token = this.clientStorage.retrieveToken();
    // const userId = localStorage.getItem("currentUserId");

    // const eventSourceUrl = `${environment.socketapi}`;
    // const currentUserId: number | null = this.clientStorage.retrieveCurrentUserId();
    // console.log("currentUserId",currentUserId);

    // const headers = {
    //   authorization: `Bearer ${token}`,
    //   "client-user-id": userId,
    // };

    // this.http.get(eventSourceUrl, { headers, responseType: "text" }).subscribe(
    //   (data) => {
    //     console.log("data from server", data);
    //     // Process data similar to EventSource onmessage
    //     const parsedData = JSON.parse(data);
    //     this.message = parsedData.message;
    //     console.log("message from server", parsedData);
    //   },
    //   (error) => {
    //     console.error("Error fetching event source:", error);
    //   }
    // );

    this.audio = new Howl({
      src: ["/assets/Alarm.mp3"],
      loop: true,
    });
  }

  // subscribeWebsocket() {
  //   this.myWebSocket.subscribe(
  //     (data) => {
  //       console.log("websocket: ", data);
  //       if (data.status) {
  //         this.routingRouter.navigate(["owner/orders"]);
  //         this.audio.play();
  //         Swal.fire({
  //           title: "New Order",
  //           text: "You have Received a new order",
  //           icon: "info",
  //           showCancelButton: true,
  //           confirmButtonColor: "#3085d6",
  //           cancelButtonColor: "#d33",
  //           confirmButtonText: "Go to Order",
  //           cancelButtonText: "Leave it",
  //         }).then((result) => {
  //           if (result.value) {
  //             this.routingRouter.navigate(["owner/orders/edit/", data.data]);
  //           }
  //           this.audio.pause();
  //         });
  //       }
  //     },
  //     (err) => {
  //       this.closeWebsocket();
  //       console.log("Error: ", err);
  //       //console.error(JSON.stringify(err, ["message", "arguments", "type", "name"]));
  //       timer(5000)
  //         .pipe(take(1))
  //         .subscribe((x) => {
  //           this.subscribeWebsocket();
  //           this.sendNextWebsocketRequest();
  //         });
  //     }
  //   );
  // }

  // sendNextWebsocketRequest() {
  //   this.mySubscription = interval(30000).subscribe((x) => {
  //     // if (localStorage.getItem('token') && localStorage.getItem('currentUserId'));
  //     // this.myWebSocket.next({ "token": sessionStorage.getItem('token'), "user_id": localStorage.getItem('currentUserId'), "rand": Math.random() });
  //     //const data = JSON.stringify([{ "token": this.clientStorage.retrieveToken(), "user_id": localStorage.getItem('currentUserId'), "rand": Math.random() }]);
  //     const data = {
  //       token: this.clientStorage.retrieveToken(),
  //       user_id: localStorage.getItem("currentUserId"),
  //       rand: Math.random(),
  //     };
  //     this.myWebSocket.next(data);
  //   });
  // }

  closeWebsocket() {
    // if (this.mySubscription != null) {
    //   this.mySubscription.unsubscribe();
    // }
    // if (this.myWebSocket != null) {
    //   this.myWebSocket.complete();
    // }
    // if (this.ws) {
    //   this.ws.close();
    //   this.ws = null;
    // }
    this.webSocketService.closeConnection();
  }

  receiveCollapsed($event) {
    this.collapsedSideBar = $event;
  }

  ngOnDestroy() {
    $("body").removeClass("home");
    // if (this.mySubscription != null) {
    //   this.closeWebsocket();
    // }
    // if (this.eventSource) {
    //   this.eventSource.close();
    // }
    this.closeWebsocket();
  }
}
