import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAdBJett0OLHVfestojoToTMuknCDEc0js",
  authDomain: "to-do-list-app-lanthony42.firebaseapp.com",
  projectId: "to-do-list-app-lanthony42",
  storageBucket: "to-do-list-app-lanthony42.firebasestorage.app",
  messagingSenderId: "288857823720",
  appId: "1:288857823720:web:9f0fdb68dc839a93a5ec5d",
  measurementId: "G-N57MRWRR0X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
