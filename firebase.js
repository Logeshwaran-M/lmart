// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB10u72cOS9UgQFSXKx509PuCCl8kFbFZo",
  authDomain: "emart-ecommerce.firebaseapp.com",
  projectId: "emart-ecommerce",
  storageBucket: "emart-ecommerce.firebasestorage.app", // ✔ FIXED
  messagingSenderId: "730402982718",
  appId: "1:730402982718:web:0258d0fb6e4c092554fa6f",
  measurementId: "G-SFHKTQVX9B"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
