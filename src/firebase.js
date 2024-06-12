import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore/lite';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCG0N-M70KiM5HHVZcrXymd3o3-ksH_7Jw",
    authDomain: "todoapp-f4723.firebaseapp.com",
    projectId: "todoapp-f4723",
    storageBucket: "todoapp-f4723.appspot.com",
    messagingSenderId: "478531314832",
    appId: "1:478531314832:web:cbf7c3407eacf71817e415"
  };

  export const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };