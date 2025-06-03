// src/config/firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmrIJccyNffnKub8BvDIkeyuQAFr_ez_k",
  authDomain: "prowebproyecto-30a66.firebaseapp.com",
  projectId: "prowebproyecto-30a66",
  storageBucket: "prowebproyecto-30a66.firebasestorage.app",
  messagingSenderId: "56200106928",
  appId: "1:56200106928:web:badc15e0df805bbefdbc75",
  measurementId: "G-X2T7EGR16C"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar auth y exportarlo
const auth = getAuth(app);

export { auth };
