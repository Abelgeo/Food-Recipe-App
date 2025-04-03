import { Platform } from 'react-native';

export const NotificationConfig = {
  appId: 28799,
  apiKey: '7BZp41Um9qv1wRDmOePvL2',
  options: {
    android: {
      channelId: 'default',
      importance: 4 // max importance
    },
    ios: {
      sound: true,
      badge: true,
      alert: true
    }
  }
};