import { Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import PasswordRequirements from "./PasswordRequirements";

function SignupForm({ setMode }) {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const trimmedEmail = email.trim();
  const hasEmail = trimmedEmail.length > 0;
  const atIndex = trimmedEmail.indexOf("@");
  const dotIndex = trimmedEmail.lastIndexOf(".");

  const isEmailValid =
    hasEmail &&
    atIndex > 0 &&
    dotIndex > atIndex + 1 &&
    dotIndex < trimmedEmail.length - 1;

  const isEmailInvalid = hasEmail && !isEmailValid;

  const hasLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const isPasswordValid = hasLength && hasLowercase && hasUppercase && hasDigit;
  const hasPassword = password.length > 0;

  const hasPasswordConfirmation = passwordConfirmation.length > 0;
  const passwordsDoNotMatch = hasPasswordConfirmation && password !== passwordConfirmation;
  const passwordsMatch = hasPasswordConfirmation && password === passwordConfirmation;

  let emailClassName = "input w-full";
  let passwordClassName = "input w-full pr-10";
  let passwordConfirmationClassName = "input w-full";
  let passwordInputType = "password";
  let submitLabel = "Créer le compte";
  let passwordIcon = <Eye className="h-4 w-4" />;

  if (isEmailInvalid) {
    emailClassName = "input input-error w-full";
  }

  if (isEmailValid) {
    emailClassName = "input input-success w-full";
  }

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
    submitLabel = "Création...";
  }

  function getSignupErrorMessage(error) {
    if (!error || !error.message) {
      return "Impossible de créer le compte pour le moment.";
    }

    if (error.message === "Email is already registered.") {
      return "Un compte existe déjà avec cette adresse email.";
    }

    if (error.message === "Email is invalid.") {
      return "L’adresse email est invalide.";
    }

    if (error.message === "Email is required.") {
      return "L’adresse email est obligatoire.";
    }

    if (error.message === "Password is required.") {
      return "Le mot de passe est obligatoire.";
    }

    if (error.message === "Password must contain at least 6 characters, one lowercase letter, one uppercase letter and one digit.") {
      return "Le mot de passe ne respecte pas les critères requis.";
    }

    return "Impossible de créer le compte pour le moment.";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasEmail) {
      showToast("L’adresse email est obligatoire.", "error");

      return;
    }

    if (!isEmailValid) {
      showToast("L’adresse email est invalide.", "error");

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

      await register({
        email: trimmedEmail,
        password,
      });

      showToast("Compte créé. Vérifiez votre email pour activer votre compte.", "success");

      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
      setMode("login");
    } catch (error) {
      showToast(getSignupErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  function handleTogglePassword() {
    setShowPassword(function (currentValue) {
      return !currentValue;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="flex justify-center items-center gap-2 text-xl font-semibold">
          <UserRoundPlus className="h-6 w-6 text-primary" />
          Créer un compte
        </h2>

        <p className="text-sm text-base-content/70">
          Créez votre compte pour suivre vos candidatures.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="label mb-1" htmlFor="signup-email">
            Email
          </label>

          <input
            id="signup-email"
            className={emailClassName}
            type="email"
            autoComplete="off"
            placeholder="Entrer un email valide"
            value={email}
            onChange={function (event) {
              setEmail(event.target.value);
            }}
          />
        </div>

        <div className="mb-1">
          <label className="label mb-1" htmlFor="signup-password">
            Mot de passe
          </label>

          <div className="relative">
            <input
              id="signup-password"
              className={passwordClassName}
              type={passwordInputType}
              autoComplete="off"
              placeholder="Entrer votre mot de passe"
              value={password}
              onChange={function (event) {
                setPassword(event.target.value);
              }}
            />

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer"
              type="button"
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
          <label className="label mb-1" htmlFor="signup-password-confirmation">
            Confirmer le mot de passe
          </label>

          <input
            id="signup-password-confirmation"
            className={passwordConfirmationClassName}
            type={passwordInputType}
            autoComplete="new-password"
            placeholder="Confirmer votre mot de passe"
            value={passwordConfirmation}
            onChange={function (event) {
              setPasswordConfirmation(event.target.value);
            }}
          />
        </div>

        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          {submitLabel}
        </button>
      </form>

      <button
        className="text-sm text-primary hover:underline cursor-pointer"
        type="button"
        onClick={function () {
          setMode("login");
        }}
      >
        Déjà un compte ? Connectez-vous
      </button>
    </div>
  );
}

export default SignupForm;
