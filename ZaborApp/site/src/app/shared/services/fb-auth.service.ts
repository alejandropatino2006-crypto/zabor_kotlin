import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
// import firebase from 'firebase';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FbAuthService {

  constructor(private afAuth: AngularFireAuth) { }

  // Sign up with email/password
  signup(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Sign in with email/password
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Sign out
  logout() {
    return this.afAuth.signOut();
  }

  // Google Sign-in
  googleLogin() {
    return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  // Get auth state
  getAuthState() {
    return this.afAuth.authState;
  }

  getCurrentUser() {
    return this.afAuth.currentUser;
  }

}
