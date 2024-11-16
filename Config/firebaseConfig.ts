import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-Q_Iz5-OTuSUBCpjiMt7Eob7N6eO4VPY",
  authDomain: "schedule-gp3113.firebaseapp.com",
  projectId: "schedule-gp3113",
  storageBucket: "schedule-gp3113.firebasestorage.app",
  messagingSenderId: "1042697645629",
  appId: "1:1042697645629:web:e34030c6b8e1897dc9c454",
  measurementId: "G-CGC2TFV3GM",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };
