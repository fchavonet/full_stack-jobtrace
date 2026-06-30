export const defaultUserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  avatarUrl: "",
};

export function getProfileFromResponse(response) {
  if (response && response.data && response.data.user) {
    return response.data.user;
  }

  if (response && response.data && response.data.profile) {
    return response.data.profile;
  }

  if (response && response.data) {
    return response.data;
  }

  return {};
}

export function getTextValue(value) {
  if (typeof value === "string") {
    return value;
  }

  return "";
}

export function getNumberValue(value, defaultValue) {
  const parsedValue = Number(value);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return defaultValue;
}

export function getProfileInitials(profile) {
  const firstInitial = getTextValue(profile.firstName).trim().charAt(0).toUpperCase();
  const lastInitial = getTextValue(profile.lastName).trim().charAt(0).toUpperCase();
  const initials = firstInitial + lastInitial;

  if (initials) {
    return initials;
  }

  return "JT";
}

export function getProfileDisplayName(profile) {
  const fullName = [
    getTextValue(profile.firstName),
    getTextValue(profile.lastName),
  ].join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (profile && profile.email) {
    return profile.email;
  }

  return "Utilisateur";
}
