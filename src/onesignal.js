import OneSignal from "react-onesignal";

export const initOneSignal = async () => {
  if (window.OneSignalInitialized) return; // Предотвращает повторную инициализацию
  window.OneSignalInitialized = true;

  await OneSignal.init({
    appId: "f1a51bef-398a-4f40-8907-586539af311b",
    allowLocalhostAsSecureOrigin: true, // Для работы на localhost
  });

  const isPushSupported = await OneSignal.isPushNotificationsSupported();
  if (isPushSupported) {
    const permission = await OneSignal.getNotificationPermission();
    if (permission !== "granted") {
      await OneSignal.showSlidedownPrompt(); // Показываем только если нет разрешения
    }
  }
};
