import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAdb_8iom6OfNq7UXt09Xp4o46rwtXhWaE",
  authDomain: "pavanputra-88fda.firebaseapp.com",
  projectId: "pavanputra-88fda",
  storageBucket: "pavanputra-88fda.firebasestorage.app",
  messagingSenderId: "740151559749",
  appId: "1:740151559749:web:1ef9e240f3dfee0ebc852c",
  measurementId: "G-B0BEY75VY8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
