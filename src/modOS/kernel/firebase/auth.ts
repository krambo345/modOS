import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  linkWithCredential,
} from "firebase/auth";
import type { AuthCredential, UserCredential } from "firebase/auth";
import { firebaseConfig } from "@kernel/firebase/config";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let pendingGoogleCredential: AuthCredential | null = null;
let pendingGoogleEmail: string | null = null;

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

  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error?.code === "auth/account-exists-with-different-credential") {
      pendingGoogleCredential = GoogleAuthProvider.credentialFromError(error);
      pendingGoogleEmail = error?.customData?.email ?? null;

      throw {
        code: "modos/link-required",
        email: pendingGoogleEmail,
      };
    }

    throw error;
  }
}

export async function authLinkGoogleWithPassword(password: string): Promise<UserCredential> {
  if (!pendingGoogleCredential || !pendingGoogleEmail) {
    throw new Error("No pending Google sign-in to link");
  }

  const credential = pendingGoogleCredential;
  const email = pendingGoogleEmail;

  const result = await signInWithEmailAndPassword(auth, email, password);
  await linkWithCredential(result.user, credential);

  pendingGoogleCredential = null;
  pendingGoogleEmail = null;

  return result;
}

export async function authSignOut(): Promise<void> {
  await signOut(auth);
}
