import { Mail } from "lucide-react";
import { useState } from "react";

import { requestPasswordReset } from "../../api/auth.api";
import { useToast } from "../../hooks/useToast";

function ForgotPasswordForm({ setMode }) {
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
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

  let emailClassName = "input w-full";
  let submitLabel = "Envoyer le lien";

  if (isEmailInvalid) {
    emailClassName = "input input-error w-full";
  }

  if (isEmailValid) {
    emailClassName = "input input-success w-full";
  }

  if (loading) {
    submitLabel = "Envoi...";
  }

  function getForgotPasswordErrorMessage(error) {
    if (!error || !error.message) {
      return "Impossible de traiter la demande pour le moment.";
    }

    if (error.message === "Email is required.") {
      return "L’adresse email est obligatoire.";
    }

    if (error.message === "Email is invalid.") {
      return "L’adresse email est invalide.";
    }

    return "Impossible de traiter la demande pour le moment.";
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

    try {
      setLoading(true);

      await requestPasswordReset({
        email: trimmedEmail,
      });

      showToast("Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.", "success");
      setEmail("");
      setMode("login");
    } catch (error) {
      showToast(getForgotPasswordErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
          <Mail className="h-6 w-6 text-primary" />
          Mot de passe oublié
        </h2>

        <p className="mt-1 text-sm text-base-content/70">
          Recevez un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="label mb-1" htmlFor="forgot-password-email">
            Email
          </label>

          <input
            id="forgot-password-email"
            className={emailClassName}
            type="email"
            autoComplete="email"
            placeholder="Entrer un email valide"
            value={email}
            onChange={function (event) {
              setEmail(event.target.value);
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
        Retour à la connexion
      </button>
    </div>
  );
}

export default ForgotPasswordForm;
