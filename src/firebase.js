import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxP8j4-iaBJ-r5BcWVpKUwUNt_KCswzOw",
  authDomain: "parkgenius-1fd7a.firebaseapp.com",
  databaseURL: "https://parkgenius-1fd7a-default-rtdb.firebaseio.com",
  projectId: "parkgenius-1fd7a",
  storageBucket: "parkgenius-1fd7a.appspot.com",
  messagingSenderId: "562435833846",
  appId: "1:562435833846:web:3a9c07292dd38fe10c11d7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
