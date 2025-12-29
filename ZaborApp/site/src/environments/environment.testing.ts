// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  socketapi: "wss://api.zaboreats.com/ws",
  apiUrl: "https://api.zaboreats.com",
  fileurl: "https://api.zaboreats.com",
  // socketapi: "ws://localhost:8001/ws",
  // apiUrl: "http://localhost:8001",
  // fileurl: "http://localhost:8001",
  GoogleMapApiKey: "AIzaSyAfxEnHzdr3k9Cglf3WpNgzP1XGqLNX4nI",
  stripe_key: "pk_test_lRz8873Lk5axb5QUnywYIfY900dpsCQsO2",
  stripe_publishable_key: "pk_test_51LJNuQJIWoRaw7nsDlDuHybmm5Brm7qYizqBXb8TCWMcgmJFEubi3XdOmbmXC0d9Ph3LQJHbDJwCLrU8YYIik8qJ00ebTyVdbu",
  usingFirebaseAuth: false,
  firebase: {
    apiKey: "AIzaSyCUdOC2P-E7ENvh7B8DKZsd_tvr-2-n3QY",
    authDomain: "zabor-1574162000348.firebaseapp.com",
    // databaseURL: "https://zabor-1574162000348.firebaseio.com",
    projectId: "zabor-1574162000348",
    storageBucket: "zabor-1574162000348.appspot.com",
    messagingSenderId: "402043469771",
    appId: "1:402043469771:web:95802fa2030fc3053a404e",
    // measurementId: "G-7G3WBHW1WC"
  },
  fcm_vapid_key: "BKvnTxQ_Df2NX29KX2e6m734R52vJRUpfoP2v7yQmgSFcKKYm05nLMSeGHSLGx8DLCNNAr-TRQAuiWk7LdEhlg4",
};

export const tosterOptions = {
  timeOut: 2000,
  closeButton: true,
  tapToDismiss: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
