import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { firebaseConfig } from "@kernel/firebase/config";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function authSessionUID() {
  return auth.currentUser?.uid;
}

export async function authAccountManager(credentials: {
  action: string;
  email: string;
  password: string;
}): Promise<UserCredential> {
  const { action, email, password } = credentials;

  if (action === "signup") {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  return await signInWithEmailAndPassword(auth, email, password);
}

export async function authGoogleAccountManager(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}
