import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { deleteCurrentUser, exportCurrentUserData } from "../api/auth.api";
import { getUserProfile, updateUserPassword, updateUserProfile, } from "../api/profile.api";
import { updateUserSettings } from "../api/settings.api";

import PasswordRequirements from "../components/auth/PasswordRequirements";
import LegalModal from "../components/settings/LegalModal";
import { SectionCard } from "../components/ui/Cards";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";

import {
  isPasswordValid,
  isPasswordWithinByteLimit
} from "../utils/password.utils";

import { getNumberValue, getProfileFromResponse, getProfileInitials, getTextValue, } from "../utils/profile/profile.utils";

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

// Password helpers
function arePasswordsMatching(passwordForm) {
  return (
    passwordForm.newPassword === passwordForm.confirmPassword
    && passwordForm.confirmPassword.length > 0
  );
}

function getPasswordInputType(showPassword) {
  if (showPassword) {
    return "text";
  }

  return "password";
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

// File helpers
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

// Settings navigation helpers
function getSettingsFieldRef(field, refs) {
  if (field === "theme") {
    return refs.themeInputRef;
  }

  if (field === "dailyGoal") {
    return refs.dailyGoalInputRef;
  }

  if (field === "followUpDelayDays") {
    return refs.followUpDelayInputRef;
  }

  return null;
}

// Page container
function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null);

  const preferencesSectionRef = useRef(null);
  const themeInputRef = useRef(null);
  const dailyGoalInputRef = useRef(null);
  const followUpDelayInputRef = useRef(null);

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

  useEffect(function () {
    if (loading) {
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get("section");
    const field = searchParams.get("field");

    if (section !== "preferences") {
      return;
    }

    if (preferencesSectionRef.current) {
      preferencesSectionRef.current.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    }

    const fieldRef = getSettingsFieldRef(field, {
      themeInputRef,
      dailyGoalInputRef,
      followUpDelayInputRef,
    });

    if (fieldRef && fieldRef.current) {
      fieldRef.current.focus({
        preventScroll: true,
      });
    }
  }, [loading, location.search]);

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

  function handleDeletePasswordChange(event) {
    setDeletePassword(event.target.value);
  }

  function toggleDeletePasswordVisibility() {
    setShowDeletePassword(function (currentValue) {
      return !currentValue;
    });
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

    if (
      !isPasswordWithinByteLimit(
        passwordForm.currentPassword
      )
    ) {
      showToast(
        "Le mot de passe actuel ne doit pas dépasser 72 octets.",
        "error"
      );

      return;
    }

    if (
      !isPasswordWithinByteLimit(
        passwordForm.newPassword
      )
    ) {
      showToast(
        "Le nouveau mot de passe ne doit pas dépasser 72 octets.",
        "error"
      );

      return;
    }

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

      try {
        await logout();
      } catch {
        /*
         * Le changement de mot de passe invalide déjà
         * la session côté backend.
         */
      }

      showToast(
        "Mot de passe mis à jour. Reconnectez-vous.",
        "success"
      );

      navigate("/", {
        replace: true,
        state: {
          openAuthModal: true,
          authMode: "login",
        },
      });
    } catch (error) {
      let errorMessage = "";

      if (
        error
        && typeof error.message === "string"
      ) {
        errorMessage = error.message;
      }

      if (
        errorMessage
        === "Current password must not exceed 72 bytes."
      ) {
        showToast(
          "Le mot de passe actuel ne doit pas dépasser 72 octets.",
          "error"
        );

        return;
      }

      if (
        errorMessage
        === "New password must not exceed 72 bytes."
      ) {
        showToast(
          "Le nouveau mot de passe ne doit pas dépasser 72 octets.",
          "error"
        );

        return;
      }

      if (
        errorMessage
        === "Current password must not exceed 72 bytes."
      ) {
        showToast(
          "Le mot de passe actuel ne doit pas dépasser 72 octets.",
          "error"
        );

        return;
      }

      if (
        errorMessage
        === "Current password is incorrect."
      ) {
        showToast(
          "Le mot de passe actuel est incorrect.",
          "error"
        );

        return;
      }

      const sessionErrorMessages = [
        "Authentication token is required.",
        "Authenticated user no longer exists.",
        "Authentication session is no longer valid.",
        "Authentication token is invalid or expired.",
      ];

      if (
        sessionErrorMessages.includes(
          errorMessage
        )
      ) {
        try {
          await logout();
        } catch {
          /*
           * La session est déjà invalide.
           */
        }

        showToast(
          "Votre session a expiré. Reconnectez-vous.",
          "error"
        );

        navigate("/", {
          replace: true,
          state: {
            openAuthModal: true,
            authMode: "login",
          },
        });

        return;
      }

      showToast(
        "Impossible de mettre à jour le mot de passe.",
        "error"
      );
    } finally {
      setPasswordSubmitting(false);
    }
  }

  async function handleExportData() {
    setExportSubmitting(true);

    try {
      const data = await exportCurrentUserData();

      downloadJsonFile(data);
      showToast("Export des données téléchargé.", "success");
    } catch {
      showToast("Impossible d’exporter les données.", "error");
    } finally {
      setExportSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      showToast(
        "Veuillez saisir votre mot de passe actuel.",
        "error"
      );

      return;
    }

    if (
      !isPasswordWithinByteLimit(
        deletePassword
      )
    ) {
      showToast(
        "Le mot de passe actuel ne doit pas dépasser 72 octets.",
        "error"
      );

      return;
    }

    if (deleteConfirmation !== "SUPPRIMER") {
      showToast(
        "Veuillez saisir SUPPRIMER pour confirmer.",
        "error"
      );

      return;
    }

    setDeleteSubmitting(true);

    try {
      await deleteCurrentUser({
        currentPassword: deletePassword,
      });

      try {
        await logout();
      } catch {
        /*
         * Le compte est déjà supprimé côté backend.
         */
      }

      showToast("Compte supprimé.", "success");

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      let errorMessage = "";

      if (
        error
        && typeof error.message === "string"
      ) {
        errorMessage = error.message;
      }

      if (
        errorMessage
        === "Current password is incorrect."
      ) {
        showToast(
          "Le mot de passe actuel est incorrect.",
          "error"
        );

        return;
      }

      if (
        errorMessage
        === "Current password is required."
      ) {
        showToast(
          "Veuillez saisir votre mot de passe actuel.",
          "error"
        );

        return;
      }

      showToast(
        "Impossible de supprimer le compte.",
        "error"
      );
    } finally {
      setDeleteSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="w-full min-w-0 flex flex-col justify-start items-stretch">
        <PageHeader title="Paramètres" />

        <div className="w-full mt-6">
          <LoadingCard />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch">
      <PageHeader
        title="Paramètres"
        description="Gérez votre profil, vos préférences et vos données."
      />

      <div className="w-full mt-6 flex flex-col justify-start items-stretch gap-6">
        <SectionCard
          as="form"
          title="Profil"
          description="Personnalisez les informations de votre profil."
          onSubmit={handleProfileSubmit}
        >
          <div className="w-full grid gap-6 sm:grid-cols-[220px_1fr] sm:items-start">
            <div className="w-full h-full min-h-56 overflow-hidden rounded-xl bg-primary">
              {profileForm.avatarUrl && (
                <img
                  className="w-full h-full min-h-56 object-cover"
                  width="220"
                  height="224"
                  src={profileForm.avatarUrl}
                  alt="Avatar utilisateur"
                  loading="lazy"
                  decoding="async"
                />)}

              {!profileForm.avatarUrl && (
                <div className="w-full h-full min-h-56 flex flex-row justify-center items-center text-6xl font-bold text-primary-content">
                  {getProfileInitials(profileForm)}
                </div>
              )}
            </div>

            <div className="w-full grid gap-4">
              <label className="form-control w-full">
                <span className="label mb-1">
                  Prénom
                </span>

                <input
                  className="input input-bordered w-full"
                  name="firstName"
                  type="text"
                  autoComplete="off"
                  placeholder="Entrez votre prénom"
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
                  placeholder="Entrez votre nom"
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
                className="btn btn-primary w-full mt-4 text-primary-content"
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
        </SectionCard>

        <div className="w-full min-w-0" ref={preferencesSectionRef}>
          <SectionCard
            as="form"
            title="Préférences"
            description="Configurez vos paramètres."
            onSubmit={handleSettingsSubmit}
          >
            <div className="w-full min-w-0 grid gap-4">
              <label className="form-control w-full min-w-0">
                <span className="label mb-1">
                  Thème
                </span>

                <select
                  ref={themeInputRef}
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
                  ref={dailyGoalInputRef}
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
                  ref={followUpDelayInputRef}
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
              className="btn btn-primary w-full mt-8 text-primary-content"
              type="submit"
              disabled={settingsSubmitting}
            >
              {settingsSubmitting && (
                <span className="loading loading-spinner loading-sm" />
              )}

              Enregistrer les préférences
            </button>
          </SectionCard>
        </div>

        <SectionCard
          as="form"
          title="Sécurité"
          description="Modifiez votre mot de passe de connexion."
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

          <div className="w-full grid gap-4">
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
                  type={getPasswordInputType(showNewPassword)}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Entrez votre nouveau mot de passe"
                  autoComplete="new-password"
                  required
                />

                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer"
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  aria-label="Afficher ou masquer le nouveau mot de passe"
                >
                  {showNewPassword && (
                    <EyeOff className="w-4 h-4" />
                  )}

                  {!showNewPassword && (
                    <Eye className="w-4 h-4" />
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
                type={getPasswordInputType(showNewPassword)}
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
                type={getPasswordInputType(showCurrentPassword)}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Entrez votre mot de passe actuel"
                autoComplete="current-password"
                required
              />

              <button
                className="absolute top-1/2 right-3 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer"
                type="button"
                onClick={toggleCurrentPasswordVisibility}
                aria-label="Afficher ou masquer le mot de passe actuel"
              >
                {showCurrentPassword && (
                  <EyeOff className="w-4 h-4" />
                )}

                {!showCurrentPassword && (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>

          <button
            className="btn btn-primary w-full mt-8 text-primary-content"
            type="submit"
            disabled={passwordSubmitting}
          >
            {passwordSubmitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Modifier le mot de passe
          </button>
        </SectionCard>

        <SectionCard
          title="Compte"
          description="Gérez votre compte JobTrace."
        >
          <div className="w-full grid items-stretch gap-4 lg:grid-cols-2">
            <div className="w-full h-full p-4 flex flex-col rounded-xl border border-base-300">
              <div>
                <h3 className="font-semibold">
                  Export des données
                </h3>

                <p className="mt-1 text-sm text-base-content/60">
                  Téléchargez une copie de l’ensemble des données associées à votre compte.
                </p>

                <button
                  className="link link-primary mt-1 text-left text-sm cursor-pointer"
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

            <div className="w-full h-full p-4 flex flex-col rounded-xl border border-error/40 bg-error/5">
              <div>
                <h3 className="font-semibold text-error">
                  Suppression du compte
                </h3>

                <p className="mt-1 text-sm text-base-content/70">
                  Cette action supprimera définitivement votre compte et les données associées.
                </p>

                <button
                  className="link link-error mt-1 block text-left text-sm cursor-pointer"
                  type="button"
                  onClick={openDeleteModal}
                >
                  Comprendre les conséquences de la suppression du compte.
                </button>
              </div>

              <div className="mt-auto pt-6">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <label className="form-control w-full">
                    <div className="relative">
                      <input
                        className="input input-bordered w-full pr-10"
                        type={getPasswordInputType(showDeletePassword)}
                        value={deletePassword}
                        onChange={handleDeletePasswordChange}
                        placeholder="Entrez votre mot de passe actuel"
                        autoComplete="current-password"
                        required
                      />

                      <button
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer"
                        type="button"
                        onClick={toggleDeletePasswordVisibility}
                        aria-label="Afficher ou masquer le mot de passe de suppression"
                      >
                        {showDeletePassword && (
                          <EyeOff className="w-4 h-4" />
                        )}

                        {!showDeletePassword && (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="form-control w-full">
                    <input
                      className="input input-bordered w-full"
                      type="text"
                      value={deleteConfirmation}
                      onChange={handleDeleteConfirmationChange}
                      placeholder="Tapez SUPPRIMER pour confirmer"
                      autoComplete="off"
                    />
                  </label>
                </div>

                <button
                  className="btn btn-error w-full mt-4 text-error-content"
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
        </SectionCard>
      </div>

      <LegalModal
        type={legalModalType}
        onClose={closeLegalModal}
        onOpenPrivacyModal={openPrivacyModal}
      />
    </section>
  );
}

export default SettingsPage;
