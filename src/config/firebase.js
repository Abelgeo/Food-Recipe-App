// firebase.js
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCyQVRULqhIsiG5Hk1AFsViTz4BBNl5bxU",
  authDomain: "foodicafe-77b62.firebaseapp.com",
  projectId: "foodicafe-77b62",
  storageBucket: "foodicafe-77b62.firebasestorage.app",
  messagingSenderId: "975633846921",
  appId: "1:975633846921:web:cecfb9463105e4224dac58",
  // measurementId is optional and typically used for web analytics, not needed for RN basic auth
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Example usage functions you might want to add
export const signIn = (email, password) => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const signUp = (email, password) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export const signOut = () => {
  return auth().signOut();
};

export { auth };