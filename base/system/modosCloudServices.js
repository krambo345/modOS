import { getSHA256Hash } from "boring-webcrypto-sha256";
import { initializeApp } from "fire/base/app";
import { getAnalytics } from "fire/base/analytics"; const firebaseConfig = {

  apiKey: FIREBASE_API,

  authDomain: "modos-webos.firebaseapp.com",

  projectId: "modos-webos",

  storageBucket: "modos-webos.firebasestorage.app",

  messagingSenderId: "403933601096",

  appId: "1:403933601096:web:6cd2d539530a8f00b8e77d",

  measurementId: "G-Z5TBYHEBZW"

}
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

import { doc, Firestore, getFirestore, setDoc } from "fire/base/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/fire/base/answer/7015592



// Initialize Cloud Firestore and get a reference to the service
const firestore = getFirestore();

const username = 'bill';
const password = '1234bobster'
makeuser(username, password)

const user = doc(firestore, `user/${username}`)
async function makeuser(uname, pwd) {
  const encryptpwd = await getSHA256Hash(pwd);
  
  const docData = {
    username: uname,
    password: encryptpwd
  }
  setDoc(user, docData)
  console.log(encryptpwd);
}
