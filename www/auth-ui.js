/* DIAW FITNESS 4.1 - Interface de connexion + menu utilisateur */

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const authSection = document.getElementById("authSection");
  const logoutButton = document.getElementById("logoutButton");
  const authMessage = document.getElementById("authMessage");
  const userPanel = document.getElementById("userPanel");
  const protectedApp = document.getElementById("protectedApp");
  const userName = document.getElementById("userName");

  const menuButton = document.getElementById("menuButton");
  const mainMenu = document.getElementById("mainMenu");

  /* Le menu est détaché du conteneur .app */
  if (mainMenu) document.body.appendChild(mainMenu);
  const menuUserName = document.getElementById("menuUserName");
  const menuLogout = document.getElementById("menuLogout");
  const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");

    if (showSignup && showLogin && signupForm && loginForm) {
      showSignup.addEventListener("click", () => {
        loginForm.hidden = true;
        signupForm.hidden = false;
      });

      showLogin.addEventListener("click", () => {
        signupForm.hidden = true;
        loginForm.hidden = false;
      });
    }

    const menuProfile = document.getElementById("menuProfile");
  const profileSection = document.getElementById("profileSection");
  const profileForm = document.getElementById("profileForm");
  const profileMessage = document.getElementById("profileMessage");

  if (!window.diawAuth || !signupForm || !loginForm || !protectedApp) {
    console.error("Interface d'authentification indisponible.");
    return;
  }

  function message(texte, erreur = false) {
    if (!authMessage) return;

    authMessage.textContent = texte;
    authMessage.style.color = erreur
      ? "#ff7777"
      : "var(--green)";
  }

  function fermerMenu() {
    if (!mainMenu || !menuButton) return;

    mainMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }

  function ouvrirMenu() {
    if (!mainMenu || !menuButton) return;

    mainMenu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
  }

  function afficherUtilisateur(user) {
    const connecte = Boolean(user);

    protectedApp.hidden = !connecte;
    if (authSection) authSection.hidden = connecte;

    signupForm.hidden = !connecte;
    loginForm.hidden = connecte;
    userPanel.hidden = !connecte;

    if (menuButton) {
      menuButton.hidden = !connecte;
    }

    if (!connecte) {
      fermerMenu();

      if (menuUserName) {
        menuUserName.textContent = "Utilisateur";
      }

      return;
    }

    const nom =
      user.user_metadata?.display_name ||
      user.email ||
      "Utilisateur";

    userName.textContent = nom;

    if (menuUserName) {
      menuUserName.textContent = nom;
    }

    message("Vous êtes connecté.");
  }

  /* =========================
     MENU
     ========================= */

  if (menuButton && mainMenu) {
    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();

      if (mainMenu.hidden) {
        ouvrirMenu();
      } else {
        fermerMenu();
      }
    });

    mainMenu.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", () => {
      fermerMenu();
    });
  }

  /* =========================
     INSCRIPTION
     ========================= */


  /* =========================
     PROFIL SPORTIF
     ========================= */

  async function chargerProfil() {
    if (!profileForm || !profileMessage) return;

    profileMessage.textContent = "Chargement du profil...";

    try {
      const utilisateur = await window.diawAuth.utilisateurActuel();
      if (!utilisateur) throw new Error("Connectez-vous pour accéder au profil.");

      const { data, error } = await window.diawAuth.client
        .from("sport_profiles")
        .select("display_name, birth_date, height_cm, weight_kg, daily_movement_goal")
        .eq("user_id", utilisateur.id)
        .maybeSingle();

      if (error) throw error;

      profileForm.elements.profileName.value =
        data?.display_name || utilisateur.user_metadata?.display_name || "";
      profileForm.elements.profileAge.value = data?.birth_date ?? "";
      profileForm.elements.profileHeight.value = data?.height_cm ?? "";
      profileForm.elements.profileWeight.value = data?.weight_kg ?? "";
      profileForm.elements.profileGoal.value = data?.daily_movement_goal ?? 6000;

      profileMessage.textContent = data
        ? "Profil chargé. Vous pouvez le modifier."
        : "Bienvenue ! Complétez votre profil sportif.";
    } catch (error) {
      profileMessage.textContent = error.message || "Erreur de chargement du profil.";
    }
  }

  if (menuProfile && profileSection) {
    menuProfile.addEventListener("click", async () => {
      fermerMenu();
      profileSection.hidden = false;
      await chargerProfil();
      profileSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* =========================
   PARAMETRES DIAW FITNESS
   ========================= */

  const menuSettings = document.getElementById("menuSettings");
  const settingsSection = document.getElementById("settingsSection");
  const themeSelect = document.getElementById("themeSelect");
  const notificationStatus = document.getElementById("notificationStatus");
  const notificationButton = document.getElementById("notificationButton");
  const settingsGoalButton = document.getElementById("settingsGoalButton");

  function appliquerTheme(theme) {
    const choix = theme === "light" ? "light" : "dark";
    document.body.classList.toggle("light-theme", choix === "light");
    if (themeSelect) themeSelect.value = choix;
  }

  let themeSauve = "dark";

  try {
    themeSauve = localStorage.getItem("diawFitnessTheme") || "dark";
  } catch (error) {
    console.warn("Préférence du thème inaccessible.");
  }

  appliquerTheme(themeSauve);

  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      const theme = themeSelect.value === "light" ? "light" : "dark";
      appliquerTheme(theme);

      try {
        localStorage.setItem("diawFitnessTheme", theme);
      } catch (error) {
        console.warn("Impossible de mémoriser le thème.");
      }
    });
  }

  function actualiserNotifications() {
    if (!notificationStatus || !notificationButton) return;

    if (!("Notification" in window)) {
      notificationStatus.textContent =
        "Notifications non prises en charge par ce navigateur.";
      notificationButton.disabled = true;
      return;
    }

    const permission = Notification.permission;

    if (permission === "granted") {
      notificationStatus.textContent = "Notifications autorisées sur cet appareil.";
      notificationButton.textContent = "Notifications autorisées";
      notificationButton.disabled = true;
    } else if (permission === "denied") {
      notificationStatus.textContent =
        "Notifications bloquées dans les paramètres du navigateur.";
      notificationButton.textContent = "Notifications bloquées";
      notificationButton.disabled = true;
    } else {
      notificationStatus.textContent = "Les notifications ne sont pas encore autorisées.";
      notificationButton.textContent = "Autoriser les notifications";
      notificationButton.disabled = false;
    }
  }

  if (menuSettings && settingsSection) {
    menuSettings.addEventListener("click", () => {
      fermerMenu();
      settingsSection.hidden = false;
      actualiserNotifications();
      settingsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  if (notificationButton) {
    notificationButton.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        actualiserNotifications();
        return;
      }

      try {
        await Notification.requestPermission();
        actualiserNotifications();
      } catch (error) {
        notificationStatus.textContent =
          "Impossible de demander l'autorisation.";
      }
    });
  }

  if (settingsGoalButton && profileSection) {
    settingsGoalButton.addEventListener("click", async () => {
      settingsSection.hidden = true;
      profileSection.hidden = false;
      await chargerProfil();
      profileSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }


  /* =========================
     SECURITE DU COMPTE
     ========================= */

  const menuSecurity = document.getElementById("menuSecurity");
  const securitySection = document.getElementById("securitySection");
  const securityEmail = document.getElementById("securityEmail");
  const securityStatus = document.getElementById("securityStatus");
  const securityPasswordForm = document.getElementById("securityPasswordForm");
  const securityNewPassword = document.getElementById("securityNewPassword");
  const securityConfirmPassword = document.getElementById("securityConfirmPassword");
  const securityPasswordMessage = document.getElementById("securityPasswordMessage");
  const securityPasswordButton = document.getElementById("securityPasswordButton");

  if (menuSecurity && securitySection) {
    menuSecurity.addEventListener("click", async () => {
      fermerMenu();
      securitySection.hidden = false;

      if (settingsSection) settingsSection.hidden = true;
      if (profileSection) profileSection.hidden = true;

      securityEmail.textContent = "Chargement...";
      securityStatus.textContent = "Vérification de la session...";

      try {
        const user = await window.diawAuth.utilisateurActuel();

        if (user) {
          securityEmail.textContent = user.email || "Non renseigné";
          securityStatus.textContent = "Votre compte est connecté et actif.";
        } else {
          securityEmail.textContent = "Aucun compte connecté";
          securityStatus.textContent = "Veuillez vous reconnecter.";
        }
      } catch (error) {
        securityEmail.textContent = "Indisponible";
        securityStatus.textContent = "Impossible de vérifier votre session.";
      }

      securitySection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  if (securityPasswordForm) {
    securityPasswordForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nouveau = securityNewPassword.value;
      const confirmation = securityConfirmPassword.value;

      securityPasswordMessage.textContent = "";

      if (nouveau.length < 8) {
        securityPasswordMessage.textContent =
          "Le mot de passe doit contenir au moins 8 caractères.";
        return;
      }

      if (nouveau !== confirmation) {
        securityPasswordMessage.textContent =
          "Les deux mots de passe ne correspondent pas.";
        return;
      }

      securityPasswordButton.disabled = true;
      securityPasswordButton.textContent = "Modification en cours...";

      try {
        const user = await window.diawAuth.utilisateurActuel();

        if (!user) {
          throw new Error("Vous devez être connecté pour modifier votre mot de passe.");
        }

        const { error } = await window.diawAuth.client.auth.updateUser({
          password: nouveau
        });

        if (error) throw error;

        securityPasswordMessage.textContent =
          "Votre mot de passe a été modifié avec succès.";
        securityPasswordMessage.style.color = "#54e0c1";
        securityPasswordForm.reset();

      } catch (error) {
        securityPasswordMessage.textContent =
          "Échec de la modification : " + error.message;
        securityPasswordMessage.style.color = "#ff7777";
      } finally {
        securityPasswordButton.disabled = false;
        securityPasswordButton.textContent = "Modifier mon mot de passe";
      }
    });
  }

  /* FIN SECURITE DU COMPTE */

  /* FIN DES PARAMETRES */

  if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const bouton = profileForm.querySelector('button[type="submit"]');
      bouton.disabled = true;
      profileMessage.textContent = "Enregistrement en cours...";

      try {
        const utilisateur = await window.diawAuth.utilisateurActuel();
        if (!utilisateur) throw new Error("Vous devez être connecté.");

        const valeur = (id) => {
          const v = profileForm.elements[id].value.trim();
          return v === "" ? null : Number(v);
        };

        const profil = {
          user_id: utilisateur.id,
          display_name: profileForm.elements.profileName.value.trim() || null,
          birth_date: profileForm.elements.profileAge.value || null,
          height_cm: valeur("profileHeight"),
          weight_kg: valeur("profileWeight"),
          daily_movement_goal: valeur("profileGoal") || 6000,
          updated_at: new Date().toISOString()
        };

        const { error } = await window.diawAuth.client
          .from("sport_profiles")
          .upsert(profil, { onConflict: "user_id" });

        if (error) throw error;

        profileMessage.textContent = "Profil enregistré avec succès !";
      } catch (error) {
        profileMessage.textContent = error.message || "Erreur lors de l'enregistrement.";
      } finally {
        bouton.disabled = false;
      }
    });
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bouton = signupForm.querySelector("button");
    bouton.disabled = true;

    try {
      const nom =
        document.getElementById("signupName").value;

      const email =
        document.getElementById("signupEmail").value;

      const password =
        document.getElementById("signupPassword").value;

      message("Création du compte en cours...");

      const resultat =
        await window.diawAuth.inscription(
          nom,
          email,
          password
        );

      if (resultat.session) {
        afficherUtilisateur(resultat.user);
      } else {
        message(
          "Compte créé. Vérifiez votre e-mail pour confirmer l'inscription."
        );
      }

      signupForm.reset();

    } catch (error) {
      message(
        error.message ||
        "Erreur lors de l'inscription.",
        true
      );

    } finally {
      bouton.disabled = false;
    }
  });

  /* =========================
     CONNEXION
     ========================= */

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bouton = loginForm.querySelector("button");
    bouton.disabled = true;

    try {
      const email =
        document.getElementById("loginEmail").value;

      const password =
        document.getElementById("loginPassword").value;

      message("Connexion en cours...");

      const resultat =
        await window.diawAuth.connexion(
          email,
          password
        );

      afficherUtilisateur(resultat.user);

      loginForm.reset();

    } catch (error) {
      message(
        error.message ||
        "Erreur de connexion.",
        true
      );

    } finally {
      bouton.disabled = false;
    }
  });

  /* =========================
     DÉCONNEXION ANCIEN BOUTON
     ========================= */

  async function effectuerDeconnexion() {
    try {
      await window.diawAuth.deconnexion();

      afficherUtilisateur(null);

      message("Vous êtes déconnecté.");

    } catch (error) {
      message(
        error.message ||
        "Erreur de déconnexion.",
        true
      );
    }
  }

  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      effectuerDeconnexion
    );
  }

  /* =========================
     DÉCONNEXION DEPUIS LE MENU
     ========================= */

  if (menuLogout) {
    menuLogout.addEventListener(
      "click",
      async () => {
        fermerMenu();
        await effectuerDeconnexion();
      }
    );
  }

  /* =========================
     SESSION EXISTANTE
     ========================= */

  window.diawAuth.sessionActuelle()
    .then(session => {
      afficherUtilisateur(
        session?.user || null
      );
    })
    .catch(error => {
      afficherUtilisateur(null);
      message(
        error.message ||
        "Impossible de vérifier la session.",
        true
      );
    });

  /* =========================
     ÉVÉNEMENTS SUPABASE
     ========================= */

  window.diawAuth.ecouterConnexion(
    (event, session) => {

      if (event === "SIGNED_IN") {
        afficherUtilisateur(
          session?.user || null
        );
      }

      if (event === "SIGNED_OUT") {
        afficherUtilisateur(null);
      }
    }
  );
});
