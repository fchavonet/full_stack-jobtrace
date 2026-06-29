function PrivacyContent() {
  return (
    <div className="flex flex-col gap-5 text-sm leading-6 text-base-content/80">
      <section>
        <h3 className="font-semibold text-base-content">
          Données personnelles traitées
        </h3>

        <p className="mt-1">
          JobTrace traite uniquement les données nécessaires au fonctionnement de votre
          espace candidat : adresse email, informations de profil, préférences de compte,
          candidatures, tags, contacts professionnels, documents importés, historique des
          candidatures et objectifs débloqués.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Finalité du traitement
        </h3>

        <p className="mt-1">
          Ces données sont utilisées afin de permettre la création et la gestion de votre
          compte, le suivi de vos candidatures, l’organisation de votre recherche d’emploi,
          la personnalisation de votre espace utilisateur, la consultation de votre
          historique d’activité et le suivi de vos objectifs.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Base du traitement
        </h3>

        <p className="mt-1">
          Le traitement des données repose sur l’utilisation volontaire du service par
          l’utilisateur. Les informations enregistrées dans JobTrace sont fournies directement
          par l’utilisateur afin de bénéficier des fonctionnalités de suivi, d’organisation et
          de gestion de ses candidatures.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Documents importés
        </h3>

        <p className="mt-1">
          Les documents ajoutés dans JobTrace, tels que les CV, lettres de motivation ou
          autres fichiers liés à vos candidatures, restent associés à votre compte. Ils sont
          utilisés uniquement pour vous permettre de centraliser les éléments utiles à votre
          suivi de candidature.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Confidentialité des données
        </h3>

        <p className="mt-1">
          Les données enregistrées dans JobTrace ne sont pas destinées à être revendues,
          échangées ou utilisées à des fins publicitaires. Elles sont utilisées uniquement dans
          le cadre du fonctionnement de l’application et des fonctionnalités proposées à
          l’utilisateur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Sécurité et accès au compte
        </h3>

        <p className="mt-1">
          L’accès à votre compte est protégé par authentification. Les mots de passe ne sont
          pas stockés en clair. Les données sont rattachées à chaque utilisateur afin qu’un
          utilisateur authentifié ne puisse accéder qu’aux informations de son propre compte.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Conservation des données
        </h3>

        <p className="mt-1">
          Les données sont conservées tant que votre compte utilisateur existe ou tant
          qu’elles sont nécessaires au fonctionnement du service. La suppression du compte
          entraîne la suppression des informations associées, sauf obligation technique ou
          légale contraire.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Exactitude des informations
        </h3>

        <p className="mt-1">
          L’utilisateur peut modifier les informations associées à son profil et à ses
          candidatures afin de les maintenir à jour. Les données saisies dans l’application
          relèvent de la responsabilité de l’utilisateur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Cookies et suivi tiers
        </h3>

        <p className="mt-1">
          Dans le cadre de cette version, JobTrace n’a pas vocation à utiliser de cookies
          publicitaires, d’outils de suivi tiers ou de dispositifs d’analyse commerciale du
          comportement utilisateur.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Vos droits
        </h3>

        <p className="mt-1">
          Vous pouvez consulter, modifier, exporter ou supprimer les données associées à
          votre compte depuis cette page. L’export permet d’obtenir une copie de vos données.
          La suppression du compte entraîne la suppression de vos informations personnelles,
          de vos candidatures, de vos contacts, de vos documents et de votre historique.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Limitation du service
        </h3>

        <p className="mt-1">
          JobTrace est un outil de suivi personnel des candidatures. Les informations
          enregistrées par l’utilisateur relèvent de sa responsabilité. Il est recommandé de
          ne pas importer de documents ou d’informations sans lien direct avec la recherche
          d’emploi ou le suivi des candidatures.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Contact
        </h3>

        <p className="mt-1">
          Pour toute réclamation ou demande supplémentaire relative aux données associées à
          votre compte, vous pouvez nous contacter par email à l’adresse suivante :
          <a className="font-medium text-primary hover:underline" href="mailto:jobtrace.app@gmail.com" >
            {" "}
            jobtrace.app@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}

export default PrivacyContent;
