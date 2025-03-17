import OneSignal from "react-onesignal";

export const initOneSignal = async () => {
  if (window.OneSignalInitialized) return; // Предотвращаем повторную инициализацию
  window.OneSignalInitialized = true;

  try {
    await OneSignal.init({
      appId: "f1a51bef-398a-4f40-8907-586539af311b",
    });

    console.log("OneSignal успешно инициализирован");

    // Получаем состояние разрешений и подписки
    const permissionState = await OneSignal.getPermissionSubscriptionState();

    if (permissionState.permission !== "granted") {
      // Если разрешение не предоставлено, показываем prompt для подписки
      await OneSignal.showSlidedownPrompt();
    }
  } catch (error) {
    console.error("Ошибка инициализации OneSignal:", error);
  }
};
