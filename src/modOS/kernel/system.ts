import type { messageType } from "@kernel/shared/types";

let systemSoundBlockade = false;

export async function systemSound(sound: string, times?: number) {
  if (!systemSoundBlockade) {
    try {
      const url = `${import.meta.env.BASE_URL}media/${sound}.mp3`;
      const player = new Audio(url);
      player.loop = false;
      const repeats = times ?? 1;
      for (let i = 0; i < repeats; i++) {
        player.currentTime = 0;
        await new Promise<void>((resolve, reject) => {
          player.onended = () => resolve();
          player.onerror = () => reject(new Error("Failed to play audio"));
          player.play().catch(reject);
        });
      }
    } catch (err) {
      systemSoundBlockade = true;
      return `Unexpected problem or blockade occured. Toggled blockade mode, you should not see this message again. Error: ${err}`;
    }
  }
}

export async function systemLog(message: unknown, type?: messageType) {
  const manifest = document.querySelector<HTMLDivElement>(".manifest")!;
  const colors: Record<messageType, string> = {
    error: "#f00",
    warn: "#ff0",
    info: "#0ff",
    success: "#0f0",
    log: "#fff",
  };

  const consoleMethods: Record<messageType, keyof Console> = {
    error: "error",
    warn: "warn",
    info: "info",
    success: "log",
    log: "log",
  };

  const logType = type ?? "log";

  eval(`console.${consoleMethods[logType] ?? "log"}(message)`)

  manifest.insertAdjacentHTML(
    "beforeend",
    `<p style="color:${colors[logType]}">${message}</p>`,
  );
  manifest.scrollTop = manifest.scrollHeight;
  if (type == "warn") {
    await systemSound("beep");
  }
  if (type == "error") {
    await systemSound("beep", 3);
  }
}

export function systemDelay(t?: number): Promise<void> {
  let d = Math.floor(Math.random() * 1000);
  if (t !== undefined) {
    d = t;
  }
  return new Promise((resolve) => setTimeout(resolve, d));
}
