import { kernel } from "@kernel/api";

export async function bootstrapAccountForm(): Promise<{
  action: string;
  email?: string;
  password?: string;
}> {
  return new Promise((resolve) => {
    const manifest = document.querySelector<HTMLDivElement>(".manifest")!;
    manifest.innerHTML = `
    <div class="modos-account">
    <div class="modos-account__form">

        <h1>modOS Account Service</h1>

        <section class="modos-account__action">
            <label for="account-action">I am</label>

            <select class="modos-account__action-selector">
                <option value="signup">Signing up</option>
                <option value="login">Logging in</option>
            </select>

            <span>.</span>
        </section>

        <div class="modos-account__field">
            <label for="email">Email</label>
            <input
                type="email"
                autocomplete="email"
                placeholder="Enter your email"
                class="modos-account__field-email"
            >
        </div>

        <div class="modos-account__field">
            <label for="password">Password</label>
            <input
                type="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="modos-account__field-password"
            >
        </div>

        <div class="account-button">
          <button
            type="button"
            class="account-submit"
        >
            Submit
        </button>
        <button
            type="button"
            class="account-guest"
        >
            Guest
        </button>
        </div>

        <p>
            or
            <span
                class="modos-account__link"
            >
                continue with Google
            </span>
        </p>

        <div class="modos-account__link-notice" style="display:none;">
            <p>An account already exists for <span class="modos-account__link-email"></span>. Enter your password above and click Link to connect Google sign-in to that account.</p>
            <button
                type="button"
                class="account-link"
            >
                Link Account
            </button>
        </div>

    </div>
</div>
        `;

    const submit = manifest.querySelector<HTMLButtonElement>(".account-submit")!;
    const guest = manifest.querySelector<HTMLButtonElement>(".account-guest")!;
    const google = manifest.querySelector<HTMLSpanElement>(".modos-account__link")!;
    const linkNotice = manifest.querySelector<HTMLDivElement>(".modos-account__link-notice")!;
    const linkEmail = manifest.querySelector<HTMLSpanElement>(".modos-account__link-email")!;
    const link = manifest.querySelector<HTMLButtonElement>(".account-link")!;

    submit.addEventListener("click", async () => {
      const action = (
        manifest.querySelector(".modos-account__action-selector") as HTMLSelectElement
      ).value;

      const email = (manifest.querySelector(".modos-account__field-email") as HTMLInputElement)
        .value;

      const password = (
        manifest.querySelector(".modos-account__field-password") as HTMLInputElement
      ).value;

      try {
        await kernel.account.manage({ action, email, password });
        resolve({ action, email, password });
      } catch (err) {
        await kernel.system.log(`Account error: ${err}`, "error");
      }
    });
    guest.addEventListener("click", async () => {
      try {
        await kernel.account.signOut();
      } catch (err) {
        await kernel.system.log(`Guest sign-out error: ${err}`, "warn");
      }
      resolve({ action: "guest" });
    });
    google.addEventListener("click", async () => {
      try {
        await kernel.account.manageWithGoogle();
        resolve({ action: "google", email: "", password: "" });
      } catch (err: any) {
        if (err?.code === "modos/link-required") {
          linkEmail.textContent = err.email ?? "";
          linkNotice.style.display = "block";
          (manifest.querySelector(".modos-account__field-password") as HTMLInputElement)?.focus();
        } else {
          await kernel.system.log(`Google sign-in error: ${err}`, "error");
        }
      }
    });
    link.addEventListener("click", async () => {
      const password = (
        manifest.querySelector(".modos-account__field-password") as HTMLInputElement
      ).value;

      try {
        await kernel.account.linkGoogle(password);
        resolve({ action: "google", email: "", password: "" });
      } catch (err) {
        await kernel.system.log(`Account link error: ${err}`, "error");
      }
    });
  });
}
