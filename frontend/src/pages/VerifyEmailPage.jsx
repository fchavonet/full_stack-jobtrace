import { CheckCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { verifyUserEmail } from "../api/auth.api";
import { useToast } from "../hooks/useToast";

function VerifyEmailPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

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

  async function handleVerifyEmail() {
    const token = searchParams.get("token");

    if (!token) {
      showToast("Le lien de vérification est invalide.", "error");

      return;
    }

    try {
      setLoading(true);

      await verifyUserEmail(token);

      setVerified(true);
      showToast("Votre adresse email a été vérifiée.", "success");

      setTimeout(function () {
        closeCurrentTabOrRedirect();
      }, 3000);
    } catch {
      setLoading(false);
      showToast("Impossible de vérifier cette adresse email.", "error");
    }
  }

  let icon = <MailCheck className="h-12 w-12 text-primary" />;
  let title = "Vérifier votre adresse email";
  let description = "Cliquez pour activer votre compte JobTrace.";
  let buttonLabel = "Vérifier mon adresse email";

  if (loading) {
    title = "Vérification en cours";
    description = "Nous activons votre compte JobTrace.";
    buttonLabel = "Vérification...";
  }

  if (verified) {
    icon = <CheckCircle className="h-12 w-12 text-success" />;
    title = "Adresse email vérifiée";
    description = "Vous pouvez retourner JobTrace pour vous connecter.";
    buttonLabel = "Fermeture de cet onglet...";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4 text-base-content">
      <section className="w-full max-w-md rounded-2xl bg-base-100 p-6 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          {icon}
        </div>

        <h1 className="text-2xl font-bold">
          {title}
        </h1>

        <p className="mt-2 text-sm text-base-content/70">
          {description}
        </p>

        <button
          className="btn btn-primary mt-6 w-full"
          disabled={loading}
          type="button"
          onClick={handleVerifyEmail}
        >
          {loading && (
            <span className="loading loading-spinner loading-sm" />
          )}

          {buttonLabel}
        </button>
      </section>
    </main>
  );
}

export default VerifyEmailPage;
