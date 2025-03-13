const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyAdminOnNewBooking = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap) => {
    const bookingData = snap.data();

    // Получаем документ администратора по email
    const adminDocRef = admin
      .firestore()
      .doc("admins/constantin161089@gmail.com");
    const adminDoc = await adminDocRef.get();

    if (!adminDoc.exists) {
      console.log("Документ администратора не найден.");
      return null;
    }

    const { fcmToken } = adminDoc.data();
    if (!fcmToken) {
      console.log("У администратора отсутствует FCM токен.");
      return null;
    }

    // Формируем уведомление
    const payload = {
      notification: {
        title: "Клієнт зробив новий запис!",
        body: `${bookingData.fullName} записалась/записався на ${bookingData.date}.`,
      },
      data: {
        bookingId: snap.id,
      },
    };

    try {
      const response = await admin.messaging().sendToDevice(fcmToken, payload);
      console.log("Уведомление отправлено:", response);
    } catch (error) {
      console.error("Ошибка отправки уведомления:", error);
    }

    return null;
  });
