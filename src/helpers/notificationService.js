// helpers/notificationService.js
import messaging from '@react-native-firebase/messaging';
import { db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Request permission and get FCM token
export const requestNotificationPermission = async (userId) => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
      const token = await messaging().getToken();
      if (token && userId) {
        await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Handle foreground notifications
export const setupForegroundNotificationListener = () => {
  messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  });
};

// Handle background/quit state notifications
export const setupBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
};

// Send notification to a specific user
export const sendNotification = async (userId, title, body) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.fcmToken) {
      console.log('No FCM token found for user:', userId);
      return;
    }

    const message = {
      to: userData.fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        recipeId: 'some-recipe-id',
      },
    };

    console.log('Sending notification:', message);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};