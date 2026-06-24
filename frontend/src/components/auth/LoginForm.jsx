import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

function LoginForm({ setMode, closeModal }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const hasPassword = password.length > 0;

  let emailClassName = "input w-full";
  let passwordClassName = "input w-full pr-10";
  let passwordInputType = "password";
  let submitLabel = "Se connecter";
  let passwordIcon = <Eye className="h-4 w-4" />;

  if (isEmailInvalid) {
    emailClassName = "input input-error w-full";
  }

  if (isEmailValid) {
    emailClassName = "input input-success w-full";
  }

  if (hasPassword) {
    passwordClassName = "input input-success w-full pr-10";
  }

  if (showPassword) {
    passwordInputType = "text";
    passwordIcon = <EyeOff className="h-4 w-4" />;
  }

  if (loading) {
    submitLabel = "Connexion...";
  }

  function getLoginErrorMessage(error) {
    if (!error || !error.message) {
      return "Impossible de se connecter pour le moment.";
    }

    if (error.message === "Invalid credentials.") {
      return "Identifiants incorrects.";
    }

    if (error.message === "Email must be verified before login.") {
      return "Votre adresse email doit être vérifiée avant la connexion.";
    }

    if (error.message === "Email is required.") {
      return "L’adresse email est obligatoire.";
    }

    if (error.message === "Password is required.") {
      return "Le mot de passe est obligatoire.";
    }

    return "Impossible de se connecter pour le moment.";
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

    if (!hasPassword) {
      showToast("Le mot de passe est obligatoire.", "error");

      return;
    }

    try {
      setLoading(true);

      await login({
        email: trimmedEmail,
        password,
      });

      showToast("Connexion réussie.", "success");

      if (closeModal) {
        closeModal();
      }

      navigate("/dashboard");
    } catch (error) {
      showToast(getLoginErrorMessage(error), "error");
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
        <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
          <LogIn className="h-6 w-6 text-primary" />
          Se connecter
        </h2>

        <p className="mt-1 text-sm text-base-content/70">
          Accédez à votre espace JobTrace.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="label mb-1" htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            className={emailClassName}
            type="email"
            autoComplete="email"
            placeholder="Entrer votre email"
            value={email}
            onChange={function (event) {
              setEmail(event.target.value);
            }}
          />
        </div>

        <div>
          <label className="label mb-1" htmlFor="login-password">
            Mot de passe
          </label>

          <div className="relative">
            <input
              id="login-password"
              className={passwordClassName}
              type={passwordInputType}
              autoComplete="current-password"
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

        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          {submitLabel}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button
          className="text-primary hover:underline cursor-pointer"
          type="button"
          onClick={function () {
            setMode("forgot-password");
          }}
        >
          Mot de passe oublié ?
        </button>

        <button
          className="text-primary hover:underline cursor-pointer"
          type="button"
          onClick={function () {
            setMode("signup");
          }}
        >
          Pas encore de compte ? Créez-en un
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
