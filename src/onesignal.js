import OneSignal from "react-onesignal";
// Импортируем функцию для получения player_id администратора
import axios from "axios";
import { getAdminPlayerId } from "./Firebase/firebaseBookings.js";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./Firebase/firebaseConfig.js";

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
    OneSignal.on("subscriptionChange", async (state) => {
      console.log("Состояние подписки:", state);
      if (state.isSubscribed) {
        // Если пользователь подписан, сохраняем player_id в Firebase
        await savePlayerIdToFirebase();
        console.log("Player ID сохранен в Firebase.");
      } else {
        console.log("Пользователь не подписан.");
        // Можно показать пользователю приглашение для подписки
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
  try {
    const adminEmail = "constantin161089@gmail.com"; // Email администратора
    const adminPlayerId = await getAdminPlayerId(adminEmail); // Получаем player_id администратора

    if (!adminPlayerId) {
      throw new Error("Администратор не подписан на уведомления.");
    }

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

export const savePlayerIdToFirebase = async () => {
  try {
    const playerId = await OneSignal.getPlayerId(); // Получаем playerId из OneSignal
    if (!playerId) {
      throw new Error("Не удалось получить player_id.");
    }

    const adminEmail = "constantin161089@gmail.com"; // Email администратора
    const userRef = doc(db, "users", adminEmail); // Ищем пользователя по email

    // Сохраняем playerId в Firebase
    await setDoc(userRef, { onesignalPlayerId: playerId }, { merge: true });
    console.log(`Player ID для ${adminEmail} сохранен:`, playerId);
  } catch (error) {
    console.error("Ошибка при сохранении player_id в Firebase:", error);
  }
};
