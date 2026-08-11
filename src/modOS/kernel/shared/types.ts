export type messageType = "error" | "warn" | "info" | "success" | "log";
export type terminalCommand = {
  args: string;
  description: string;
  run?: (args: string[]) => void | Promise<void>;
  sub?: Record<string, terminalCommand>;
};
