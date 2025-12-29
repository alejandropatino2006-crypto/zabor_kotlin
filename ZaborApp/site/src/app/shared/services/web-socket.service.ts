import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { retryWhen, switchMap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { ClientStorageService } from './client-storage.service';

export interface IWebSocketServiceSubscriber {
  handleMessageReceived(messageReceived: string): void;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private webSocket: WebSocketSubject<any>;
  private reconnectInterval = 10000; // 10 seconds
  private webSocketServiceSubscriber: IWebSocketServiceSubscriber;

  constructor(private clientStorage: ClientStorageService) {
  }

  subscribe(subscriber: IWebSocketServiceSubscriber) {
    this.webSocketServiceSubscriber = subscriber;
  }

  connect() {
    if (!environment.socketapi) {
      console.error('WS - WebSocket API URL not found in environment');
      return;
    }

    const token: string | null = this.clientStorage.retrieveToken();
    const userId: number | null = this.clientStorage.retrieveCurrentUserId();
    if (token == null || userId == null) {
      console.error('WS - Token or User ID not found in storage');
      if (this.webSocketServiceSubscriber != null) {
        this.webSocketServiceSubscriber = null;
      }
      return;
    }

    const wsUrl = `${environment.socketapi}?userId=${userId}&token=${token}`;
    this.webSocket = webSocket(wsUrl);

    // handle connection error
    this.webSocket.pipe(
      retryWhen(errors => {
          return errors.pipe(
            switchMap((_value, _index) => {
              console.error(`WS - WebSocket connection failed. Retrying in ${this.reconnectInterval / 1000} seconds...`);
              this.webSocket.complete();
              this.webSocket = webSocket(wsUrl);
              return timer(this.reconnectInterval);
            })
          );
        }
      )
    ).subscribe(
      message => this.handleMessage(message),
      error => console.error('WS - WebSocket error:', error),
      () => {
        console.log('WS - WebSocket connection closed');
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval / 2);
      }
    );
  }

  private handleMessage(message: any) {
    if (this.webSocketServiceSubscriber != null) {
      // Handle incoming messages
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      }
      console.log('WS - Received message from web-socket server:', message);
      this.webSocketServiceSubscriber.handleMessageReceived(message);
    }
  }

  sendMessage(message: any) {
    if (this.webSocket != null) {
      console.log('WS - websocket closed:', this.webSocket.closed);
      console.log('WS - websocket hasError:', this.webSocket.hasError);
      console.log('WS - websocket isStopped:', this.webSocket.isStopped);
      if (this.webSocket.closed || this.webSocket.hasError || this.webSocket.isStopped) {
        this.connect();
        setTimeout(() => {
          this.webSocket.next(message);
        }, 1000);
      } else
        this.webSocket.next(message);
    }
  }

  getMessages() {
    if (this.webSocket != null) {
      return this.webSocket.asObservable();
    }
    return null;
  }

  closeConnection() {
    if (this.webSocket != null) {
      this.webSocket.complete();
    }
  }
}
