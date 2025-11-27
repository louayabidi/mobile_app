// firebase.js  (or firebase.ts – same thing)
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Your config (keep it exactly as it is)
const firebaseConfig = {
  apiKey: "AIzaSyAfcATzq63PEjgJXiJluo8-9mL1NsrreOg",
  authDomain: "medworkout.firebaseapp.com",
  projectId: "medworkout",
  storageBucket: "medworkout.firebasestorage.app",
  messagingSenderId: "150517018312",
  appId: "1:150517018312:android:893777d70def7b16247ffd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// THIS IS THE MAGIC LINE – enables offline cache (instant loading after first time)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});