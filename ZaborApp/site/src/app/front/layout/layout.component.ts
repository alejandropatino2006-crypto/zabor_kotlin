import { Component, OnDestroy, OnInit } from '@angular/core';
declare var $: any;
import { Router, NavigationEnd } from '@angular/router';
import { IWebSocketServiceSubscriber, WebSocketService } from '../../shared/services/web-socket.service';
import { ClientStorageService } from '../../shared/services/client-storage.service';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { FbFcmService } from '../../shared/services/fb-fcm.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styles: []
})
export class LayoutComponent implements OnInit, OnDestroy, IWebSocketServiceSubscriber {

  collapedSideBar: boolean;
  audio: any;
  private enableWsSocket = true; // TODO IMPORTANT set to true

  // notifications: NotificationPayload[] = [];

  constructor(
    private routingRouter: Router,
    private clientStorage: ClientStorageService,
    private webSocketService: WebSocketService,
    private authenticationService: AuthenticationService,
    // private fcmService: FbFcmService,
  ) {
    $("body").addClass("customer");
    this.webSocketService.subscribe(this);
  }

  ngOnInit() {
    $('body').removeClass('nonepadding');
    // this.fcmService.fcmNotifications.subscribe((notification) => {
    //   console.log('FCM Notification received:', notification);
    //   // if(notification.body) this.notifications.push(notification);
    // });

    if (this.enableWsSocket) {
      console.log("WS - websocket enabled");
      this.webSocketService.connect();
    }

    // this.audio = new Howl({
    //   src: ["/assets/Alarm.mp3"],
    //   loop: true,
    // });
  }

  receiveCollapsed($event) {
    this.collapedSideBar = $event;
  }

  handleMessageReceived(messageReceived: string) {
    console.log('WS - Received message:', messageReceived);
    const response = JSON.parse(messageReceived);
    if (response.message === "ok" && response.data != null) {
      let responseData: string | any = response.data;
      if (typeof responseData === 'string') {
        responseData = JSON.parse(responseData);
      }

      if (response.event === "CONTROL") {
        if (responseData.status && responseData.data != null) {
          const { messageFor } = responseData.data;
          if (messageFor.role.indexOf(",") > -1) {
            messageFor.role.split(",").forEach((role: string) => {
              if (role === "customer" || role === "user") {
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

  closeWebsocket() {
    this.webSocketService.closeConnection();
  }

  ngOnDestroy() {
    $("body").removeClass("customer");
    this.closeWebsocket();
  }
}
