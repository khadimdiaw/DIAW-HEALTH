(function () {
  "use strict";

  const diagnostic = {
    actif: false,
    mouvementsRecus: 0,
    orientationsRecues: 0,
    derniereAcceleration: null,
    derniereOrientation: null,
    erreur: null
  };

  function mouvement(e) {
    const a = e.accelerationIncludingGravity;

    if (!a) return;

    const valeurs = [a.x, a.y, a.z];

    if (!valeurs.every(Number.isFinite)) return;

    diagnostic.mouvementsRecus++;

    diagnostic.derniereAcceleration = {
      x: a.x,
      y: a.y,
      z: a.z
    };
  }

  function orientation(e) {
    if (!Number.isFinite(e.beta) ||
        !Number.isFinite(e.gamma)) return;

    diagnostic.orientationsRecues++;

    diagnostic.derniereOrientation = {
      beta: e.beta,
      gamma: e.gamma
    };
  }

  async function demarrer() {
    if (!("DeviceMotionEvent" in window)) {
      diagnostic.erreur = "Capteur de mouvement indisponible.";
      return diagnostic;
    }

    try {
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const autorisation =
          await DeviceMotionEvent.requestPermission();

        if (autorisation !== "granted") {
          throw new Error("Autorisation des mouvements refusée.");
        }
      }

      window.addEventListener("devicemotion", mouvement);
      window.addEventListener("deviceorientation", orientation);

      diagnostic.actif = true;
      diagnostic.erreur = null;

    } catch (erreur) {
      diagnostic.erreur = erreur.message;
    }

    return diagnostic;
  }

  function arreter() {
    window.removeEventListener("devicemotion", mouvement);
    window.removeEventListener("deviceorientation", orientation);
    diagnostic.actif = false;
  }

  window.DIAWCapteursDiagnostic = {
    demarrer,
    arreter,
    obtenirEtat: () => ({ ...diagnostic })
  };
})();
