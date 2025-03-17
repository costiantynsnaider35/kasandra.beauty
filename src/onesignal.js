import OneSignal from "react-onesignal";
import { getAdminPlayerId } from "./firebaseBookings"; // Импортируем функцию для получения player_id администратора
import axios from "axios";

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

// Функция для отправки уведомлений админу
export const sendNotificationToAdmin = async (message) => {
  const adminEmail = "constantin161089@gmail.com"; // Email администратора
  const adminPlayerId = await getAdminPlayerId(adminEmail); // Получаем player_id администратора

  const appId = "f1a51bef-398a-4f40-8907-586539af311b"; // Ваш OneSignal appId
  const apiKey =
    "os_v2_app_6gsrx3zzrjhubcihlbsttlzrdnh362idvp4ufeevpw3bwhpv5adbgyo2wadvv27ynzkw4chnbyzcnivodqwmugpr4gxcigy7wnvawcy"; // Ваш OneSignal REST API ключ

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${apiKey}`,
  };

  const data = {
    app_id: appId,
    include_player_ids: [adminPlayerId], // Динамически получаем player_id
    headings: { en: "Новый запрос!" },
    contents: { en: message },
  };

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      data,
      { headers }
    );
    console.log("Уведомление отправлено", response.data);
  } catch (error) {
    console.error("Ошибка при отправке уведомления", error);
  }
};
