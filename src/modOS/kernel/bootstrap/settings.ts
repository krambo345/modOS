import { kernel } from "@kernel/api";
export async function settings() {
  const uid = await kernel.account.sessionUID();

  if (uid == null) {
    return "User is guest. Skipping...";
  }

  const data = await kernel.account.ensureUserData();

  return {
    settings: data?.settings,
    packages: data?.packages,
  };
}