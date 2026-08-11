import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { kernel } from "@kernel/api";
import { packageCommands } from "./packer";
import * as types from "@kernel/shared/types";

let terminalInstance: Terminal | null = null;
let terminalFitAddon: FitAddon | null = null;
let terminalResizeHandler: (() => void) | null = null;
let terminalLine = "";

let writeBuffer: string[] = [];
let writeAnimationFrame: number | null = null;
function bufferedWrite(data: string) {
  if (!terminalInstance) return;
  writeBuffer.push(data);

  if (!writeAnimationFrame) {
    writeAnimationFrame = requestAnimationFrame(() => {
      if (terminalInstance && writeBuffer.length > 0) {
        terminalInstance.write(writeBuffer.join(""));
        writeBuffer = [];
      }
      writeAnimationFrame = null;
    });
  }
}

async function terminalKernelRun(args: string[]) {
  const [path, ...rest] = args;
  if (!path) {
    bufferedWrite("\r\nusage: kernel <dotted.path> [...args]");
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
    bufferedWrite(`\r\nunknown kernel path: ${path}`);
    return;
  }
  try {
    const result = await (fn as (...a: unknown[]) => unknown).apply(target, rest);
    bufferedWrite(`\r\n${JSON.stringify(result ?? null)}`);
  } catch (err) {
    bufferedWrite(`\r\nkernel error: ${err}`);
  }
}

async function terminalPrint(result: unknown) {
  if (!terminalInstance) return;
  if (typeof result === "string") {
    bufferedWrite(`\r\n${result}`);
  } else if (result !== undefined) {
    bufferedWrite(`\r\n${JSON.stringify(result ?? null)}`);
  }
}

const terminalCommands: Record<string, types.terminalCommand> = {
  help: {
    args: "",
    description: "Show available commands",
    run: () => man(),
  },

  clear: {
    args: "",
    description: "Clear the terminal",
    run: () => {
      writeBuffer = [];
      terminalInstance?.write("\x1b[2J\x1b[3J\x1b[H");
    },
  },

  kernel: {
    args: "<command>",
    description: "Run a kernel command",
    run: (args) => terminalKernelRun(args),
  },

  ls: {
    args: "[path]",
    description: "List directory contents",
    run: async ([path]) => terminalPrint(kernel.bino.dir.list(path)),
  },

  cat: {
    args: "<path>",
    description: "Read a file",
    run: async ([path]) => terminalPrint(kernel.bino.file.read(path)),
  },

  touch: {
    args: "<path> [data...]",
    description: "Create or write to a file",
    run: async ([path, ...data]) =>
      terminalPrint(kernel.bino.file.write(path, data.join(" "))),
  },

  rm: {
    args: "<path>",
    description: "Delete a file",
    run: async ([path]) => terminalPrint(kernel.bino.file.delete(path)),
  },

  mkdir: {
    args: "<path>",
    description: "Create a directory",
    run: async ([path]) => terminalPrint(kernel.bino.dir.make(path)),
  },

  packer: {
    args: "<arg>",
    description: "Manage packages",
    sub: {
      get: {
        args: "<package>",
        description: "Get a package",
        run: async ([pckg]) => terminalPrint(await kernel.packer.get(pckg)),
      },
      remove: {
        args: "<package>",
        description: "Remove a package",
        run: async ([pckg]) => terminalPrint(await kernel.packer.remove(pckg)),
      },
      start: {
        args: "<package>",
        description: "Start a package",
        run: async ([pckg]) => terminalPrint(await kernel.packer.start(pckg)),
      },
      stop: {
        args: "<package>",
        description: "Stop a package",
        run: async ([pckg]) => terminalPrint(await kernel.packer.stop(pckg)),
      },
      fetch: {
        args: "",
        description: "Fetch package database",
        run: async () => terminalPrint(await kernel.packer.fetch()),
      },
      check: {
        args: "<package>",
        description: "Check if a package exists",
        run: async ([pckg]) => terminalPrint(kernel.packer.check(pckg)),
      },
    },
  },

  whoami: {
    args: "",
    description: "Show the current user",
    run: async () => terminalPrint(await kernel.account.sessionUID()),
  },
};

async function getActiveCommands(): Promise<Record<string, types.terminalCommand>> {
  const dynamicCommands = await packageCommands();
  return {
    ...terminalCommands,
    ...dynamicCommands,
  };
}

async function man() {
  if (!terminalInstance) return;
  const activeCommands = await getActiveCommands();
  const entries = Object.entries(activeCommands);

  const nameWidth = Math.max(...entries.map(([name]) => name.length));
  const argsWidth = Math.max(
    ...entries.map(([, command]) => command.args?.length || 0)
  );

  const lines = entries.map(([name, command]) => {
    const paddedName = name.padEnd(nameWidth);
    const paddedArgs = (command.args || "").padEnd(argsWidth);

    return ` ${paddedName}  ${paddedArgs}  ${command.description || ""}`;
  });

  bufferedWrite(
    `\r\n Available Commands:\r\n${lines.join("\r\n")}\r\n`
  );
}

async function terminalRun(line: string) {
  if (!terminalInstance) return;
  const trimmed = line.trim();

  if (!trimmed) {
    return;
  }

  const tokens = trimmed.split(/\s+/);

  let commandMap = await getActiveCommands();
  let command: types.terminalCommand | undefined;
  let i = 0;

  while (i < tokens.length) {
    command = commandMap[tokens[i]];

    if (!command) {
      bufferedWrite(
        `\r\nunknown command: ${tokens.slice(0, i + 1).join(" ")}`
      );
      return;
    }

    i++;

    if (command.sub) {
      commandMap = command.sub;
      continue;
    }

    break;
  }

  if (!command || !command.run) {
    bufferedWrite(`\r\nincomplete command — try 'help'`);
    return;
  }

  const args = tokens.slice(i);

  try {
    const result = await command.run(args);

    if (result !== undefined) {
      await terminalPrint(result);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    bufferedWrite(`\r\nerror: ${message}`);
  }
}

function terminalPrompt() {
  bufferedWrite("\r\n> ");
}

function terminalInput(data: string) {
  if (!terminalInstance) return;
  if (data === "\r") {
    terminalRun(terminalLine).then(() => {
      terminalLine = "";
      terminalPrompt();
    });
  } else if (data === "\u007F") {
    if (terminalLine.length > 0) {
      terminalLine = terminalLine.slice(0, -1);
      bufferedWrite("\b \b");
    }
  } else {
    terminalLine += data;
    bufferedWrite(data);
  }
}

export async function launch(element: HTMLElement) {
  await kill();

  terminalInstance = new Terminal();
  terminalFitAddon = new FitAddon();

  terminalInstance.loadAddon(terminalFitAddon);
  terminalInstance.open(element);
  try {
    terminalFitAddon.fit();
  } catch {}

  terminalResizeHandler = () => {
    try {
      terminalFitAddon?.fit();
    } catch {}
  };

  window.addEventListener("resize", terminalResizeHandler);

  bufferedWrite(
    "\r\nmodOS Terminal. \r\n enter 'help' to see a list of commands"
  );

  terminalPrompt();
  terminalInstance.onData(terminalInput);

  return true;
}
export async function kill() {
  if (writeAnimationFrame) {
    cancelAnimationFrame(writeAnimationFrame);
    writeAnimationFrame = null;
  }
  writeBuffer = [];
  if (terminalResizeHandler) {
    window.removeEventListener("resize", terminalResizeHandler);
    terminalResizeHandler = null;
  }
  if (terminalInstance) {
    terminalInstance.dispose();
    terminalInstance = null;
  }
  terminalFitAddon = null;
  terminalLine = "";
  return true;
}