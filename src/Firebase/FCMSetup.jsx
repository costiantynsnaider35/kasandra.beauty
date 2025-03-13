import { useEffect } from "react";
import { messaging, db } from "../Firebase/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FCMSetup = () => {
  useEffect(() => {
    const auth = getAuth();

    // Отслеживаем состояние аутентификации
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Если пользователь авторизован, запрашиваем разрешение на уведомления.
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            // Получаем FCM-токен
            getToken(messaging, {
              vapidKey:
                "BC30GiRTjMhtPwxOssQu8Qi0RaG8CH1_lcRAdRzCiyJS5gy6qIbdtBMQHgFrpuzkkGYn5qWMDTEkVCC4BnTjDog",
            })
              .then((currentToken) => {
                if (currentToken) {
                  console.log("FCM Token:", currentToken);
                  // Используем user.uid в качестве идентификатора документа
                  setDoc(
                    doc(db, "users", user.uid),
                    {
                      fcmToken: currentToken,
                      uid: user.uid,
                      email: user.email,
                      // Если потребуется, можно добавить поле role,
                      // но роль можно устанавливать отдельно, например, при регистрации.
                    },
                    { merge: true }
                  );
                } else {
                  console.log("Токен не получен.");
                }
              })
              .catch((err) => {
                console.error("Ошибка получения токена:", err);
              });
          } else {
            console.error("Разрешение на уведомления не предоставлено.");
          }
        });
      } else {
        console.error("Пользователь не авторизован.");
      }
    });

    // Обработка входящих сообщений в foreground
    onMessage(messaging, (payload) => {
      console.log("Получено уведомление в foreground:", payload);
    });
  }, []);

  return null;
};

export default FCMSetup;
