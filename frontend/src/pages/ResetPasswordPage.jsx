import { CheckCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../api/auth.api";
import PasswordRequirements from "../components/auth/PasswordRequirements";
import { useToast } from "../hooks/useToast";

function ResetPasswordPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const hasLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const isPasswordValid = hasLength && hasLowercase && hasUppercase && hasDigit;
  const hasPassword = password.length > 0;

  const hasPasswordConfirmation = passwordConfirmation.length > 0;
  const passwordsDoNotMatch = hasPasswordConfirmation && password !== passwordConfirmation;
  const passwordsMatch = hasPasswordConfirmation && password === passwordConfirmation;

  let icon = <KeyRound className="h-12 w-12 text-primary" />;
  let title = "Réinitialiser votre mot de passe";
  let description = "Choisissez un nouveau mot de passe.";
  let passwordClassName = "input w-full pr-10";
  let passwordConfirmationClassName = "input w-full";
  let passwordInputType = "password";
  let submitLabel = "Réinitialiser le mot de passe";
  let passwordIcon = <Eye className="h-4 w-4" />;

  if (hasPassword && !isPasswordValid) {
    passwordClassName = "input input-error w-full pr-10";
  }

  if (hasPassword && isPasswordValid) {
    passwordClassName = "input input-success w-full pr-10";
  }

  if (passwordsDoNotMatch) {
    passwordConfirmationClassName = "input input-error w-full";
  }

  if (passwordsMatch) {
    passwordConfirmationClassName = "input input-success w-full";
  }

  if (showPassword) {
    passwordInputType = "text";
    passwordIcon = <EyeOff className="h-4 w-4" />;
  }

  if (loading) {
    title = "Réinitialisation en cours";
    description = "Nous mettons à jour votre mot de passe.";
    submitLabel = "Réinitialisation...";
  }

  if (passwordUpdated) {
    icon = <CheckCircle className="h-12 w-12 text-success" />;
    title = "Mot de passe réinitialisé";
    description = "Vous pouvez retourner sur votre onglet JobTrace pour vous connecter.";
    submitLabel = "Fermeture de cet onglet...";
  }

  function redirectToLogin() {
    navigate("/", {
      replace: true,
      state: {
        openAuthModal: true,
        authMode: "login",
      },
    });
  }

  function closeCurrentTabOrRedirect() {
    window.close();

    setTimeout(function () {
      redirectToLogin();
    }, 250);
  }

  function getResetPasswordErrorMessage(error) {
    if (!error || !error.message) {
      return "Impossible de réinitialiser le mot de passe pour le moment.";
    }

    if (error.message === "Reset token is invalid or expired.") {
      return "Le lien de réinitialisation est invalide ou expiré.";
    }

    if (error.message === "Password is required.") {
      return "Le nouveau mot de passe est obligatoire.";
    }

    if (error.message === "Password must contain at least 6 characters, one lowercase letter, one uppercase letter and one digit.") {
      return "Le mot de passe ne respecte pas les critères requis.";
    }

    return "Impossible de réinitialiser le mot de passe pour le moment.";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = searchParams.get("token");

    if (!token) {
      showToast("Le lien de réinitialisation est invalide.", "error");

      return;
    }

    if (!isPasswordValid) {
      showToast("Le mot de passe ne respecte pas les critères requis.", "error");

      return;
    }

    if (!passwordsMatch) {
      showToast("Les deux mots de passe ne correspondent pas.", "error");

      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        token,
        password,
      });

      setPasswordUpdated(true);
      setPassword("");
      setPasswordConfirmation("");
      showToast("Votre mot de passe a été réinitialisé.", "success");

      setTimeout(function () {
        closeCurrentTabOrRedirect();
      }, 3000);
    } catch (error) {
      setLoading(false);
      showToast(getResetPasswordErrorMessage(error), "error");
    }
  }

  function handleTogglePassword() {
    setShowPassword(function (currentValue) {
      return !currentValue;
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4 text-base-content">
      <section className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          {icon}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {title}
          </h1>

          <p className="mt-2 text-sm text-base-content/70">
            {description}
          </p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="mb-1">
            <label className="label mb-1" htmlFor="reset-password">
              Nouveau mot de passe
            </label>

            <div className="relative">
              <input
                id="reset-password"
                className={passwordClassName}
                type={passwordInputType}
                autoComplete="off"
                placeholder="Entrer votre mot de passe"
                value={password}
                disabled={loading}
                onChange={function (event) {
                  setPassword(event.target.value);
                }}
              />

              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-base-content/60 hover:text-base-content"
                type="button"
                disabled={loading}
                onClick={handleTogglePassword}
              >
                {passwordIcon}
              </button>
            </div>
          </div>

          <PasswordRequirements
            password={password}
            passwordConfirmation={passwordConfirmation}
          />

          <div>
            <label className="label mb-1" htmlFor="reset-password-confirmation">
              Confirmer le mot de passe
            </label>

            <input
              id="reset-password-confirmation"
              className={passwordConfirmationClassName}
              type={passwordInputType}
              autoComplete="new-password"
              placeholder="Confirmer votre mot de passe"
              value={passwordConfirmation}
              disabled={loading}
              onChange={function (event) {
                setPasswordConfirmation(event.target.value);
              }}
            />
          </div>

          <button className="btn btn-primary w-full" disabled={loading} type="submit">
            {loading && (
              <span className="loading loading-spinner loading-sm" />
            )}

            {submitLabel}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
