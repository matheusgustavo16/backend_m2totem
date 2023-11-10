import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoyXO3rbsLjOl_Bj11FH50yqMDchn2vj4",
  authDomain: "m2totem.firebaseapp.com",
  projectId: "m2totem",
  storageBucket: "m2totem.appspot.com",
  messagingSenderId: "659305556594",
  appId: "1:659305556594:web:d5c9f6dd4daff2e9baf0eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
