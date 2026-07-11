function AccountDeletionContent({ onOpenPrivacyModal }) {
  return (
    <div className="flex flex-col gap-5 text-sm leading-6 text-base-content/80">
      <section>
        <h3 className="font-semibold text-base-content">
          Suppression définitive du compte
        </h3>

        <p className="mt-1">
          La suppression du compte entraîne la fermeture de votre espace utilisateur JobTrace
          ainsi que la suppression des données associées à ce compte dans l’application.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Données concernées
        </h3>

        <p className="mt-1">
          Les données supprimées peuvent inclure vos informations de profil, vos préférences,
          vos candidatures, vos contacts, vos tags, vos documents importés, votre historique
          de candidatures et vos objectifs débloqués.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Conséquences de la suppression
        </h3>

        <p className="mt-1">
          Une fois la suppression confirmée, l’accès au compte sera fermé. Vous ne pourrez
          plus vous connecter à cet espace, consulter vos candidatures, récupérer vos documents
          depuis l’application ou accéder à votre historique.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Réutilisation du service
        </h3>

        <p className="mt-1">
          Après la suppression de votre compte, vous pourrez créer un nouveau compte si vous
          souhaitez utiliser JobTrace à nouveau. Ce nouveau compte repartira de zéro et ne
          permettra pas de restaurer les données précédemment supprimées.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Avant de supprimer votre compte
        </h3>

        <p className="mt-1">
          Avant de supprimer votre compte, il est recommandé de télécharger une copie de vos
          données depuis la section d’export. Cette copie vous permet de conserver les
          informations importantes liées à votre recherche d’emploi avant la fermeture de votre
          espace utilisateur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Documents importés
        </h3>

        <p className="mt-1">
          Les documents associés à votre compte, comme les CV, lettres de motivation ou autres
          fichiers liés à vos candidatures, peuvent également être supprimés. Il est conseillé
          de vérifier que vous disposez d’une copie locale de ces documents avant de confirmer
          la suppression.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Traitement des données
        </h3>

        <p className="mt-1">
          Pour en savoir plus sur le traitement de vos données personnelles, leur conservation,
          leur sécurité et les droits associés à votre compte, vous pouvez consulter les
          informations relatives aux données personnelles.
        </p>

        <button className="link link-primary mt-1 text-left cursor-pointer" type="button" onClick={onOpenPrivacyModal}>
          Voir les informations relatives aux données personnelles.
        </button>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Confirmation de suppression
        </h3>

        <p className="mt-1">
          Cette action est irréversible. Elle ne doit être confirmée que si vous êtes certain
          de ne plus vouloir utiliser JobTrace et de ne plus avoir besoin des données associées
          à votre compte dans l’application.
        </p>
      </section>
    </div>
  );
}

export default AccountDeletionContent;
