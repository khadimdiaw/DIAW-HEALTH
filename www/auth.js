// DIAW FITNESS 4.1 - Authentification Supabase

(function () {
  const config = window.DIAW_HEALTH_SUPABASE;

  if (!config || !window.supabase) {
    console.error("DIAW FITNESS : configuration Supabase introuvable.");
    return;
  }

  const client = window.supabase.createClient(
    config.url,
    config.publishableKey
  );

  window.diawAuth = {
    client,

    async inscription(nom, email, motDePasse) {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: motDePasse,
        options: {
          data: { display_name: nom.trim() }
        }
      });

      if (error) throw error;
      return data;
    },

    async connexion(email, motDePasse) {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: motDePasse
      });

      if (error) throw error;
      return data;
    },

    async deconnexion() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },

    async utilisateurActuel() {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user;
    },

    async sessionActuelle() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    ecouterConnexion(callback) {
      return client.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    }
  };

  console.log("DIAW FITNESS : authentification Supabase initialisée.");
})();
