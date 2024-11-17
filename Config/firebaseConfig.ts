import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA-Q_Iz5-OTuSUBCpjiMt7Eob7N6eO4VPY",
  authDomain: "schedule-gp3113.firebaseapp.com",
  projectId: "schedule-gp3113",
  storageBucket: "schedule-gp3113.firebasestorage.app",
  messagingSenderId: "1042697645629",
  appId: "1:1042697645629:web:e34030c6b8e1897dc9c454",
  measurementId: "G-CGC2TFV3GM",
  databaseURL:
    "https://schedule-gp3113-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
