import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

class LocalStorageService {
  storeKvPair(keyString: string, valueString: string) {
    localStorage.setItem(keyString, valueString);
  }

  retrieveValueForKey(keyString: string): string | null {
    return localStorage.getItem(keyString) || null;
  }

  removeKvPair(keyString: string) {
    localStorage.removeItem(keyString);
  }
}

class SessionStorageService {
  storeKvPair(keyString: string, valueString: string) {
    sessionStorage.setItem(keyString, valueString);
  }

  retrieveValueForKey(keyString: string): string | null {
    return sessionStorage.getItem(keyString) || null;
  }

  removeKvPair(keyString: string) {
    sessionStorage.removeItem(keyString);
  }
}


@Injectable({
  providedIn: 'root'
})
export class ClientStorageService {
  private static IpAddressKey = 'ipAddress';
  private static TokenKey = 'token';
  private static CurrentUserKey = 'currentuser';
  private static CurrentUserIdKey = 'currentUserId';
  private static CurrentLoggedInArea = 'currentLoggedInArea';
  private static SignupEmailKey = 'signupEmail';
  private static FcmTokenKey = 'fcmToken';

  private static localStorageService: LocalStorageService = new LocalStorageService();
  private static sessionStorageService: SessionStorageService = new SessionStorageService();

  constructor() { }


 storeToken(token: string, inSession = false) {
    if (!inSession) {
      ClientStorageService.localStorageService.storeKvPair(
        ClientStorageService.TokenKey,
        token
      );
    } else {
      ClientStorageService.sessionStorageService.storeKvPair(
        ClientStorageService.TokenKey,
         token
      );
    }
  }

  retrieveToken(): string | null {
    let storedDataString: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.TokenKey
      ) || null;
    if (storedDataString != null) {
      return storedDataString;
    }
    storedDataString = ClientStorageService.sessionStorageService.retrieveValueForKey(ClientStorageService.TokenKey) || null;
    if (storedDataString != null) {
      return storedDataString;
    }
    return null;
  }

  clearToken() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.TokenKey
    );
    ClientStorageService.sessionStorageService.removeKvPair(
      ClientStorageService.TokenKey
    );
  }

  storeCurrentUserId(currentUserId: number) {
    ClientStorageService.localStorageService.storeKvPair(
      ClientStorageService.CurrentUserIdKey,
      String(currentUserId)
    );
  }

  retrieveCurrentUserId(): number | null {
    const storedDataString: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.CurrentUserIdKey
      ) || null;
    if (storedDataString != null) {
      return Number(storedDataString);
    }
    return null;
  }

  retrieveCurrentUserIdAsString(): string | null {
    const storedDataString = this.retrieveCurrentUserId();
    if (storedDataString != null) {
      return String(storedDataString);
    }
    return null;
  }

  clearCurrentUserId() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.CurrentUserIdKey
    );
  }

  storeCurrentUser(currentUser: object) {
    ClientStorageService.localStorageService.storeKvPair(
      ClientStorageService.CurrentUserKey,
      JSON.stringify(currentUser)
    );
  }

  retrieveCurrentUser(): object | null {
    const storedDataString: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.CurrentUserKey
      ) || null;
    if (storedDataString != null) {
      return JSON.parse(storedDataString);
    }
    return null;
  }

  clearCurrentUser() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.CurrentUserKey
    );
  }


  storeCurrentLoggedInArea(loggedInArea: string) {
    ClientStorageService.localStorageService.storeKvPair(
      ClientStorageService.CurrentLoggedInArea,
      loggedInArea
    );
  }

  retrieveCurrentLoggedInArea(): string | null {
    const storedLoggedInArea: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.CurrentLoggedInArea
      ) || null;
    if (storedLoggedInArea != null) {
      return storedLoggedInArea;
    }
    return null;
  }

  clearCurrentLoggedInArea() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.CurrentLoggedInArea
    );
  }

  storeIpAddress(passwordResetCode: string) {
    ClientStorageService.localStorageService.storeKvPair(
      ClientStorageService.IpAddressKey,
      passwordResetCode
    );
  }

  retrieveIpAddress(): string | null {
    const storedDataString: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.IpAddressKey
      ) || null;
    if (storedDataString != null) {
      return storedDataString;
    }
    return null;
  }

  clearIpAddress() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.IpAddressKey
    );
  }

  storeSignupEmail(email: string) {
    ClientStorageService.localStorageService.storeKvPair(ClientStorageService.SignupEmailKey, email);
  }

  retrieveSignupEmail(): string | null {
    const storedDataString: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.SignupEmailKey
      ) || null;
    if (storedDataString != null) {
      return storedDataString;
    }
    return null;
  }

  clearSignupEmail() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.SignupEmailKey
    );
  }

  storeFcmToken(fcmToken: string) {
    ClientStorageService.localStorageService.storeKvPair(ClientStorageService.FcmTokenKey, fcmToken);
  }

  retrieveFcmToken(): string | null {
    const storedDataString: string | null =
      ClientStorageService.localStorageService.retrieveValueForKey(
        ClientStorageService.FcmTokenKey
      ) || null;
    if (storedDataString != null) {
      return storedDataString;
    }
    return null;
  }

  clearFcmToken() {
    ClientStorageService.localStorageService.removeKvPair(
      ClientStorageService.FcmTokenKey
    );
  }

}
