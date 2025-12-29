import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from "rxjs/operators";
import { NgxSpinnerService } from 'ngx-spinner';
// import { initializeApp } from '@angular/fire';
// import { getMessaging, getToken, onMessage } from '@angular/fire/messaging';
import { AngularFireMessaging } from '@angular/fire/messaging';
import firebase from 'firebase';
import { environment } from '../environments/environment';
import Swal from 'sweetalert2';
import * as Swaldata from './shared/helpers/swalFunctionsData';
import { SwalInfoHtml } from './shared/helpers/swalFunctionsData';
import { ClientStorageService } from './shared/services/client-storage.service';
import { UserService } from './shared/services/frontServices/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
  private messagingI: firebase.messaging.Messaging | null = null;

  constructor(
    private router: Router, private activatedRoute: ActivatedRoute, private titleService: Title,
    private spinner: NgxSpinnerService, private afMessaging: AngularFireMessaging,
    private clientStorage: ClientStorageService, private userService: UserService,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
          } else if (child.snapshot.data && child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          } else {
            return null;
          }
        }
        return null;
      })
    ).subscribe((data: any) => {
      if (data) {
        this.titleService.setTitle(data + ' - Zabor');
      }
    });

    this.router.events.subscribe((e) => {
      this.navigationInterceptor(e);
    })
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event): void {
    if (event instanceof NavigationStart) {
      this.spinner.show()
    }
    if (event instanceof NavigationEnd) {
      window.scroll(0, 0)
      this.spinner.hide()
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.spinner.hide()
    }
    if (event instanceof NavigationError) {
      this.spinner.hide()
    }
  }

  ngOnInit(): void {
    const app = firebase.initializeApp(environment.firebase);
    // this.messaging = firebase.getMessaging(app);
    this.messagingI = firebase.messaging(app);

    // this.afMessaging.messages.subscribe(message => {
    //   console.log('FCM Message received:', message);
    //   alert('FCM Message received:')
    // });

    this.messagingI.onMessage((payload: firebase.messaging.MessagePayload) => {
      // console.log('Message received. ', payload);
      const { from, notification } = payload;
      console.log('FCM Notification received >>', { from, notification });
      // alert(JSON.stringify({ from, notification }));
      Swal.fire(Swaldata.SwalInfoHtml(`${notification.title != null ? '<h4>' + notification.title + '</h4>' + '<br/>' : ''}<p>${notification.body}</p>`, 'Notification from server'));
      // alert(JSON.stringify(payload));
      // ...
    }, (error) => {
      console.error('Error getting FCM Message:', error);
    }, () => {
      console.log('FCM Message completed');
    });
  }

  ngAfterViewInit(): void {
    this.requestPermission();
  }

  requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // setTimeout(() => {
        //   this.afMessaging.usePublicVapidKey(environment.fcm_vapid_key)
        //     .then(() => {
        //       console.log('Public Vapid Key set.');
        //       this.afMessaging.requestToken.subscribe(
        //         (token) => {
        //           if (token) {
        //             console.log('FCM Token:', token);
        //           } else {
        //             console.warn('No FCM token available. Permission not granted or other issue.');
        //           }
        //         },
        //         (error) => {
        //           console.error('Error getting FCM token:', error);
        //         }
        //       );
        //     })
        //     .catch((err) => {
        //       console.error('Error setting Public Vapid Key:', err);
        //     });
        // }, 2000);
        // // this.afMessaging.getToken.subscribe(
        //   (currentToken) => {
        //     if (currentToken) {
        //       console.log('FCM token:', currentToken);
        //     } else {
        //       console.warn('No FCM token available. Permission not granted or other issue.');
        //     }
        //   },
        //   (error) => {
        //     console.error('Error getting FCM token:', error);
        //   }
        // );

        setTimeout(async () => {
          const newSw = await navigator.serviceWorker.register(
            `${window.location.origin}/firebase-messaging-sw.js`
          );
          console.log('scope: ', newSw.scope);
          this.messagingI.getToken({
            vapidKey: environment.fcm_vapid_key,
            serviceWorkerRegistration: newSw,
          })
            .then((currentToken: string) => {
              if (currentToken) {
                console.log('FCM token:', currentToken);
                this.clientStorage.storeFcmToken(currentToken);
              } else {
                console.warn(
                  'No registration token available. Request permission to generate one.'
                );
              }
            })
            .catch((err: any) => {
              console.log('permission error:', err);
            });
        }, 2000);
      }
    });
  }

}
