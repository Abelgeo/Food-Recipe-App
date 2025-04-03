import React from 'react';
import AppNavigation from './src/navigation/index';
import { View, Text } from 'react-native';

export default function App() {
  try {
    registerNNPushToken(28799, '7BZp41Um9qv1wRDmOePvL2');
  } catch (error) {
    console.warn('Push notification registration failed:', error);
  }

  return (
    <AppNavigation />
  );
}