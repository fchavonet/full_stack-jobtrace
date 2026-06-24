function AccountDeletionContent() {
  return (
    <div className="space-y-5 text-sm leading-6 text-base-content/80">
      <section>
        <h3 className="font-semibold text-base-content">
          Action définitive
        </h3>

        <p className="mt-1">
          La suppression du compte entraîne la suppression de votre compte utilisateur et des
          données associées dans l’application.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Données concernées
        </h3>

        <p className="mt-1">
          Les informations de profil, les candidatures, les contacts, les tags, les documents,
          l’historique et les objectifs associés au compte peuvent être supprimés.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Avant de supprimer
        </h3>

        <p className="mt-1">
          Avant de supprimer votre compte, vous pouvez télécharger une copie de vos données depuis
          la section d’export. Une fois la suppression confirmée, l’accès au compte sera fermé.
        </p>
      </section>

      <div className="alert alert-error mt-4">
        <span>
          Cette action est irréversible. Ne supprimez votre compte que si vous êtes certain de ne
          plus vouloir utiliser JobTrace.
        </span>
      </div>
    </div>
  );
}

export default AccountDeletionContent;