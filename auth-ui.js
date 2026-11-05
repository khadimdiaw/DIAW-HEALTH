/* DIAW HEALTH 4.1 - Interface de connexion */

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const logoutButton = document.getElementById("logoutButton");
  const authMessage = document.getElementById("authMessage");
  const userPanel = document.getElementById("userPanel");
  const userName = document.getElementById("userName");

  if (!window.diawAuth || !signupForm || !loginForm) {
    console.error("Interface d'authentification indisponible.");
    return;
  }

  function message(texte, erreur = false) {
    authMessage.textContent = texte;
    authMessage.style.color = erreur ? "#ff7777" : "var(--green)";
  }

  function afficherUtilisateur(user) {
    const connecte = Boolean(user);

    signupForm.hidden = connecte;
    loginForm.hidden = connecte;
    userPanel.hidden = !connecte;

    if (connecte) {
      userName.textContent =
        user.user_metadata?.display_name || user.email || "Utilisateur";
      message("Vous êtes connecté.");
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const bouton = signupForm.querySelector("button");
    bouton.disabled = true;

    try {
      const nom = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;

      message("Création du compte en cours...");
      const resultat = await window.diawAuth.inscription(nom, email, password);

      if (resultat.session) {
        afficherUtilisateur(resultat.user);
      } else {
        message("Compte créé. Vérifiez votre e-mail pour confirmer l'inscription.");
      }

      signupForm.reset();
    } catch (error) {
      message(error.message || "Erreur lors de l'inscription.", true);
    } finally {
      bouton.disabled = false;
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const bouton = loginForm.querySelector("button");
    bouton.disabled = true;

    try {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      message("Connexion en cours...");
      const resultat = await window.diawAuth.connexion(email, password);
      afficherUtilisateur(resultat.user);
      loginForm.reset();
    } catch (error) {
      message(error.message || "Erreur de connexion.", true);
    } finally {
      bouton.disabled = false;
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await window.diawAuth.deconnexion();
      afficherUtilisateur(null);
      message("Vous êtes déconnecté.");
    } catch (error) {
      message(error.message || "Erreur de déconnexion.", true);
    }
  });

  window.diawAuth.sessionActuelle()
    .then(session => afficherUtilisateur(session?.user || null))
    .catch(error => message(error.message, true));

  window.diawAuth.ecouterConnexion((event, session) => {
    if (event === "SIGNED_IN") afficherUtilisateur(session?.user || null);
    if (event === "SIGNED_OUT") afficherUtilisateur(null);
  });
});
