import { BarChart3, CalendarDays, FilePen, FileText, LayoutDashboard, Search, Target, UsersRound, } from "lucide-react";

export const DASHBOARD_NAVIGATION_GROUPS = [
  {
    id: "general",
    label: "Général",
    items: [
      {
        id: "dashboard",
        label: "Tableau de bord",
        path: "/dashboard",
        Icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    id: "tracking",
    label: "Suivi",
    items: [
      {
        id: "applications",
        label: "Candidatures",
        path: "/dashboard/applications",
        Icon: FilePen,
      },
      {
        id: "calendar",
        label: "Calendrier",
        path: "/dashboard/calendar",
        Icon: CalendarDays,
      },
      {
        id: "achievements",
        label: "Objectifs",
        path: "/dashboard/achievements",
        Icon: Target,
      },
    ],
  },
  {
    id: "organization",
    label: "Organisation",
    items: [
      {
        id: "contacts",
        label: "Contacts",
        path: "/dashboard/contacts",
        Icon: UsersRound,
      },
      {
        id: "documents",
        label: "Documents",
        path: "/dashboard/documents",
        Icon: FileText,
      },
    ],
  },
  {
    id: "analysis",
    label: "Analyse",
    items: [
      {
        id: "statistics",
        label: "Statistiques",
        path: "/dashboard/statistics",
        Icon: BarChart3,
      },
    ],
  },
];
