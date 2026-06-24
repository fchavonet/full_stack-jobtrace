function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm leading-6 text-base-content/80">
      <section>
        <h3 className="font-semibold text-base-content">
          Données traitées
        </h3>

        <p className="mt-1">
          JobTrace traite les données nécessaires au fonctionnement de votre espace candidat :
          adresse email, informations de profil, préférences, candidatures, contacts, tags,
          documents, historique des candidatures et objectifs débloqués.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Finalité du traitement
        </h3>

        <p className="mt-1">
          Ces données sont utilisées pour permettre le suivi de vos candidatures, l’organisation
          de votre recherche d’emploi, la personnalisation de votre espace et la gestion de votre
          compte utilisateur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Sécurité et accès
        </h3>

        <p className="mt-1">
          L’accès à votre compte est protégé par authentification. Les mots de passe ne sont pas
          stockés en clair. Les données de chaque utilisateur sont isolées afin qu’un utilisateur
          authentifié ne puisse accéder qu’à ses propres informations.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Vos droits
        </h3>

        <p className="mt-1">
          Vous pouvez consulter, modifier, exporter ou supprimer les données associées à votre
          compte depuis cette page. L’export permet d’obtenir une copie de vos données et la
          suppression du compte entraîne la suppression des informations associées.
        </p>
      </section>
    </div>
  );
}

export default PrivacyContent;