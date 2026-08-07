import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore/lite";
import { authSessionUID } from "@kernel/firebase/auth";
import { firebaseConfig } from "@kernel/firebase/config";

const libraryCollection = "lib";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function firestorePackagesGet(col: string) {
  const libCollection = collection(db, col);
  const snapshot = await getDocs(libCollection);
  return snapshot.docs.map((entry) => entry.data());
}

export async function firestorePackageInstall(pckg: string) {
  const docRef = doc(db, libraryCollection, pckg);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return undefined;
  }
}

export async function firestoreUserData() {
  const uid = await authSessionUID();
  if (uid === undefined) {
    return false;
  }
  const userRef = doc(db, "user", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, { uid: uid, packages: [], settings: {} });
    return true;
  } else {
    return true;
  }
}