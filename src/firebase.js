
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCrDq7SfSfqijLQ4cig0IOFTPy5cbWVB7w",
    authDomain: "dlugi-84aaa.firebaseapp.com",
    projectId: "dlugi-84aaa",
    storageBucket: "dlugi-84aaa.firebasestorage.app",
    messagingSenderId: "428936094206",
    appId: "1:428936094206:web:79cf61d700fc1b431960af",
    measurementId: "G-VXLX96RXEN"
  };
  
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  // Initialize Firebase Authentication and get a reference to the service
  const auth = getAuth(app);
  
  export { db, auth };
