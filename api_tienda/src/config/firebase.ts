// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmrIJccyNffnKub8BvDIkeyuQAFr_ez_k",
  authDomain: "prowebproyecto-30a66.firebaseapp.com",
  projectId: "prowebproyecto-30a66",
  storageBucket: "prowebproyecto-30a66.firebasestorage.app",
  messagingSenderId: "56200106928",
  appId: "1:56200106928:web:badc15e0df805bbefdbc75",
  measurementId: "G-X2T7EGR16C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);