import franceTravailLogo from "../assets/images/logos/job-boards/france_travail.webp";
import helloworkLogo from "../assets/images/logos/job-boards/hellowork.webp";
import indeedLogo from "../assets/images/logos/job-boards/indeed.webp";
import jobijobaLogo from "../assets/images/logos/job-boards/jobijoba.webp";
import linkedinLogo from "../assets/images/logos/job-boards/linkedin.webp";
import wttjLogo from "../assets/images/logos/job-boards/wttj.webp";

export const JOB_BOARD_LINKS = [
  {
    key: "france-travail",
    label: "France Travail",
    description: "Anciennement Pôle Emploi",
    url: "https://candidat.francetravail.fr/rechercheoffre/emploi",
    logo: franceTravailLogo,
  },
  {
    key: "hellowork",
    label: "HelloWork",
    description: "Emploi partout en France.",
    url: "https://www.hellowork.com/fr-fr/",
    logo: helloworkLogo,
  },
  {
    key: "indeed",
    label: "Indeed",
    description: "Volume d’offres élevé.",
    url: "https://fr.indeed.com/",
    logo: indeedLogo,
  },
  {
    key: "jobijoba",
    label: "Jobijoba",
    description: "Moteur multi-sites.",
    url: "https://www.jobijoba.com/fr/",
    logo: jobijobaLogo,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    description: "Réseau professionnel.",
    url: "https://fr.linkedin.com/jobs",
    logo: linkedinLogo,
  },
  {
    key: "wttj",
    label: "Welcome to the Jungle",
    description: "Culture d’entreprise.",
    url: "https://www.welcometothejungle.com/fr",
    logo: wttjLogo,
  },
];
