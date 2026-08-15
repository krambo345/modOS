import {
  initializeApp
} from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore/lite";
import { authSessionUID } from "@kernel/firebase/auth";
import { firebaseConfig } from "@kernel/firebase/config";
import * as bino from "@kernel/bino";
import * as variables from "@kernel/shared/variables";

const libraryCollection = "lib";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export type UserData = {
  packages: string[];
  settings: Record<string, unknown>;
  files: Record<string, unknown>;
  directories: string[];
};

export async function firestorePackagesGet(col: string) {
  const libCollection = collection(db, col);
  const snapshot = await getDocs(libCollection);

  return snapshot.docs.map((entry) => ({
    id: entry.id,
    ...entry.data()
  }));
}

export async function firestorePackageInstall(pckg: string) {
  const docRef = doc(db, libraryCollection, pckg);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  return undefined;
}

export async function firestoreUserData(): Promise<UserData | null> {
  const uid = await authSessionUID();

  if (uid == null) {
    return null;
  }

  const userRef = doc(db, "user", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const data: UserData = {
      packages: [],
      settings: {},
      files: {},
      directories: []
    };

    await setDoc(userRef, data);

    return data;
  }

  const data = userSnap.data();

  return {
    packages: Array.isArray(data.packages)
      ? data.packages
      : [],
    settings:
      data.settings &&
      typeof data.settings === "object" &&
      !Array.isArray(data.settings)
        ? data.settings
        : {},
    files:
      data.files &&
      typeof data.files === "object" &&
      !Array.isArray(data.files)
        ? data.files
        : {},
    directories: Array.isArray(data.directories)
      ? data.directories
      : []
  };
}

async function firestoreUserFiles(
  path: string,
  files: Record<string, unknown>,
  directories: string[]
): Promise<void> {
  const contents = bino.binoDirContents(path);

  if (!contents) {
    return;
  }

  for (const entry of contents) {
    const entryPath =
      path === "/"
        ? `/${entry}`
        : `${path}/${entry}`;

    if (!bino.binoCheck(entryPath)) {
      continue;
    }

    const nested = bino.binoDirContents(entryPath);

    if (Array.isArray(nested)) {
      directories.push(entryPath);
      await firestoreUserFiles(
        entryPath,
        files,
        directories
      );
    } else {
      files[entryPath] = bino.binoRead(entryPath);
    }
  }
}

async function firestoreLocalUserData(
  packages: string[]
): Promise<UserData> {
  const settingsRaw = bino.binoRead(
    variables.usrSettingsLoc
  );

  let settings: Record<string, unknown> = {};

  if (typeof settingsRaw === "string") {
    try {
      const parsed = JSON.parse(settingsRaw);

      if (
        parsed !== null &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        settings = parsed;
      }
    } catch {
      settings = {};
    }
  } else if (
    settingsRaw !== null &&
    typeof settingsRaw === "object" &&
    !Array.isArray(settingsRaw)
  ) {
    settings = settingsRaw as Record<string, unknown>;
  }

  const files: Record<string, unknown> = {};
  const directories: string[] = [];

  const userRoot = "/usr";

  if (bino.binoCheck(userRoot)) {
    directories.push(userRoot);

    await firestoreUserFiles(
      userRoot,
      files,
      directories
    );
  }

  return {
    packages,
    settings,
    files,
    directories
  };
}

export async function firestoreUserUpdate(): Promise<UserData | null> {
  const uid = await authSessionUID();

  if (uid == null) {
    return null;
  }

  const existing = await firestoreUserData();

  const packages = existing?.packages ?? [];

  const data = await firestoreLocalUserData(
    packages
  );

  const userRef = doc(db, "user", uid);

  await setDoc(userRef, data);

  return data;
}

export async function firestoreSettingsUpdate(): Promise<UserData | null> {
  const uid = await authSessionUID();

  if (uid == null) {
    return null;
  }

  const existing = await firestoreUserData();

  if (!existing) {
    return null;
  }

  const settingsRaw = bino.binoRead(
    variables.usrSettingsLoc
  );

  let settings: Record<string, unknown>;

  if (typeof settingsRaw === "string") {
    try {
      const parsed = JSON.parse(settingsRaw);

      if (
        parsed === null ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return null;
      }

      settings = parsed;
    } catch {
      return null;
    }
  } else if (
    settingsRaw !== null &&
    typeof settingsRaw === "object" &&
    !Array.isArray(settingsRaw)
  ) {
    settings = settingsRaw as Record<string, unknown>;
  } else {
    settings = {};
  }

  const data: UserData = {
    ...existing,
    settings
  };

  const userRef = doc(db, "user", uid);

  await setDoc(userRef, data);

  return data;
}

export async function firestorePackagesUpdate(
  packages: string[]
): Promise<UserData | null> {
  const uid = await authSessionUID();

  if (uid == null) {
    return null;
  }

  const existing = await firestoreUserData();

  if (!existing) {
    return null;
  }

  const data: UserData = {
    ...existing,
    packages
  };

  const userRef = doc(db, "user", uid);

  await setDoc(userRef, data);

  return data;
}