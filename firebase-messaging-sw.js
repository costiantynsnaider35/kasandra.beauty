/* eslint-env serviceworker */
/* global importScripts, firebase */

importScripts(
  "https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js"
);

// Замените эти значения на реальные (возможно, подставленные через систему сборки)
firebase.initializeApp({
  apiKey:
    "U2FsdGVkX18aQ8RHFl2t/KxmU9PLyb97smWa3N+7bNSyzMZg+RepXBhfEYeSb+vxUnSWqJb9pYvAvYF9s91uPA==",
  authDomain:
    "U2FsdGVkX1+6uImrgj59NxDVRpmbe97WMgFMJLaBveUabYdOvLp13pGOuWyZBWiILTD1EQteTLZaklWhNn+PZg==",
  projectId: "U2FsdGVkX18L2t8sUuap53MPcQWVrtiX2C1r4jHBD86l1cvaoU1kkoI/SvMtrv6M",
  storageBucket:
    "U2FsdGVkX1/aptMmCJd4KaeJR8xGjnMlAjXXrVvmoZfhxcvjhULNoeQD2NZiJZCsrup7L+AlKj6lQvComx5gYQ==",
  messagingSenderId: "U2FsdGVkX1/wwms76bjxXxkpV/NE1EeV1UX/eaKvxvM=",
  appId:
    "U2FsdGVkX18IodEVS7Ff4oAcBZD2CeEje/nlcpM4GpJBNFNEAcdO8uRdUJLwEh6J+tME6w4YHIo/OnZaQ4ii5Q==",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Дополнительные опции: icon, image и т.д.
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
