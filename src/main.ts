import "./modOS/kernel/default.css";
import "./modOS/kernel/shared/types.ts";
import { bootstrap } from "./modOS/kernel/bootstrap.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="manifest"></div>
  <div class="display"></div>
`;
bootstrap();
