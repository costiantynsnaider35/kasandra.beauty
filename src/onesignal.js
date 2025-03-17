import OneSignal from "react-onesignal";

// onesignal.js
export const initOneSignal = async () => {
  if (window.OneSignalInitialized) return; // Предотвращаем повторную инициализацию
  window.OneSignalInitialized = true;

  try {
    // Инициализация OneSignal
    if (window.OneSignal) {
      window.OneSignal.push(function () {
        OneSignal.init({
          appId: "f1a51bef-398a-4f40-8907-586539af311b",
        });

        // Получаем состояние разрешений и подписки
        OneSignal.getPermissionSubscriptionState(function (state) {
          console.log("Permission state:", state);

          if (state.permission !== "granted") {
            OneSignal.showSlidedownPrompt();
          }
        });
      });
    } else {
      console.error("OneSignal SDK не найден в window.");
    }
  } catch (error) {
    console.error("Ошибка инициализации OneSignal:", error);
  }
};
