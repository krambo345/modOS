import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { kernel } from "@kernel/api";

let terminalInstance: Terminal | null = null;
let terminalFitAddon: FitAddon | null = null;
let terminalResizeObserver: ResizeObserver | null = null;
let terminalLine = "";

async function terminalKernelRun(args: string[]) {
  const [path, ...rest] = args;
  if (!path) {
    terminalInstance!.write("\r\nusage: kernel <dotted.path> [...args]");
    return;
  }
  const parts = path.split(".");
  const methodName = parts[parts.length - 1];
  let target: unknown = kernel;
  for (const part of parts.slice(0, -1)) {
    target = (target as Record<string, unknown> | undefined)?.[part];
  }
  const fn = (target as Record<string, unknown> | undefined)?.[methodName];
  if (typeof fn !== "function") {
    terminalInstance!.write(`\r\nunknown kernel path: ${path}`);
    return;
  }
  try {
    const result = await (fn as (...a: unknown[]) => unknown).apply(target, rest);
    terminalInstance!.write(`\r\n${JSON.stringify(result ?? null)}`);
  } catch (err) {
    terminalInstance!.write(`\r\nkernel error: ${err}`);
  }
}

async function terminalPrint(result: unknown) {
  terminalInstance!.write(`\r\n${JSON.stringify(result ?? null)}`);
}

const terminalCommands: Record<string, (args: string[]) => void | Promise<void>> = {
  help: () =>
    terminalInstance!.write(
      "\r\navailable: help, clear, ls, cat, write, rm, mkdir, install, uninstall, launch, kill, whoami, kernel <dotted.path> [...args]",
    ),
  clear: () => terminalInstance!.write("\x1b[2J\x1b[3J\x1b[H"),
  kernel: (args) => terminalKernelRun(args),
  ls: async ([path]) => terminalPrint(kernel.bino.dir.list(path)),
  cat: async ([path]) => terminalPrint(kernel.bino.file.read(path)),
  write: async ([path, ...data]) =>
    terminalPrint(await kernel.bino.file.write(path, data.join(" "))),
  rm: async ([path]) => terminalPrint(kernel.bino.file.delete(path)),
  mkdir: async ([path]) => terminalPrint(kernel.bino.dir.make(path)),
  install: async ([pckg]) => terminalPrint(await kernel.apps.install(pckg)),
  uninstall: async ([pckg]) => terminalPrint(kernel.apps.uninstall(pckg)),
  launch: async ([pckg]) => terminalPrint(await kernel.apps.launch(pckg)),
  kill: async ([pckg]) => terminalPrint(await kernel.apps.kill(pckg)),
  whoami: async () => terminalPrint(await kernel.account.sessionUID()),
};

function terminalPrompt() {
  terminalInstance!.write("\r\n");
}

async function terminalRun(line: string) {
  const [name, ...args] = line.trim().split(" ");
  const command = terminalCommands[name];
  if (command) {
    await command(args);
  } else if (name) {
    terminalInstance!.write(`\r\nunknown command: ${name}`);
  }
}

function terminalInput(data: string) {
  if (data === "\r") {
    terminalRun(terminalLine).then(() => {
      terminalLine = "";
      terminalPrompt();
    });
  } else if (data === "\u007F") {
    terminalLine = terminalLine.slice(0, -1);
    terminalInstance!.write("\b \b");
  } else {
    terminalLine += data;
    terminalInstance!.write(data);
  }
}

export async function launch(element: HTMLElement) {
  terminalInstance = new Terminal();
  terminalFitAddon = new FitAddon();
  terminalInstance.loadAddon(terminalFitAddon);
  terminalInstance.open(element);
  terminalFitAddon.fit();

  terminalResizeObserver = new ResizeObserver(() => terminalFitAddon!.fit());
  terminalResizeObserver.observe(element);

  terminalInstance.write("modOS terminal");
  terminalPrompt();
  terminalInstance.onData(terminalInput);

  return true;
}

export async function kill() {
  if (terminalResizeObserver) {
    terminalResizeObserver.disconnect();
    terminalResizeObserver = null;
  }
  if (terminalInstance) {
    terminalInstance.dispose();
    terminalInstance = null;
  }
  terminalFitAddon = null;
  return true;
}