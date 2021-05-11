// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: 'http://localhost:3000',
  LOGO_DIR: '../assets/censusie.png',
  THEME: "",
  ASSET_MAP: true,
  YELP_URL: "https://corsanywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?",
  YELP_KEY: "Bearer StY2_8nJl8liO2OAw-QKSrOFzxp9lOlFkUPUL62NhvxVLUdduj63FbVibBUs6lSjUvVzl_o0nzDve6XQxN5SoR0uht69M9XA9zvs7Xq2pi7fH3KDRBP_UwA88RXSXHYx"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.