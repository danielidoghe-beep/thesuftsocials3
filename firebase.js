import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMDelY3Vb-2N1UakyWNWRrs3hW8yM9PeI",
  authDomain: "thesuftsocials3.firebaseapp.com",
  projectId: "thesuftsocials3",
  storageBucket: "thesuftsocials3.firebasestorage.app",
  messagingSenderId: "629716277005",
  appId: "1:629716277005:web:3d09ca4edb2a4964008244",
  measurementId: "G-J8RMH61MRE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
