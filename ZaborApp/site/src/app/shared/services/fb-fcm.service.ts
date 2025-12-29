import { Injectable } from '@angular/core';
// import firebase from 'firebase/app';
// import messaging from "firebase/messaging";
import { environment } from '../../../environments/environment';
import { AngularFireMessaging } from '@angular/fire/messaging';
import firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';
import NotificationPayload = firebase.messaging.NotificationPayload;

@Injectable({
  providedIn: 'root'
})
export class FbFcmService {
  // private messagingObj: firebase.messaging.Messaging;
  private fcmToken: string;
  fcmNotifications = new BehaviorSubject<NotificationPayload>(null);

  constructor(
    private afMessaging: AngularFireMessaging,
  ) {
    // this.messagingObj = firebase.messaging();
  }

  requestPermissionAndGetToken() {
    this.afMessaging.requestToken.subscribe(
      (token) => {
        if (token) {
          // console.log('FCM Token:', token);
          console.log('FCM Token length:', token.length);
          this.fcmToken = token;
        } else {
          console.warn('No FCM token available. Permission not granted or other issue.');
        }
      },
      (error) => {
        console.error('Error getting FCM token:', error);
      }
    );

    this.afMessaging.tokenChanges.subscribe(
      (token) => {
        if (token) {
          // console.log('FCM Token refreshed:', token);
          console.log('FCM refreshed Token length:', token.length);
          this.fcmToken = token;
          // TODO: Update the token on backend - send API call to save this token
        }
      }, (error) => {
        console.error('Error getting FCM Token:', error);
      }, () => {
        console.log('FCM Token completed');
      });
  }

  getToken() {
    return new Promise<string>(async (resolve, reject) => {
      // return this.messagingObj.getToken({ vapidKey: environment.fcm_vapid_key });
      // return firebase.messaging().getToken({ vapidKey: environment.fcm_vapid_key });
      if (this.fcmToken) {

        // this.afMessaging.onMessage((nextOrObserver: any, error?: any, completed?: any) => {
        // });
        this.afMessaging.messages.subscribe((value) => {
          console.log('FCM Message received:', value);
          this.fcmNotifications.next(value);
        }, (error) => {
          console.error('Error getting FCM Message:', error);
        }, () => {
          console.log('FCM Message completed');
        });

        resolve(this.fcmToken);
      } else {
        reject('No FCM token available. Permission not granted or other issue.');
      }
      // getToken(this.messagingObj, { vapidKey: 'YOUR_VAPID_KEY' })
      //   .then((currentToken) => {
      //     if (currentToken) {
      //       resolve(currentToken);
      //     } else {
      //       console.log('No registration token available. Request permission to generate one.');
      //       reject('No registration token available. Request permission to generate one.');
      //     }
      //   })
      //   .catch((err) => {
      //     console.log('An error occurred while retrieving token. ', err);
      //     reject(err);
      //   });
    });
  }

}
