import OneSignal from "react-onesignal";

export const initOneSignal = async () => {
  if (window.OneSignalInitialized) return; // Предотвращаем повторную инициализацию
  window.OneSignalInitialized = true;

  try {
    // Инициализация OneSignal
    await OneSignal.init({
      appId: "f1a51bef-398a-4f40-8907-586539af311b",
    });

    console.log("OneSignal успешно инициализирован");

    // Подписка на изменения состояния подписки
    OneSignal.on("subscriptionChange", (state) => {
      console.log("Состояние подписки:", state);

      // Если разрешение не предоставлено, показываем prompt для подписки
      if (state.permission !== "granted") {
        OneSignal.showSlidedownPrompt();
      }
    });

    // Получаем текущее состояние подписки
    const permissionState = await OneSignal.getPermissionSubscriptionState();
    console.log("Текущее состояние подписки:", permissionState);
  } catch (error) {
    console.error("Ошибка инициализации OneSignal:", error);
  }
};
