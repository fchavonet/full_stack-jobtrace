import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCurrentUser, exportCurrentUserData } from "../api/auth.api";
import {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
} from "../api/profile.api";
import { updateUserSettings } from "../api/settings.api";
import PasswordRequirements from "../components/auth/PasswordRequirements";
import LegalModal from "../components/legal/LegalModal";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import {
  getNumberValue,
  getProfileFromResponse,
  getProfileInitials,
  getTextValue,
} from "../utils/profile/profile.utils";

const AUTH_TOKEN_STORAGE_KEY = "jobtrace_token";

const defaultProfileForm = {
  firstName: "",
  lastName: "",
  avatarUrl: "",
};

const defaultSettingsForm = {
  theme: "light",
  dailyGoal: 5,
  followUpDelayDays: 15,
};

const defaultPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function isPasswordValid(password) {
  const hasLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  return hasLength && hasLowercase && hasUppercase && hasDigit;
}

function arePasswordsMatching(passwordForm) {
  return (
    passwordForm.newPassword === passwordForm.confirmPassword
    && passwordForm.confirmPassword.length > 0
  );
}

function getNewPasswordInputClassName(password) {
  let className = "input input-bordered w-full pr-10";

  if (password.length > 0) {
    className = "input input-bordered input-error w-full pr-10";
  }

  if (isPasswordValid(password)) {
    className = "input input-bordered input-success w-full pr-10";
  }

  return className;
}

function getConfirmPasswordInputClassName(passwordForm) {
  let className = "input input-bordered w-full";

  if (passwordForm.confirmPassword.length > 0) {
    className = "input input-bordered input-error w-full";
  }

  if (arePasswordsMatching(passwordForm)) {
    className = "input input-bordered input-success w-full";
  }

  return className;
}

function downloadJsonFile(data) {
  const formattedData = JSON.stringify(data, null, 2);
  const blob = new Blob([formattedData], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "jobtrace-user-data.json";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { setTheme } = useTheme();

  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [settingsForm, setSettingsForm] = useState(defaultSettingsForm);
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm);

  const [loading, setLoading] = useState(true);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [legalModalType, setLegalModalType] = useState(null);

  useEffect(function () {
    async function loadUserProfile() {
      try {
        const response = await getUserProfile();
        const profile = getProfileFromResponse(response) || {};
        const profileTheme = getTextValue(profile.theme) || "light";

        setProfileForm({
          firstName: getTextValue(profile.firstName),
          lastName: getTextValue(profile.lastName),
          avatarUrl: getTextValue(profile.avatarUrl),
        });

        setSettingsForm({
          theme: profileTheme,
          dailyGoal: getNumberValue(profile.dailyGoal, 5),
          followUpDelayDays: getNumberValue(profile.followUpDelayDays, 15),
        });

        setTheme(profileTheme);
      } catch {
        showToast("Impossible de charger les paramètres.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [showToast, setTheme]);

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm(function (currentProfileForm) {
      return {
        ...currentProfileForm,
        [name]: value,
      };
    });
  }

  function handleSettingsChange(event) {
    const { name, value } = event.target;

    setSettingsForm(function (currentSettingsForm) {
      return {
        ...currentSettingsForm,
        [name]: value,
      };
    });

    if (name === "theme") {
      setTheme(value);
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm(function (currentPasswordForm) {
      return {
        ...currentPasswordForm,
        [name]: value,
      };
    });
  }

  function handleDeleteConfirmationChange(event) {
    setDeleteConfirmation(event.target.value);
  }

  function toggleCurrentPasswordVisibility() {
    setShowCurrentPassword(function (currentValue) {
      return !currentValue;
    });
  }

  function toggleNewPasswordVisibility() {
    setShowNewPassword(function (currentValue) {
      return !currentValue;
    });
  }

  function openPrivacyModal() {
    setLegalModalType("privacy");
  }

  function openDeleteModal() {
    setLegalModalType("delete");
  }

  function closeLegalModal() {
    setLegalModalType(null);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    setProfileSubmitting(true);

    try {
      const payload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      };

      await updateUserProfile(payload);

      window.dispatchEvent(new Event("jobtrace-profile-updated"));
      showToast("Profil mis à jour.", "success");
    } catch {
      showToast("Impossible de mettre à jour le profil.", "error");
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();

    setSettingsSubmitting(true);

    try {
      const payload = {
        theme: settingsForm.theme,
        dailyGoal: Number(settingsForm.dailyGoal),
        followUpDelayDays: Number(settingsForm.followUpDelayDays),
      };

      await updateUserSettings(payload);

      setTheme(payload.theme);
      showToast("Préférences mises à jour.", "success");
    } catch {
      showToast("Impossible de mettre à jour les préférences.", "error");
    } finally {
      setSettingsSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!isPasswordValid(passwordForm.newPassword)) {
      showToast("Le mot de passe ne respecte pas les critères.", "error");
      return;
    }

    if (!arePasswordsMatching(passwordForm)) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      await updateUserPassword(payload);

      setPasswordForm(defaultPasswordForm);
      showToast("Mot de passe mis à jour.", "success");
    } catch {
      showToast("Impossible de mettre à jour le mot de passe.", "error");
    } finally {
      setPasswordSubmitting(false);
    }
  }

  async function handleExportData() {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      showToast("Session introuvable.", "error");
      return;
    }

    setExportSubmitting(true);

    try {
      const data = await exportCurrentUserData(token);

      downloadJsonFile(data);
      showToast("Export des données téléchargé.", "success");
    } catch {
      showToast("Impossible d’exporter les données.", "error");
    } finally {
      setExportSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      showToast("Session introuvable.", "error");
      return;
    }

    if (deleteConfirmation !== "SUPPRIMER") {
      showToast("Veuillez saisir SUPPRIMER pour confirmer.", "error");
      return;
    }

    setDeleteSubmitting(true);

    try {
      await deleteCurrentUser(token);

      logout();
      showToast("Compte supprimé.", "success");
      navigate("/");
    } catch {
      showToast("Impossible de supprimer le compte.", "error");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section>
        <h1 className="text-3xl font-bold">
          Paramètres
        </h1>

        <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div>
        <h1 className="text-4xl font-bold">
          Paramètres
        </h1>

        <p className="text-base-content/70">
          Gérez votre profil, vos préférences et vos données.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {/* Profile settings */}
        <form
          className="rounded-2xl bg-base-100 p-6 shadow-sm"
          onSubmit={handleProfileSubmit}
        >
          <div>
            <h2 className="text-xl font-semibold">
              Profil
            </h2>

            <p className="text-sm text-base-content/60">
              Personnalisez les informations de votre profil.
            </p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr] sm:items-start">
            <div className="h-full min-h-56 overflow-hidden rounded-xl bg-primary">
              {profileForm.avatarUrl && (
                <img
                  className="h-full min-h-56 w-full object-cover"
                  src={profileForm.avatarUrl}
                  alt="Avatar utilisateur"
                />
              )}

              {!profileForm.avatarUrl && (
                <div className="flex h-full min-h-56 w-full items-center justify-center text-6xl font-bold text-primary-content">
                  {getProfileInitials(profileForm)}
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <label className="form-control w-full">
                <span className="label mb-1">
                  Prénom
                </span>

                <input
                  className="input input-bordered w-full"
                  name="firstName"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                />
              </label>

              <label className="form-control w-full">
                <span className="label mb-1">
                  Nom
                </span>

                <input
                  className="input input-bordered w-full"
                  name="lastName"
                  type="text"
                  autoComplete="off"
                  placeholder=""
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                />
              </label>

              <label className="form-control w-full">
                <span className="label mb-1">
                  URL de l’avatar
                </span>

                <input
                  className="input input-bordered w-full"
                  name="avatarUrl"
                  type="url"
                  autoComplete="off"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileForm.avatarUrl}
                  onChange={handleProfileChange}
                />
              </label>

              <button
                className="btn btn-primary mt-4 w-full text-white"
                type="submit"
                disabled={profileSubmitting}
              >
                {profileSubmitting && (
                  <span className="loading loading-spinner loading-sm" />
                )}

                Enregistrer le profil
              </button>
            </div>
          </div>
        </form>

        {/* Preferences settings */}
        <form
          className="w-full min-w-0 rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6"
          onSubmit={handleSettingsSubmit}
        >
          <div>
            <h2 className="text-xl font-semibold">
              Préférences
            </h2>

            <p className="text-sm text-base-content/60">
              Configurez vos paramètres.
            </p>
          </div>

          <div className="mt-4 grid min-w-0 gap-4">
            <label className="form-control w-full min-w-0">
              <span className="label mb-1">
                Thème
              </span>

              <select
                className="select select-bordered w-full min-w-0"
                name="theme"
                value={settingsForm.theme}
                onChange={handleSettingsChange}
              >
                <option value="light">
                  Clair
                </option>

                <option value="dark">
                  Sombre
                </option>
              </select>
            </label>

            <label className="form-control w-full min-w-0">
              <span className="label mb-1">
                Objectif quotidien
              </span>

              <input
                className="input input-bordered w-full"
                name="dailyGoal"
                type="number"
                min="1"
                value={settingsForm.dailyGoal}
                onChange={handleSettingsChange}
                placeholder="5"
              />
            </label>

            <label className="form-control w-full min-w-0">
              <span className="label mb-1">
                Délai de relance
              </span>

              <input
                className="input input-bordered w-full"
                name="followUpDelayDays"
                type="number"
                min="1"
                value={settingsForm.followUpDelayDays}
                onChange={handleSettingsChange}
                placeholder="15"
              />
            </label>
          </div>

          <button
            className="btn btn-primary mt-8 w-full text-white"
            type="submit"
            disabled={settingsSubmitting}
          >
            {settingsSubmitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Enregistrer les préférences
          </button>
        </form>

        {/* Password settings */}
        <form
          className="rounded-2xl bg-base-100 p-6 shadow-sm"
          onSubmit={handlePasswordSubmit}
        >
          <input
            className="hidden"
            type="text"
            name="username"
            autoComplete="username"
            value=""
            readOnly
          />
          <div>
            <h2 className="text-xl font-semibold">
              Sécurité
            </h2>

            <p className="text-sm text-base-content/60">
              Modifiez votre mot de passe de connexion.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Nouveau mot de passe
                </span>
              </div>

              <div className="relative">
                <input
                  className={getNewPasswordInputClassName(passwordForm.newPassword)}
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Entrer votre nouveau mot de passe"
                  autoComplete="new-password"
                  required
                />

                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  aria-label="Afficher ou masquer le nouveau mot de passe"
                >
                  {showNewPassword && (
                    <EyeOff className="h-4 w-4" />
                  )}

                  {!showNewPassword && (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            <PasswordRequirements
              password={passwordForm.newPassword}
              passwordConfirmation={passwordForm.confirmPassword}
            />

            <label className="form-control w-full">
              <span className="label mb-1">
                Confirmer le nouveau mot de passe
              </span>

              <input
                className={getConfirmPasswordInputClassName(passwordForm)}
                name="confirmPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirmer votre nouveau mot de passe"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <div className="divider divider-primary mt-6" />

          <label className="form-control w-full">
            <span className="label mb-1">
              Mot de passe actuel
            </span>

            <div className="relative">
              <input
                className="input input-bordered w-full pr-10"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Entrer votre mot de passe actuel"
                autoComplete="current-password"
                required
              />

              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                type="button"
                onClick={toggleCurrentPasswordVisibility}
                aria-label="Afficher ou masquer le mot de passe actuel"
              >
                {showCurrentPassword && (
                  <EyeOff className="h-4 w-4" />
                )}

                {!showCurrentPassword && (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <button
            className="btn btn-primary mt-8 w-full text-white"
            type="submit"
            disabled={passwordSubmitting}
          >
            {passwordSubmitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Modifier le mot de passe
          </button>
        </form>

        {/* Account settings */}
        <div className="rounded-2xl bg-base-100 p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">
              Compte
            </h2>

            <p className="text-sm text-base-content/60">
              Gérez votre compte JobTrace.
            </p>
          </div>

          <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-2">
            <div className="flex h-full flex-col rounded-xl border border-base-300 p-4">
              <div>
                <h3 className="font-semibold">
                  Export des données
                </h3>

                <p className="mt-1 text-sm text-base-content/60">
                  Téléchargez une copie de l’ensemble des données associées à votre compte.
                </p>

                <button
                  className="link link-primary mt-1 text-left text-sm"
                  type="button"
                  onClick={openPrivacyModal}
                >
                  Voir les informations relatives aux données personnelles.
                </button>
              </div>

              <div className="mt-auto pt-6">
                <button
                  className="btn btn-outline btn-primary w-full"
                  type="button"
                  disabled={exportSubmitting}
                  onClick={handleExportData}
                >
                  {exportSubmitting && (
                    <span className="loading loading-spinner loading-sm" />
                  )}

                  Télécharger mes données
                </button>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-xl border border-error/40 bg-error/5 p-4">
              <div>
                <h3 className="font-semibold text-error">
                  Suppression du compte
                </h3>

                <p className="mt-1 text-sm text-base-content/70">
                  Cette action supprimera définitivement votre compte et les données associées.
                </p>

                <button
                  className="link link-error mt-1 block text-left text-sm"
                  type="button"
                  onClick={openDeleteModal}
                >
                  Comprendre les conséquences de la suppression.
                </button>
              </div>

              <div className="mt-auto pt-6">
                <label className="form-control w-full">
                  <input
                    className="input input-bordered w-full"
                    type="text"
                    value={deleteConfirmation}
                    onChange={handleDeleteConfirmationChange}
                    placeholder="Tapez SUPPRIMER pour confirmer"
                  />
                </label>

                <button
                  className="btn btn-error mt-4 w-full text-white"
                  type="button"
                  disabled={deleteSubmitting}
                  onClick={handleDeleteAccount}
                >
                  {deleteSubmitting && (
                    <span className="loading loading-spinner loading-sm" />
                  )}

                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LegalModal type={legalModalType} onClose={closeLegalModal} />
    </section>
  );
}

export default SettingsPage;
