/* DIAW FITNESS 4.1 - Interface locale sans compte */
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const menuButton = $("menuButton");
  const mainMenu = $("mainMenu");
  const profileSection = $("profileSection");
  const settingsSection = $("settingsSection");
  const profileForm = $("profileForm");
  const profileMessage = $("profileMessage");
  const profileKey = "diawFitnessProfile";

  if (mainMenu && mainMenu.parentElement !== document.body) {
    document.body.appendChild(mainMenu);
  }

  function fermerMenu() {
    if (!mainMenu || !menuButton) return;
    mainMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }

  function ouvrirSection(section) {
    if (profileSection) profileSection.hidden = section !== profileSection;
    if (settingsSection) settingsSection.hidden = section !== settingsSection;
  }

  if (menuButton && mainMenu) {
    menuButton.hidden = false;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.addEventListener("click", event => {
      event.stopPropagation();
      mainMenu.hidden = !mainMenu.hidden;
      menuButton.setAttribute("aria-expanded", String(!mainMenu.hidden));
    });
    mainMenu.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("click", fermerMenu);
  }

  function chargerProfil() {
    if (!profileForm) return;
    let profil = {};
    try {
      profil = JSON.parse(localStorage.getItem(profileKey) || "{}");
    } catch (error) {
      console.warn("Profil local illisible.", error);
    }
    document.getElementById("profileName").value = profil.display_name || "";
    document.getElementById("profileAge").value = profil.birth_date || "";
    document.getElementById("profileHeight").value = profil.height_cm ?? "";
    document.getElementById("profileWeight").value = profil.weight_kg ?? "";
    document.getElementById("profileGoal").value = profil.daily_movement_goal || 6000;
  }

  if (profileForm) {
    chargerProfil();
    profileForm.addEventListener("submit", event => {
      event.preventDefault();
      const valeur = name => {
        const v = document.getElementById(name).value.trim();
        return v === "" ? null : Number(v);
      };
      const profil = {
        display_name: document.getElementById("profileName").value.trim(),
        birth_date: document.getElementById("profileAge").value || null,
        height_cm: valeur("profileHeight"),
        weight_kg: valeur("profileWeight"),
        daily_movement_goal: valeur("profileGoal") || 6000
      };
      try {
        localStorage.setItem(profileKey, JSON.stringify(profil));
        if (profileMessage) profileMessage.textContent = "Profil enregistré sur cet appareil.";
      } catch (error) {
        if (profileMessage) profileMessage.textContent = "Impossible d'enregistrer le profil.";
      }
    });
  }

  $("menuProfile")?.addEventListener("click", () => {
    fermerMenu();
    ouvrirSection(profileSection);
    chargerProfil();
    profileSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("menuSettings")?.addEventListener("click", () => {
    fermerMenu();
    ouvrirSection(settingsSection);
    actualiserNotifications();
    settingsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("settingsGoalButton")?.addEventListener("click", () => {
    ouvrirSection(profileSection);
    chargerProfil();
    profileSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function appliquerTheme(theme) {
    const choix = theme === "light" ? "light" : "dark";
    document.body.classList.toggle("light-theme", choix === "light");
    if ($("themeSelect")) $("themeSelect").value = choix;
  }

  let theme = "dark";
  try {
    theme = localStorage.getItem("diawFitnessTheme") || "dark";
  } catch (error) {}
  appliquerTheme(theme);

  $("themeSelect")?.addEventListener("change", event => {
    const choix = event.target.value === "light" ? "light" : "dark";
    appliquerTheme(choix);
    try {
      localStorage.setItem("diawFitnessTheme", choix);
    } catch (error) {}
  });

  function actualiserNotifications() {
    const status = $("notificationStatus");
    const button = $("notificationButton");
    if (!status || !button) return;

    if (!("Notification" in window)) {
      status.textContent = "Notifications non prises en charge.";
      button.disabled = true;
      return;
    }

    const permission = Notification.permission;
    status.textContent = permission === "granted"
      ? "Notifications autorisées sur cet appareil."
      : permission === "denied"
        ? "Notifications bloquées dans les paramètres de l'appareil."
        : "Les notifications ne sont pas encore autorisées.";

    button.textContent = permission === "granted"
      ? "Notifications autorisées"
      : "Autoriser les notifications";
    button.disabled = permission !== "default";
  }

  $("notificationButton")?.addEventListener("click", async () => {
    if (!("Notification" in window)) return;
    try {
      await Notification.requestPermission();
    } catch (error) {}
    actualiserNotifications();
  });

  $("menuSessions")?.addEventListener("click", () => {
    fermerMenu();
    ouvrirSection(null);
    document.querySelector(".history")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  actualiserNotifications();
});
