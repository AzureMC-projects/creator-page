(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  $("#year").textContent = new Date().getFullYear();

  // Netlify application form
  const form = $("#creator-form");
  const success = $("#success");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "<span>Sending…</span><span>↗</span>";

    try {
      const body = new URLSearchParams();
      new FormData(form).forEach((value, key) => body.append(key, value));

      const response = await fetch(form.getAttribute("action") || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        credentials: "same-origin"
      });

      if (!response.ok) throw new Error("Netlify returned " + response.status);

      form.hidden = true;
      success.classList.add("show");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      // If an AJAX request is blocked by the current browser/network, let the
      // browser perform the normal Netlify form POST instead of losing the application.
      button.disabled = false;
      button.innerHTML = original;
      const fallback = confirm("The quick submission could not connect to the form service. Try the standard submission instead?");
      if (fallback) {
        HTMLFormElement.prototype.submit.call(form);
      }
    }
  });

  // Modal controls
  const settingsPanel = $("#settingsPanel");
  const authPanel = $("#authPanel");

  const setModal = (panel, open) => {
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);
  };

  const openSettings = () => setModal(settingsPanel, true);
  const closeSettings = () => setModal(settingsPanel, false);
  const openAuth = () => setModal(authPanel, true);
  const closeAuth = () => setModal(authPanel, false);

  $("#settingsBtn").addEventListener("click", openSettings);
  $("#closeSettings").addEventListener("click", closeSettings);
  $("#signInBtn").addEventListener("click", openAuth);
  $("#closeAuth").addEventListener("click", closeAuth);

  [settingsPanel, authPanel].forEach((panel) => {
    panel.addEventListener("click", (event) => {
      if (event.target === panel) setModal(panel, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeSettings();
    closeAuth();
  });

  // Appearance settings
  const themeSelect = $("#themeSelect");
  const applyTheme = (theme, persist = true) => {
    const isLight = theme === "light" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);

    document.body.classList.toggle("light", isLight);
    if (persist) localStorage.setItem("solance-theme", theme);
  };

  const savedTheme = localStorage.getItem("solance-theme") || "dark";
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);

  themeSelect.addEventListener("change", (event) => applyTheme(event.target.value));

  const motionToggle = $("#motionToggle");
  const setMotion = () => {
    const reduced = motionToggle.checked;
    document.documentElement.classList.toggle("reduce-motion", reduced);
    localStorage.setItem("solance-reduce-motion", reduced ? "1" : "0");
  };

  motionToggle.checked = localStorage.getItem("solance-reduce-motion") === "1";
  motionToggle.addEventListener("change", setMotion);
  setMotion();

  // Keep System theme synced if the OS preference changes.
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if ((localStorage.getItem("solance-theme") || "dark") === "system") applyTheme("system", false);
  });

  // Sign-in UI. Real authentication is deliberately not faked without a backend.
  const authEmail = $("#authEmail");
  const authPassword = $("#authPassword");
  const authSubmit = $("#authSubmit");
  const authMessage = $("#authMessage");
  const authModeButtons = $$(".auth-mode");

  const showAuthMessage = (message, type = "info") => {
    authMessage.textContent = message;
    authMessage.dataset.type = type;
    authMessage.hidden = false;
  };

  authModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      authModeButtons.forEach((item) => item.classList.toggle("active", item === button));
      const create = button.dataset.mode === "signup";
      $("#authTitle").textContent = create ? "Create your account" : "Welcome back";
      $("#authCopy").textContent = create
        ? "Create an account to keep your creator profile and future project activity in one place."
        : "Sign in to your Solance account.";
      authSubmit.textContent = create ? "Create account" : "Sign in";
      authPassword.autocomplete = create ? "new-password" : "current-password";
      authMessage.hidden = true;
    });
  });

  $("#forgotPassword").addEventListener("click", () => {
    if (!authEmail.value.trim()) {
      authEmail.focus();
      showAuthMessage("Enter your email address first, then use the password reset flow.", "error");
      return;
    }
    showAuthMessage("Password reset will be enabled when the Solance Supabase authentication backend is connected.", "info");
  });

  authSubmit.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!email || !authEmail.validity.valid) {
      authEmail.focus();
      showAuthMessage("Please enter a valid email address.", "error");
      return;
    }

    if (password.length < 8) {
      authPassword.focus();
      showAuthMessage("Your password should be at least 8 characters.", "error");
      return;
    }

    showAuthMessage("The account UI is ready. Secure sign-in will be activated once the Supabase project is connected.", "info");
  });
})();