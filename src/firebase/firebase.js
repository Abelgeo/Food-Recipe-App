import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore"; // Add Firestore
import { getStorage } from "firebase/storage"; // Add Storage

const firebaseConfig = {
    apiKey: "AIzaSyCyQVRULqhIsiG5Hk1AFsViTz4BBNl5bxU",
    authDomain: "foodicafe-77b62.firebaseapp.com",
    projectId: "foodicafe-77b62",
    storageBucket: "foodicafe-77b62.firebasestorage.app",
    messagingSenderId: "975633846921",
    appId: "1:975633846921:web:cecfb9463105e4224dac58",
    measurementId: "G-SX0MEQ91W6",
};

const app = initializeApp(firebaseConfig);

let analytics;
if (isSupported()) {
    analytics = getAnalytics(app);
}

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

export { app, auth, analytics, db, storage };