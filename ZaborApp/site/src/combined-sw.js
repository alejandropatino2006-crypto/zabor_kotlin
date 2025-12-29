// src/combined-sw.js

/*
Bump the service worker version in this comment to make sure changes to imported scripts
are reflected on the client/browser.

SERVICE WORKER VERSION = 1
*/

console.log("loading service workers");
importScripts('ngsw-worker.js', 'firebase-messaging-sw.js'); // Import Angular's service worker
