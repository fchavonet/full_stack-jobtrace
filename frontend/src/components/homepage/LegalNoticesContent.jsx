function LegalNoticesContent() {
  return (
    <div className="flex flex-col gap-5 text-sm leading-6 text-base-content/80">
      <section>
        <h3 className="font-semibold text-base-content">
          Éditeur du site
        </h3>

        <p className="mt-1">
          Le site <span className="font-bold">Job<span className="text-primary">Trace</span></span> est édité par <a className="font-semibold text-primary hover:underline" href="https://github.com/fchavonet" target="_blank">Fabien Chavonet</a>.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Responsable de la publication
        </h3>

        <p className="mt-1">
          Le responsable de la publication est aussi <a className="font-semibold text-primary hover:underline" href="https://github.com/fchavonet" target="_blank">Fabien Chavonet</a>.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Nature du projet
        </h3>

        <p className="mt-1">
          <span className="font-bold">Job<span className="text-primary">Trace</span></span> est un projet étudiant réalisé dans le cadre de la préparation du titre professionnel « Concepteur Développeur d’Applications », enregistré au niveau 6 du répertoire national des certifications professionnelles.
        </p>

        <p className="mt-1">
          L’application est présentée à des fins pédagogiques, de démonstration et de validation des compétences acquises au cours de la formation.
        </p>

        <p className="mt-1">
          Il demeure un projet en cours de développement. Certaines fonctionnalités, interfaces ou mesures techniques sont susceptibles d’être modifiées, complétées ou améliorées au fil de son évolution.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Contact
        </h3>

        <p className="mt-1">
          Pour toute question concernant JobTrace, vous pouvez contacter l’éditeur à l’adresse suivante :{" "}<a className="font-semibold text-primary hover:underline" href="mailto:jobtrace.app@gmail.com">jobtrace.app@gmail.com</a>.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Hébergement
        </h3>

        <p className="mt-1">
          <span className="font-bold">Job<span className="text-primary">Trace</span></span> est hébergé par OVHcloud.
        </p>

        <p className="mt-3">
          OVH SAS
          <br />
          2 rue Kellermann
          <br />
          59100 Roubaix
          <br />
          France
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Propriété intellectuelle
        </h3>

        <p className="mt-1">
          La structure générale de <span className="font-bold">Job<span className="text-primary">Trace</span></span> ainsi que les textes, interfaces, éléments graphiques, logos, composants et contenus qui lui sont propres sont protégés par les règles applicables à la propriété intellectuelle.
        </p>

        <p className="mt-1">
          Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, réalisée sans autorisation préalable est interdite, sauf dans les cas prévus par la loi.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Contenus tiers
        </h3>

        <p className="mt-1">
          Certaines illustrations utilisées par <span className="font-bold">Job<span className="text-primary">Trace</span></span> proviennent de bibliothèques tierces et restent soumises aux licences définies par leurs auteurs respectifs.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base-content">
          Limitation de responsabilité
        </h3>

        <p className="mt-1">
          <span className="font-bold">Job<span className="text-primary">Trace</span></span> est un outil d’organisation destiné à accompagner les utilisateurs dans leur recherche d’emploi, de stage ou d’alternance. Son utilisation ne garantit pas l’obtention d’un entretien, d’une réponse favorable ou d’un emploi.
        </p>

        <p className="mt-1">
          L’éditeur s’efforce de fournir un service fiable, sécurisé et accessible, sans pouvoir garantir une disponibilité permanente ni l’absence totale d’erreurs, d’interruptions ou de dysfonctionnements.
        </p>

        <p className="mt-1">
          L’application étant encore en cours de développement, certaines fonctionnalités peuvent être temporairement indisponibles, incomplètes ou modifiées sans préavis dans le cadre de leur amélioration.
        </p>

        <p className="mt-1">
          L’utilisateur reste responsable des informations, candidatures, contacts et documents qu’il enregistre dans son espace personnel, ainsi que de l’utilisation qu’il fait du service.
        </p>
      </section>
    </div>
  );
}

export default LegalNoticesContent;
