export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatSalary(value) {
  if (value === null || value === undefined || value === "") {
    return "Non renseigné";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "Non renseigné";
  }

  return new Intl.NumberFormat("fr-FR").format(numberValue) + " €";
}

export function formatFileSize(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "Taille inconnue";
  }

  if (numberValue < 1024 * 1024) {
    return Math.round(numberValue / 1024) + " Ko";
  }

  return (numberValue / 1024 / 1024).toFixed(1) + " Mo";
}
