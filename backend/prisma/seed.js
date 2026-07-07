import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const DEFAULT_SEED_EMAIL = "jobtrace.app@gmail.com";
const DEFAULT_SEED_PASSWORD = "Password1";
const DEFAULT_SEED_REFERENCE_DATE = "2026-07-07";
const DEFAULT_AVATAR_URL = "https://avatars.githubusercontent.com/u/135313957?v=4";
const FOLLOW_UP_DELAY_DAYS = 15;
const UPLOAD_DIRECTORY = path.join(process.cwd(), "uploads", "documents");

const achievementSeeds = [
  {
    name: "Première candidature enregistrée",
    slug: "first-application",
    description: "Enregistrer votre première candidature dans JobTrace.",
    icon: "briefcase"
  },
  {
    name: "Première relance enregistrée",
    slug: "first-follow-up",
    description: "Ajouter une première date de relance à une candidature.",
    icon: "bell"
  },
  {
    name: "Premier tag ajouté",
    slug: "first-tag",
    description: "Créer votre premier tag d’organisation.",
    icon: "tag"
  },
  {
    name: "Premier contact ajouté",
    slug: "first-contact",
    description: "Ajouter votre premier contact professionnel.",
    icon: "user"
  },
  {
    name: "Premier document ajouté",
    slug: "first-document",
    description: "Importer votre premier document de candidature.",
    icon: "file"
  },
  {
    name: "Premier entretien décroché",
    slug: "first-interview",
    description: "Enregistrer votre premier entretien dans une candidature.",
    icon: "calendar-check"
  },
  {
    name: "Premier objectif journalier réussi",
    slug: "first-daily-goal",
    description: "Atteindre votre objectif quotidien de candidatures pour la première fois.",
    icon: "goal"
  },
  {
    name: "Premier objectif mensuel réussi",
    slug: "first-monthly-goal",
    description: "Enregistrer au moins 30 candidatures sur les 30 derniers jours.",
    icon: "calendar"
  },
  {
    name: "10 candidatures enregistrées",
    slug: "ten-applications",
    description: "Enregistrer au moins 10 candidatures dans JobTrace.",
    icon: "target"
  },
  {
    name: "50 candidatures enregistrées",
    slug: "fifty-applications",
    description: "Enregistrer au moins 50 candidatures dans JobTrace.",
    icon: "trophy"
  }
];

const tagSeeds = [
  { name: "Priorité", slug: "priorite", color: "#DC2626" },
  { name: "Relance", slug: "relance", color: "#F59E0B" },
  { name: "Entretien", slug: "entretien", color: "#16A34A" },
  { name: "Frontend", slug: "frontend", color: "#2563EB" },
  { name: "Backend", slug: "backend", color: "#7C3AED" },
  { name: "Full Stack", slug: "full-stack", color: "#0891B2" },
  { name: "JavaScript", slug: "javascript", color: "#CA8A04" },
  { name: "React", slug: "react", color: "#0284C7" },
  { name: "Node.js", slug: "node-js", color: "#15803D" },
  { name: "Design", slug: "design", color: "#DB2777" },
  { name: "Gaming", slug: "gaming", color: "#9333EA" },
  { name: "Cloud", slug: "cloud", color: "#0F766E" },
  { name: "IA", slug: "ia", color: "#4F46E5" },
  { name: "Produit", slug: "produit", color: "#EA580C" },
  { name: "Remote", slug: "remote", color: "#64748B" },
  { name: "France", slug: "france", color: "#1D4ED8" },
  { name: "International", slug: "international", color: "#0E7490" },
  { name: "Coup de cœur", slug: "coup-de-coeur", color: "#E11D48" }
];

const documentSeeds = [
  { type: "resume", originalName: "cv-fabien-chavonet-full-stack.pdf" },
  { type: "resume", originalName: "cv-fabien-chavonet-frontend.pdf" },
  { type: "resume", originalName: "cv-fabien-chavonet-creative-developer.pdf" },
  { type: "resume", originalName: "cv-fabien-chavonet-backend-node.pdf" },
  { type: "cover_letter", originalName: "lettre-motivation-big-tech.pdf" },
  { type: "cover_letter", originalName: "lettre-motivation-gaming.pdf" },
  { type: "cover_letter", originalName: "lettre-motivation-startup-produit.pdf" },
  { type: "cover_letter", originalName: "lettre-motivation-edtech.pdf" },
  { type: "portfolio", originalName: "portfolio-web-design-developpement.pdf" },
  { type: "portfolio", originalName: "portfolio-react-javascript.pdf" },
  { type: "portfolio", originalName: "portfolio-ui-ux.pdf" },
  { type: "other", originalName: "recommandations-professionnelles.pdf" },
  { type: "other", originalName: "certifications-holberton.pdf" },
  { type: "other", originalName: "dossier-projets-full-stack.pdf" },
  { type: "other", originalName: "fiche-projet-jobtrace.pdf" },
  { type: "other", originalName: "presentation-reconversion-developpeur.pdf" }
];

const companyProfiles = [
  {
    name: "Apple",
    locations: ["Paris", "Lyon", "Cupertino", "London"],
    careersUrl: "https://www.apple.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/apple/",
    tags: ["frontend", "design", "international", "coup-de-coeur"],
    salaryBase: 52000,
    contacts: [
      { firstName: "Tim", lastName: "Cook", position: "Chief Executive Officer" },
      { firstName: "Craig", lastName: "Federighi", position: "Senior Vice President Software Engineering" },
      { firstName: "Apple", lastName: "Careers", position: "Talent Acquisition Team" }
    ]
  },
  {
    name: "Google",
    locations: ["Paris", "Remote Europe", "Dublin", "Mountain View"],
    careersUrl: "https://www.google.com/about/careers/applications/jobs/results/",
    linkedinUrl: "https://www.linkedin.com/company/google/",
    tags: ["cloud", "ia", "backend", "international"],
    salaryBase: 58000,
    contacts: [
      { firstName: "Sundar", lastName: "Pichai", position: "Chief Executive Officer" },
      { firstName: "Urs", lastName: "Hölzle", position: "Senior Vice President Technical Infrastructure" },
      { firstName: "Google", lastName: "Careers", position: "Engineering Recruiting Team" }
    ]
  },
  {
    name: "Microsoft",
    locations: ["Issy-les-Moulineaux", "Paris", "Remote Europe", "Redmond"],
    careersUrl: "https://careers.microsoft.com/",
    linkedinUrl: "https://www.linkedin.com/company/microsoft/",
    tags: ["cloud", "full-stack", "international"],
    salaryBase: 56000,
    contacts: [
      { firstName: "Satya", lastName: "Nadella", position: "Chief Executive Officer" },
      { firstName: "Scott", lastName: "Guthrie", position: "Executive Vice President Cloud and AI" },
      { firstName: "Microsoft", lastName: "Careers", position: "Engineering Recruiting Team" }
    ]
  },
  {
    name: "Amazon",
    locations: ["Paris", "Clichy", "Luxembourg", "Remote Europe"],
    careersUrl: "https://www.amazon.jobs/",
    linkedinUrl: "https://www.linkedin.com/company/amazon/",
    tags: ["backend", "cloud", "international"],
    salaryBase: 54000,
    contacts: [
      { firstName: "Andy", lastName: "Jassy", position: "Chief Executive Officer" },
      { firstName: "Werner", lastName: "Vogels", position: "Chief Technology Officer" },
      { firstName: "Amazon", lastName: "Jobs", position: "Recruiting Team" }
    ]
  },
  {
    name: "Meta",
    locations: ["Paris", "London", "Remote Europe", "Menlo Park"],
    careersUrl: "https://www.metacareers.com/",
    linkedinUrl: "https://www.linkedin.com/company/meta/",
    tags: ["frontend", "react", "ia", "international"],
    salaryBase: 57000,
    contacts: [
      { firstName: "Mark", lastName: "Zuckerberg", position: "Chief Executive Officer" },
      { firstName: "Andrew", lastName: "Bosworth", position: "Chief Technology Officer" },
      { firstName: "Meta", lastName: "Careers", position: "Software Engineering Recruiting Team" }
    ]
  },
  {
    name: "Tesla",
    locations: ["Paris", "Lyon", "Berlin", "Remote Europe"],
    careersUrl: "https://www.tesla.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/tesla-motors/",
    tags: ["full-stack", "produit", "international", "coup-de-coeur"],
    salaryBase: 50000,
    contacts: [
      { firstName: "Elon", lastName: "Musk", position: "Chief Executive Officer" },
      { firstName: "Tesla", lastName: "Recruiting", position: "Recruiting Operations Team" },
      { firstName: "Tesla", lastName: "Engineering", position: "Software Engineering Team" }
    ]
  },
  {
    name: "Holberton School",
    locations: ["Dijon", "Toulouse", "Paris", "Remote France"],
    careersUrl: "https://www.holbertonschool.com/",
    linkedinUrl: "https://www.linkedin.com/school/holberton-school/",
    tags: ["full-stack", "produit", "france", "coup-de-coeur"],
    salaryBase: 42000,
    contacts: [
      { firstName: "Julien", lastName: "Barbier", position: "Co-founder" },
      { firstName: "Holberton", lastName: "People", position: "People and Pedagogy Team" },
      { firstName: "Holberton", lastName: "Campus", position: "Campus Operations Team" }
    ]
  },
  {
    name: "Ankama",
    locations: ["Roubaix", "Lille", "Remote France"],
    careersUrl: "https://www.ankama.com/fr/recrutement",
    linkedinUrl: "https://www.linkedin.com/company/ankama/",
    tags: ["gaming", "design", "frontend", "coup-de-coeur"],
    salaryBase: 39000,
    contacts: [
      { firstName: "Anthony", lastName: "Roux", position: "Co-founder and Creative Director" },
      { firstName: "Ankama", lastName: "Recrutement", position: "Équipe Recrutement" },
      { firstName: "Ankama", lastName: "Games", position: "Game Production Team" }
    ]
  },
  {
    name: "Ubisoft",
    locations: ["Paris", "Montreuil", "Annecy", "Montpellier", "Bordeaux"],
    careersUrl: "https://www.ubisoft.com/company/careers",
    linkedinUrl: "https://www.linkedin.com/company/ubisoft/",
    tags: ["gaming", "javascript", "international", "coup-de-coeur"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Yves", lastName: "Guillemot", position: "Chief Executive Officer" },
      { firstName: "Ubisoft", lastName: "Talent", position: "Talent Acquisition Games Team" },
      { firstName: "Ubisoft", lastName: "Tech", position: "Online Services Engineering Team" }
    ]
  },
  {
    name: "Sony Interactive Entertainment",
    locations: ["Paris", "London", "Tokyo", "Remote Europe"],
    careersUrl: "https://careers.playstation.com/",
    linkedinUrl: "https://www.linkedin.com/company/sony-interactive-entertainment-llc/",
    tags: ["gaming", "frontend", "international", "coup-de-coeur"],
    salaryBase: 47000,
    contacts: [
      { firstName: "Hermen", lastName: "Hulst", position: "Studio Business Group Chief Executive Officer" },
      { firstName: "Hideaki", lastName: "Nishino", position: "Platform Business Group Chief Executive Officer" },
      { firstName: "PlayStation", lastName: "Careers", position: "Talent Acquisition Team" }
    ]
  },
  {
    name: "Nintendo",
    locations: ["Paris", "Frankfurt", "Kyoto", "Remote Europe"],
    careersUrl: "https://www.nintendo.com/us/careers/",
    linkedinUrl: "https://www.linkedin.com/company/nintendo/",
    tags: ["gaming", "design", "international", "coup-de-coeur"],
    salaryBase: 45000,
    contacts: [
      { firstName: "Shuntaro", lastName: "Furukawa", position: "President" },
      { firstName: "Shigeru", lastName: "Miyamoto", position: "Representative Director and Fellow" },
      { firstName: "Nintendo", lastName: "Careers", position: "Recruiting Team" }
    ]
  },
  {
    name: "Adobe",
    locations: ["Paris", "Remote Europe", "San José"],
    careersUrl: "https://careers.adobe.com/",
    linkedinUrl: "https://www.linkedin.com/company/adobe/",
    tags: ["frontend", "design", "produit", "international"],
    salaryBase: 53000,
    contacts: [
      { firstName: "Shantanu", lastName: "Narayen", position: "Chief Executive Officer" },
      { firstName: "Adobe", lastName: "Talent", position: "Design and Engineering Recruiting Team" },
      { firstName: "Adobe", lastName: "Experience", position: "Product Engineering Team" }
    ]
  },
  {
    name: "Figma",
    locations: ["Remote Europe", "London", "Paris", "San Francisco"],
    careersUrl: "https://www.figma.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/figma/",
    tags: ["frontend", "design", "remote", "produit"],
    salaryBase: 56000,
    contacts: [
      { firstName: "Dylan", lastName: "Field", position: "Chief Executive Officer" },
      { firstName: "Figma", lastName: "Careers", position: "Product Engineering Recruiting Team" },
      { firstName: "Figma", lastName: "Design", position: "Design Systems Team" }
    ]
  },
  {
    name: "GitHub",
    locations: ["Remote Europe", "Paris", "Amsterdam"],
    careersUrl: "https://github.com/about/careers",
    linkedinUrl: "https://www.linkedin.com/company/github/",
    tags: ["backend", "cloud", "remote", "international"],
    salaryBase: 57000,
    contacts: [
      { firstName: "Thomas", lastName: "Dohmke", position: "Chief Executive Officer" },
      { firstName: "GitHub", lastName: "Talent", position: "Developer Platform Recruiting Team" },
      { firstName: "GitHub", lastName: "Copilot", position: "Developer Experience Team" }
    ]
  },
  {
    name: "GitLab",
    locations: ["Remote Europe", "Remote France", "Remote Worldwide"],
    careersUrl: "https://about.gitlab.com/jobs/",
    linkedinUrl: "https://www.linkedin.com/company/gitlab-com/",
    tags: ["full-stack", "remote", "cloud", "international"],
    salaryBase: 55000,
    contacts: [
      { firstName: "Sid", lastName: "Sijbrandij", position: "Co-founder" },
      { firstName: "GitLab", lastName: "Recruiting", position: "Remote Talent Acquisition Team" },
      { firstName: "GitLab", lastName: "Platform", position: "DevSecOps Platform Team" }
    ]
  },
  {
    name: "Docker",
    locations: ["Remote Europe", "Paris", "Berlin"],
    careersUrl: "https://www.docker.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/docker/",
    tags: ["backend", "cloud", "remote"],
    salaryBase: 54000,
    contacts: [
      { firstName: "Scott", lastName: "Johnston", position: "Chief Executive Officer" },
      { firstName: "Docker", lastName: "Talent", position: "Engineering Recruiting Team" },
      { firstName: "Docker", lastName: "Product", position: "Developer Tools Team" }
    ]
  },
  {
    name: "Vercel",
    locations: ["Remote Europe", "Paris", "London"],
    careersUrl: "https://vercel.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/vercel/",
    tags: ["frontend", "react", "remote", "international"],
    salaryBase: 57000,
    contacts: [
      { firstName: "Guillermo", lastName: "Rauch", position: "Chief Executive Officer" },
      { firstName: "Vercel", lastName: "Careers", position: "Frontend Platform Recruiting Team" },
      { firstName: "Vercel", lastName: "DX", position: "Developer Experience Team" }
    ]
  },
  {
    name: "Netlify",
    locations: ["Remote Europe", "Paris", "San Francisco"],
    careersUrl: "https://www.netlify.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/netlify/",
    tags: ["frontend", "javascript", "remote", "cloud"],
    salaryBase: 52000,
    contacts: [
      { firstName: "Matt", lastName: "Biilmann", position: "Chief Executive Officer" },
      { firstName: "Netlify", lastName: "Talent", position: "Developer Platform Recruiting Team" },
      { firstName: "Netlify", lastName: "Frontend", position: "Web Platform Team" }
    ]
  },
  {
    name: "Stripe",
    locations: ["Paris", "Dublin", "London", "Remote Europe"],
    careersUrl: "https://stripe.com/jobs",
    linkedinUrl: "https://www.linkedin.com/company/stripe/",
    tags: ["backend", "full-stack", "international"],
    salaryBase: 59000,
    contacts: [
      { firstName: "Patrick", lastName: "Collison", position: "Chief Executive Officer" },
      { firstName: "Stripe", lastName: "Recruiting", position: "Engineering Recruiting Team" },
      { firstName: "Stripe", lastName: "Payments", position: "Payments Platform Team" }
    ]
  },
  {
    name: "Datadog",
    locations: ["Paris", "Remote France", "New York"],
    careersUrl: "https://www.datadoghq.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/datadog/",
    tags: ["backend", "cloud", "france"],
    salaryBase: 54000,
    contacts: [
      { firstName: "Olivier", lastName: "Pomel", position: "Chief Executive Officer" },
      { firstName: "Datadog", lastName: "Recruiting", position: "Technical Recruiting Team" },
      { firstName: "Datadog", lastName: "Platform", position: "Observability Platform Team" }
    ]
  },
  {
    name: "Doctolib",
    locations: ["Paris", "Nantes", "Niort", "Remote France"],
    careersUrl: "https://careers.doctolib.com/",
    linkedinUrl: "https://www.linkedin.com/company/doctolib/",
    tags: ["full-stack", "produit", "france"],
    salaryBase: 47000,
    contacts: [
      { firstName: "Stanislas", lastName: "Niox-Chateau", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Doctolib", lastName: "Talent", position: "Product and Engineering Recruiting Team" },
      { firstName: "Doctolib", lastName: "Product", position: "Health Product Team" }
    ]
  },
  {
    name: "Alan",
    locations: ["Paris", "Remote Europe", "Brussels"],
    careersUrl: "https://alan.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/alan/",
    tags: ["produit", "frontend", "remote", "france"],
    salaryBase: 50000,
    contacts: [
      { firstName: "Jean-Charles", lastName: "Samuelian-Werve", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Alan", lastName: "Talent", position: "Product and Engineering Hiring Team" },
      { firstName: "Alan", lastName: "Product", position: "Member Experience Team" }
    ]
  },
  {
    name: "Back Market",
    locations: ["Paris", "Bordeaux", "Remote France"],
    careersUrl: "https://jobs.backmarket.com/",
    linkedinUrl: "https://www.linkedin.com/company/back-market/",
    tags: ["full-stack", "produit", "france"],
    salaryBase: 46000,
    contacts: [
      { firstName: "Thibaud", lastName: "Hug de Larauze", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Back", lastName: "Market", position: "Talent Acquisition Team" },
      { firstName: "Back", lastName: "Office", position: "Marketplace Platform Team" }
    ]
  },
  {
    name: "BlaBlaCar",
    locations: ["Paris", "Remote France", "Madrid"],
    careersUrl: "https://blog.blablacar.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/blablacar/",
    tags: ["produit", "frontend", "france"],
    salaryBase: 46000,
    contacts: [
      { firstName: "Frédéric", lastName: "Mazzella", position: "Founder" },
      { firstName: "BlaBlaCar", lastName: "Talent", position: "Engineering Recruiting Team" },
      { firstName: "BlaBlaCar", lastName: "Product", position: "Mobility Product Team" }
    ]
  },
  {
    name: "Mistral AI",
    locations: ["Paris", "Remote Europe"],
    careersUrl: "https://mistral.ai/careers/",
    linkedinUrl: "https://www.linkedin.com/company/mistralai/",
    tags: ["ia", "backend", "france", "coup-de-coeur"],
    salaryBase: 56000,
    contacts: [
      { firstName: "Arthur", lastName: "Mensch", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Mistral", lastName: "Talent", position: "Technical Recruiting Team" },
      { firstName: "Mistral", lastName: "Platform", position: "AI Platform Team" }
    ]
  },
  {
    name: "Hugging Face",
    locations: ["Paris", "Remote Europe", "New York"],
    careersUrl: "https://huggingface.co/jobs",
    linkedinUrl: "https://www.linkedin.com/company/huggingface/",
    tags: ["ia", "remote", "produit", "france"],
    salaryBase: 55000,
    contacts: [
      { firstName: "Clément", lastName: "Delangue", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Hugging", lastName: "Face", position: "Open Source and ML Platform Team" },
      { firstName: "HuggingFace", lastName: "Careers", position: "Recruiting Team" }
    ]
  },
  {
    name: "Ledger",
    locations: ["Paris", "Vierzon", "Remote France"],
    careersUrl: "https://www.ledger.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/ledgerhq/",
    tags: ["backend", "produit", "france"],
    salaryBase: 48000,
    contacts: [
      { firstName: "Pascal", lastName: "Gauthier", position: "Chief Executive Officer" },
      { firstName: "Ledger", lastName: "Talent", position: "Engineering Recruiting Team" },
      { firstName: "Ledger", lastName: "Security", position: "Security Platform Team" }
    ]
  },
  {
    name: "Shadow",
    locations: ["Paris", "Remote France", "Lyon"],
    careersUrl: "https://shadow.tech/careers",
    linkedinUrl: "https://www.linkedin.com/company/shadow/",
    tags: ["gaming", "cloud", "france"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Shadow", lastName: "Talent", position: "Cloud Gaming Recruiting Team" },
      { firstName: "Shadow", lastName: "Platform", position: "Streaming Platform Team" },
      { firstName: "Shadow", lastName: "Product", position: "Product Team" }
    ]
  },
  {
    name: "Qonto",
    locations: ["Paris", "Remote Europe", "Barcelona"],
    careersUrl: "https://qonto.com/en/careers",
    linkedinUrl: "https://www.linkedin.com/company/qonto/",
    tags: ["full-stack", "produit", "remote", "france"],
    salaryBase: 48000,
    contacts: [
      { firstName: "Alexandre", lastName: "Prot", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Qonto", lastName: "Talent", position: "Product and Engineering Recruiting Team" },
      { firstName: "Qonto", lastName: "Platform", position: "Business Banking Platform Team" }
    ]
  },
  {
    name: "Swile",
    locations: ["Montpellier", "Paris", "Remote France"],
    careersUrl: "https://www.swile.co/en-en/careers",
    linkedinUrl: "https://www.linkedin.com/company/swile/",
    tags: ["frontend", "produit", "france"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Loïc", lastName: "Soubeyrand", position: "Founder and Chief Executive Officer" },
      { firstName: "Swile", lastName: "Talent", position: "Tech Recruiting Team" },
      { firstName: "Swile", lastName: "Product", position: "Employee Experience Product Team" }
    ]
  },
  {
    name: "PayFit",
    locations: ["Paris", "Remote France", "Barcelona"],
    careersUrl: "https://payfit.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/payfit/",
    tags: ["full-stack", "produit", "france"],
    salaryBase: 45000,
    contacts: [
      { firstName: "Firmin", lastName: "Zocchetto", position: "Co-founder and Chief Executive Officer" },
      { firstName: "PayFit", lastName: "Talent", position: "Engineering Recruiting Team" },
      { firstName: "PayFit", lastName: "Payroll", position: "Payroll Product Team" }
    ]
  },
  {
    name: "Theodo",
    locations: ["Paris", "Lyon", "Nantes", "Remote France"],
    careersUrl: "https://www.theodo.fr/careers",
    linkedinUrl: "https://www.linkedin.com/company/theodo/",
    tags: ["full-stack", "javascript", "france"],
    salaryBase: 41000,
    contacts: [
      { firstName: "Fabrice", lastName: "Bernhard", position: "Co-founder" },
      { firstName: "Theodo", lastName: "Talent", position: "Software Engineering Recruiting Team" },
      { firstName: "Theodo", lastName: "Tech", position: "Agile Software Team" }
    ]
  },
  {
    name: "Zenika",
    locations: ["Paris", "Lyon", "Nantes", "Rennes", "Bordeaux", "Lille"],
    careersUrl: "https://www.zenika.com/carrieres",
    linkedinUrl: "https://www.linkedin.com/company/zenika/",
    tags: ["javascript", "cloud", "france"],
    salaryBase: 40000,
    contacts: [
      { firstName: "Zenika", lastName: "Recrutement", position: "Équipe Recrutement Tech" },
      { firstName: "Zenika", lastName: "Frontend", position: "Frontend Craft Team" },
      { firstName: "Zenika", lastName: "Cloud", position: "Cloud Engineering Team" }
    ]
  },
  {
    name: "Sopra Steria",
    locations: ["Paris", "Lyon", "Toulouse", "Nantes", "Aix-en-Provence"],
    careersUrl: "https://www.soprasteria.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/soprasteria/",
    tags: ["backend", "cloud", "france"],
    salaryBase: 38000,
    contacts: [
      { firstName: "Sopra", lastName: "Steria", position: "Équipe Recrutement IT" },
      { firstName: "Sopra", lastName: "Digital", position: "Digital Factory Team" },
      { firstName: "Sopra", lastName: "Cloud", position: "Cloud Services Team" }
    ]
  },
  {
    name: "Capgemini",
    locations: ["Paris", "Lyon", "Toulouse", "Grenoble", "Nantes"],
    careersUrl: "https://www.capgemini.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/capgemini/",
    tags: ["full-stack", "cloud", "france"],
    salaryBase: 39000,
    contacts: [
      { firstName: "Aiman", lastName: "Ezzat", position: "Chief Executive Officer" },
      { firstName: "Capgemini", lastName: "Careers", position: "Talent Acquisition Team" },
      { firstName: "Capgemini", lastName: "Engineering", position: "Software Engineering Team" }
    ]
  },
  {
    name: "Thales Digital Factory",
    locations: ["Paris", "Vélizy-Villacoublay", "Toulouse", "Bordeaux"],
    careersUrl: "https://www.thalesgroup.com/en/careers",
    linkedinUrl: "https://www.linkedin.com/company/thales/",
    tags: ["backend", "cloud", "france"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Patrice", lastName: "Caine", position: "Chief Executive Officer" },
      { firstName: "Thales", lastName: "Careers", position: "Digital Engineering Recruiting Team" },
      { firstName: "Thales", lastName: "Factory", position: "Digital Factory Team" }
    ]
  },
  {
    name: "Dassault Systèmes",
    locations: ["Vélizy-Villacoublay", "Paris", "Lyon"],
    careersUrl: "https://www.3ds.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/dassaultsystemes/",
    tags: ["frontend", "design", "france"],
    salaryBase: 44000,
    contacts: [
      { firstName: "Pascal", lastName: "Daloz", position: "Chief Executive Officer" },
      { firstName: "Dassault", lastName: "Careers", position: "Software Recruiting Team" },
      { firstName: "Dassault", lastName: "Design", position: "3D Experience Platform Team" }
    ]
  },
  {
    name: "Criteo",
    locations: ["Paris", "Remote France", "Barcelona"],
    careersUrl: "https://www.criteo.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/criteo/",
    tags: ["backend", "ia", "france"],
    salaryBase: 49000,
    contacts: [
      { firstName: "Megan", lastName: "Clarken", position: "Chief Executive Officer" },
      { firstName: "Criteo", lastName: "Talent", position: "Engineering Recruiting Team" },
      { firstName: "Criteo", lastName: "AI", position: "AdTech Platform Team" }
    ]
  },
  {
    name: "Deezer",
    locations: ["Paris", "Remote France", "Bordeaux"],
    careersUrl: "https://www.deezerjobs.com/",
    linkedinUrl: "https://www.linkedin.com/company/deezer/",
    tags: ["frontend", "produit", "france"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Jeronimo", lastName: "Folgueira", position: "Chief Executive Officer" },
      { firstName: "Deezer", lastName: "Talent", position: "Product and Engineering Recruiting Team" },
      { firstName: "Deezer", lastName: "Product", position: "Music Product Team" }
    ]
  },
  {
    name: "Spotify",
    locations: ["Paris", "Stockholm", "London", "Remote Europe"],
    careersUrl: "https://www.lifeatspotify.com/jobs",
    linkedinUrl: "https://www.linkedin.com/company/spotify/",
    tags: ["frontend", "produit", "international"],
    salaryBase: 52000,
    contacts: [
      { firstName: "Daniel", lastName: "Ek", position: "Founder and Chief Executive Officer" },
      { firstName: "Spotify", lastName: "Talent", position: "Engineering Recruiting Team" },
      { firstName: "Spotify", lastName: "Design", position: "Consumer Experience Team" }
    ]
  },
  {
    name: "OpenAI",
    locations: ["Remote Europe", "Paris", "San Francisco"],
    careersUrl: "https://openai.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/openai/",
    tags: ["ia", "backend", "international", "coup-de-coeur"],
    salaryBase: 62000,
    contacts: [
      { firstName: "Sam", lastName: "Altman", position: "Chief Executive Officer" },
      { firstName: "OpenAI", lastName: "Recruiting", position: "Technical Recruiting Team" },
      { firstName: "OpenAI", lastName: "Platform", position: "API Platform Team" }
    ]
  },
  {
    name: "OVHcloud",
    locations: ["Roubaix", "Paris", "Lyon", "Remote France"],
    careersUrl: "https://corporate.ovhcloud.com/en/careers/",
    linkedinUrl: "https://www.linkedin.com/company/ovhcloud/",
    tags: ["cloud", "backend", "france"],
    salaryBase: 42000,
    contacts: [
      { firstName: "Michel", lastName: "Paulin", position: "Chief Executive Officer" },
      { firstName: "OVHcloud", lastName: "Talent", position: "Cloud Recruiting Team" },
      { firstName: "OVHcloud", lastName: "Platform", position: "Cloud Platform Team" }
    ]
  },
  {
    name: "Scaleway",
    locations: ["Paris", "Lille", "Remote France"],
    careersUrl: "https://www.scaleway.com/en/careers/",
    linkedinUrl: "https://www.linkedin.com/company/scaleway/",
    tags: ["cloud", "backend", "france"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Scaleway", lastName: "Talent", position: "Cloud Platform Recruiting Team" },
      { firstName: "Scaleway", lastName: "Compute", position: "Compute Platform Team" },
      { firstName: "Scaleway", lastName: "Product", position: "Cloud Product Team" }
    ]
  },
  {
    name: "Clever Cloud",
    locations: ["Nantes", "Paris", "Remote France"],
    careersUrl: "https://www.clever-cloud.com/careers/",
    linkedinUrl: "https://www.linkedin.com/company/clever-cloud/",
    tags: ["cloud", "backend", "remote", "france"],
    salaryBase: 41000,
    contacts: [
      { firstName: "Quentin", lastName: "Adam", position: "Chief Executive Officer" },
      { firstName: "Clever", lastName: "Cloud", position: "Recruiting Team" },
      { firstName: "Clever", lastName: "Platform", position: "PaaS Engineering Team" }
    ]
  },
  {
    name: "Malt",
    locations: ["Paris", "Remote Europe", "Lyon"],
    careersUrl: "https://www.malt.com/careers",
    linkedinUrl: "https://www.linkedin.com/company/maltcommunity/",
    tags: ["produit", "frontend", "remote", "france"],
    salaryBase: 45000,
    contacts: [
      { firstName: "Vincent", lastName: "Huguet", position: "Co-founder and Chief Executive Officer" },
      { firstName: "Malt", lastName: "Talent", position: "Product and Engineering Recruiting Team" },
      { firstName: "Malt", lastName: "Marketplace", position: "Marketplace Product Team" }
    ]
  },
  {
    name: "Welcome to the Jungle",
    locations: ["Paris", "Remote France", "Prague"],
    careersUrl: "https://www.welcometothejungle.com/fr/companies/wttj/jobs",
    linkedinUrl: "https://www.linkedin.com/company/welcome-to-the-jungle-france/",
    tags: ["produit", "design", "frontend", "france"],
    salaryBase: 43000,
    contacts: [
      { firstName: "Jérémy", lastName: "Clédat", position: "Co-founder and Chief Executive Officer" },
      { firstName: "WTTJ", lastName: "Talent", position: "Product and Engineering Team" },
      { firstName: "Welcome", lastName: "Product", position: "Candidate Experience Team" }
    ]
  }
];

const positionSeeds = [
  "Développeur Full Stack JavaScript",
  "Développeur Frontend React",
  "Développeur Backend Node.js",
  "Software Engineer Frontend",
  "Software Engineer Full Stack",
  "Creative Developer",
  "Développeur Web UI",
  "Frontend Engineer Design Systems",
  "Junior Software Engineer",
  "Web Developer",
  "Product Engineer",
  "Developer Experience Engineer"
];

const contractTypes = [
  "permanent",
  "permanent",
  "permanent",
  "fixed_term",
  "apprenticeship",
  "freelance",
  "internship",
  "other"
];

const applicationSchedule = [
  { date: "2026-04-07", count: 2 },
  { date: "2026-04-09", count: 3 },
  { date: "2026-04-13", count: 4 },
  { date: "2026-04-15", count: 1 },
  { date: "2026-04-17", count: 5 },
  { date: "2026-04-21", count: 2 },
  { date: "2026-04-23", count: 3 },
  { date: "2026-04-27", count: 2 },
  { date: "2026-04-29", count: 4 },
  { date: "2026-05-01", count: 3 },
  { date: "2026-05-05", count: 1 },
  { date: "2026-05-07", count: 5 },
  { date: "2026-05-11", count: 2 },
  { date: "2026-05-13", count: 3 },
  { date: "2026-05-15", count: 4 },
  { date: "2026-05-19", count: 2 },
  { date: "2026-05-21", count: 3 },
  { date: "2026-05-25", count: 1 },
  { date: "2026-05-27", count: 5 },
  { date: "2026-05-29", count: 2 },
  { date: "2026-06-02", count: 4 },
  { date: "2026-06-04", count: 3 },
  { date: "2026-06-08", count: 2 },
  { date: "2026-06-10", count: 1 },
  { date: "2026-06-12", count: 5 },
  { date: "2026-06-16", count: 3 },
  { date: "2026-06-18", count: 2 },
  { date: "2026-06-22", count: 4 },
  { date: "2026-06-24", count: 3 },
  { date: "2026-06-26", count: 1 },
  { date: "2026-06-30", count: 5 },
  { date: "2026-07-02", count: 4 },
  { date: "2026-07-06", count: 4 },
  { date: "2026-07-07", count: 2 }
];

function getSeedEmail() {
  if (process.env.SEED_USER_EMAIL) {
    return process.env.SEED_USER_EMAIL;
  }

  return DEFAULT_SEED_EMAIL;
}

function getSeedPassword() {
  if (process.env.SEED_USER_PASSWORD) {
    return process.env.SEED_USER_PASSWORD;
  }

  return DEFAULT_SEED_PASSWORD;
}

function getReferenceDate() {
  if (process.env.SEED_REFERENCE_DATE) {
    return new Date(`${process.env.SEED_REFERENCE_DATE}T12:00:00.000Z`);
  }

  return new Date(`${DEFAULT_SEED_REFERENCE_DATE}T12:00:00.000Z`);
}

function toDate(dateValue) {
  return new Date(`${dateValue}T12:00:00.000Z`);
}

function addDays(dateValue, days) {
  const date = new Date(dateValue);

  date.setUTCDate(date.getUTCDate() + days);

  return date;
}

function normalizeForEmail(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function getDemoContactEmail(companyName, contact) {
  const companySlug = normalizeForEmail(companyName);
  const firstNameSlug = normalizeForEmail(contact.firstName);
  const lastNameSlug = normalizeForEmail(contact.lastName);

  return `${firstNameSlug}.${lastNameSlug}.${companySlug}@jobtrace-demo.example`;
}

function getDemoPhoneNumber(contactIndex) {
  const firstSegment = String(10 + contactIndex % 80).padStart(2, "0");
  const secondSegment = String(20 + contactIndex % 70).padStart(2, "0");
  const thirdSegment = String(30 + contactIndex % 60).padStart(2, "0");
  const fourthSegment = String(40 + contactIndex % 50).padStart(2, "0");

  return `+33 6 ${firstSegment} ${secondSegment} ${thirdSegment} ${fourthSegment}`;
}

function getStatus(applicationIndex) {
  if (applicationIndex % 23 === 0) {
    return "accepted";
  }

  if (applicationIndex % 7 === 0) {
    return "interview";
  }

  if (applicationIndex % 5 === 0) {
    return "rejected";
  }

  if (applicationIndex % 3 === 0) {
    return "follow_up";
  }

  return "sent";
}

function getInterviewDate(sentAt, status) {
  if (status === "interview" || status === "accepted") {
    return addDays(sentAt, 21);
  }

  return null;
}

function getSalary(company, applicationIndex) {
  const salaryVariation = (applicationIndex % 9) * 1500;

  return company.salaryBase + salaryVariation;
}

function getLocation(company, applicationIndex) {
  const locationIndex = applicationIndex % company.locations.length;

  return company.locations[locationIndex];
}

function getApplicationNotes(company, status, sentAt, contact) {
  const sentDate = sentAt.toISOString().slice(0, 10);
  const notes = [
    `Candidature préparée pour ${company.name} le ${sentDate}.`,
    "Angle mis en avant : reconversion full stack, culture produit, expérience design et pédagogie Holberton.",
    `Contact de suivi fictif pour la démo : ${contact.firstName} ${contact.lastName}.`,
    `Source principale : page carrière ${company.careersUrl}.`
  ];

  if (status === "follow_up") {
    notes.push("Relance à effectuer avec un message court et professionnel.");
  }

  if (status === "interview") {
    notes.push("Préparer des exemples concrets autour de React, Node.js, Prisma, PostgreSQL et Docker.");
  }

  if (status === "accepted") {
    notes.push("Retour très positif conservé pour tester le scénario de candidature acceptée.");
  }

  if (status === "rejected") {
    notes.push("Refus conservé pour tester les statistiques et le suivi complet du pipeline.");
  }

  return notes.join("\n");
}

function getPdfContent(documentSeed) {
  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 215 >>
stream
BT
/F1 16 Tf
72 760 Td
(JobTrace demo document) Tj
0 -28 Td
(${documentSeed.originalName}) Tj
0 -28 Td
(Fichier factice genere pour tester les documents.) Tj
0 -28 Td
(Profile demo: Fabien Chavonet) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000116 00000 n
0000000214 00000 n
trailer
<< /Root 1 0 R /Size 5 >>
startxref
480
%%EOF
`;
}

function getApplicationContexts() {
  const applicationContexts = [];

  for (const scheduleItem of applicationSchedule) {
    for (let dayIndex = 0; dayIndex < scheduleItem.count; dayIndex += 1) {
      applicationContexts.push({
        sentAt: toDate(scheduleItem.date),
        dayIndex
      });
    }
  }

  return applicationContexts;
}

async function ensureUploadDirectory() {
  await fs.mkdir(UPLOAD_DIRECTORY, {
    recursive: true
  });
}

async function removePreviousSeedFiles() {
  await ensureUploadDirectory();

  const fileNames = await fs.readdir(UPLOAD_DIRECTORY);

  for (const fileName of fileNames) {
    if (fileName.startsWith("seed-demo-")) {
      await fs.unlink(path.join(UPLOAD_DIRECTORY, fileName));
    }
  }
}

async function seedAchievements() {
  const achievements = [];

  for (const achievementSeed of achievementSeeds) {
    const achievement = await prisma.achievement.upsert({
      where: {
        slug: achievementSeed.slug
      },
      update: {
        name: achievementSeed.name,
        description: achievementSeed.description,
        icon: achievementSeed.icon
      },
      create: achievementSeed
    });

    achievements.push(achievement);
  }

  return achievements;
}

async function resetSeedUser(email) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    await prisma.user.delete({
      where: {
        id: existingUser.id
      }
    });
  }
}

async function createSeedUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: "Fabien",
      lastName: "Chavonet",
      avatarUrl: DEFAULT_AVATAR_URL,
      emailVerified: true,
      theme: "light",
      dailyGoal: 5,
      followUpDelayDays: FOLLOW_UP_DELAY_DAYS
    }
  });
}

async function createTags(userId) {
  const tagMap = new Map();

  for (const tagSeed of tagSeeds) {
    const tag = await prisma.tag.create({
      data: {
        userId,
        name: tagSeed.name,
        slug: tagSeed.slug,
        color: tagSeed.color
      }
    });

    tagMap.set(tag.slug, tag);
  }

  return tagMap;
}

async function createContacts(userId) {
  const contactMap = new Map();
  let contactIndex = 0;

  for (const company of companyProfiles) {
    const contacts = [];

    for (const contactSeed of company.contacts) {
      const contact = await prisma.contact.create({
        data: {
          userId,
          firstName: contactSeed.firstName,
          lastName: contactSeed.lastName,
          position: contactSeed.position,
          email: getDemoContactEmail(company.name, contactSeed),
          phoneNumber: getDemoPhoneNumber(contactIndex),
          company: company.name,
          linkedinUrl: company.linkedinUrl,
          notes: `Contact de démonstration pour ${company.name}. Les coordonnées sont fictives et utilisent le domaine jobtrace-demo.example.`
        }
      });

      contacts.push(contact);
      contactIndex += 1;
    }

    contactMap.set(company.name, contacts);
  }

  return contactMap;
}

async function createDocuments(userId) {
  const documents = [];

  await ensureUploadDirectory();

  for (const documentSeed of documentSeeds) {
    const storedName = `seed-demo-${crypto.randomUUID()}.pdf`;
    const filePath = path.join(UPLOAD_DIRECTORY, storedName);
    const content = getPdfContent(documentSeed);

    await fs.writeFile(filePath, content);

    const stats = await fs.stat(filePath);

    const document = await prisma.document.create({
      data: {
        userId,
        type: documentSeed.type,
        originalName: documentSeed.originalName,
        storedName,
        mimeType: "application/pdf",
        size: stats.size,
        path: filePath
      }
    });

    documents.push(document);
  }

  return documents;
}

async function createApplications(userId, contactMap) {
  const applicationContexts = getApplicationContexts();
  const applications = [];

  for (let applicationIndex = 0; applicationIndex < applicationContexts.length; applicationIndex += 1) {
    const applicationContext = applicationContexts[applicationIndex];
    const company = companyProfiles[applicationIndex % companyProfiles.length];
    const companyContacts = contactMap.get(company.name);
    const contact = companyContacts[applicationIndex % companyContacts.length];
    const sentAt = applicationContext.sentAt;
    const status = getStatus(applicationIndex + 1);
    const followUpAt = addDays(sentAt, FOLLOW_UP_DELAY_DAYS);
    const interviewAt = getInterviewDate(sentAt, status);
    const position = positionSeeds[applicationIndex % positionSeeds.length];
    const contractType = contractTypes[applicationIndex % contractTypes.length];
    const salary = getSalary(company, applicationIndex);

    const application = await prisma.application.create({
      data: {
        userId,
        company: company.name,
        position,
        status,
        contractType,
        location: getLocation(company, applicationIndex),
        salary,
        link: company.careersUrl,
        notes: getApplicationNotes(company, status, sentAt, contact),
        sentAt,
        followUpAt,
        interviewAt,
        createdAt: sentAt
      }
    });

    applications.push({
      application,
      company,
      contact,
      status,
      followUpAt,
      interviewAt
    });
  }

  return applications;
}

async function linkTagsToApplications(applications, tagMap) {
  for (const applicationContext of applications) {
    const { application, company, status } = applicationContext;
    const selectedSlugs = [...company.tags];

    selectedSlugs.push("relance");

    if (status === "interview" || status === "accepted") {
      selectedSlugs.push("entretien");
    }

    if (application.salary >= 52000) {
      selectedSlugs.push("priorite");
    }

    const uniqueSlugs = [...new Set(selectedSlugs)];

    for (const slug of uniqueSlugs) {
      const tag = tagMap.get(slug);

      if (tag) {
        await prisma.applicationTag.create({
          data: {
            applicationId: application.id,
            tagId: tag.id
          }
        });
      }
    }
  }
}

async function linkContactsToApplications(applications) {
  for (const applicationContext of applications) {
    await prisma.applicationContact.create({
      data: {
        applicationId: applicationContext.application.id,
        contactId: applicationContext.contact.id,
        role: applicationContext.contact.position
      }
    });
  }
}

async function linkDocumentsToApplications(applications, documents) {
  for (let applicationIndex = 0; applicationIndex < applications.length; applicationIndex += 1) {
    const application = applications[applicationIndex].application;
    const firstDocument = documents[applicationIndex % documents.length];

    await prisma.applicationDocument.create({
      data: {
        applicationId: application.id,
        documentId: firstDocument.id
      }
    });

    if (applicationIndex % 3 === 0) {
      const secondDocument = documents[(applicationIndex + 5) % documents.length];

      await prisma.applicationDocument.create({
        data: {
          applicationId: application.id,
          documentId: secondDocument.id
        }
      });
    }
  }
}

async function createHistory(applications) {
  for (const applicationContext of applications) {
    const { application, company, contact, status, followUpAt, interviewAt } = applicationContext;

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        action: "application_created",
        metadata: {
          company: application.company,
          position: application.position,
          status: "sent"
        },
        createdAt: application.sentAt
      }
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        action: "contact_linked",
        metadata: {
          company: company.name,
          contact: `${contact.firstName} ${contact.lastName}`,
          role: contact.position
        },
        createdAt: addDays(application.sentAt, 1)
      }
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        action: "tag_linked",
        metadata: {
          tags: company.tags
        },
        createdAt: addDays(application.sentAt, 1)
      }
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        action: "document_linked",
        metadata: {
          source: "demo_seed"
        },
        createdAt: addDays(application.sentAt, 2)
      }
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        action: "application_updated",
        metadata: {
          updatedFields: ["followUpAt"],
          followUpAt: followUpAt.toISOString().slice(0, 10)
        },
        createdAt: followUpAt
      }
    });

    if (interviewAt) {
      await prisma.applicationHistory.create({
        data: {
          applicationId: application.id,
          action: "application_status_updated",
          metadata: {
            previousStatus: "follow_up",
            newStatus: "interview"
          },
          createdAt: interviewAt
        }
      });
    }

    if (status === "accepted" || status === "rejected") {
      await prisma.applicationHistory.create({
        data: {
          applicationId: application.id,
          action: "application_status_updated",
          metadata: {
            previousStatus: "interview",
            newStatus: status
          },
          createdAt: addDays(application.sentAt, 35)
        }
      });
    }
  }
}

async function unlockAchievements(userId, achievements) {
  for (const achievement of achievements) {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id
      }
    });
  }
}

async function main() {
  const seedEmail = getSeedEmail();
  const seedPassword = getSeedPassword();
  const referenceDate = getReferenceDate();

  console.log("Resetting demo seed user...");
  await removePreviousSeedFiles();
  await resetSeedUser(seedEmail);

  console.log("Seeding achievements...");
  const achievements = await seedAchievements();

  console.log("Creating demo user...");
  const user = await createSeedUser(seedEmail, seedPassword);

  console.log("Creating tags, contacts and documents...");
  const tagMap = await createTags(user.id);
  const contactMap = await createContacts(user.id);
  const documents = await createDocuments(user.id);

  console.log("Creating applications over approximately three months...");
  const applications = await createApplications(user.id, contactMap);

  console.log("Linking applications to tags, contacts and documents...");
  await linkTagsToApplications(applications, tagMap);
  await linkContactsToApplications(applications);
  await linkDocumentsToApplications(applications, documents);

  console.log("Creating application history...");
  await createHistory(applications);

  console.log("Unlocking demo achievements...");
  await unlockAchievements(user.id, achievements);

  console.log("Demo database seed completed.");
  console.log(`Email: ${seedEmail}`);
  console.log(`Password: ${seedPassword}`);
  console.log(`Reference date: ${referenceDate.toISOString().slice(0, 10)}`);
  console.log(`Applications: ${applications.length}`);
  console.log(`Contacts: ${companyProfiles.length * 3}`);
  console.log(`Documents: ${documentSeeds.length}`);
  console.log(`Tags: ${tagSeeds.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
