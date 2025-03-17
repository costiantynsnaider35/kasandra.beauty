import OneSignal from "react-onesignal";

export const initOneSignal = async () => {
  if (window.OneSignalInitialized) return; // Предотвращаем повторную инициализацию
  window.OneSignalInitialized = true;

  try {
    await OneSignal.init({
      appId: "f1a51bef-398a-4f40-8907-586539af311b",
    });

    console.log("OneSignal успешно инициализирован");

    const isPushSupported = await OneSignal.isPushNotificationsSupported();
    if (isPushSupported) {
      const permission = await OneSignal.getNotificationPermission();
      if (permission !== "granted") {
        await OneSignal.showSlidedownPrompt();
      }
    }
  } catch (error) {
    console.error("Ошибка инициализации OneSignal:", error);
  }
};
