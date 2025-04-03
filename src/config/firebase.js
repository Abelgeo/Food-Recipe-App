import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCyQVRULqhIsiG5Hk1AFsViTz4BBNl5bxU",
  authDomain: "foodicafe-77b62.firebaseapp.com",
  projectId: "foodicafe-77b62",
  storageBucket: "foodicafe-77b62.firebasestorage.app",
  messagingSenderId: "975633846921",
  appId: "1:975633846921:web:cecfb9463105e4224dac58",
  measurementId: "G-SX0MEQ91W6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
export default app;