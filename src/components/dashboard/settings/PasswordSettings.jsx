import { Check, Eye, EyeOff, Save, LockKeyhole, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

// Renders password rule with its valid state.
function Requirement({ label, valid, className = "" }) {
  return (
    <div className={`flex flex-row justify-start items-center gap-2 ${className}`}>
      {valid ? <Check className="text-success" size={16} /> : <X className="text-error" size={16} />}
      <span className={valid ? "text-success" : "text-error"}>{label}</span>
    </div>
  );
}

function PasswordSettings() {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState("");

  const hasLength = password.length >= 6;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const isPasswordValid = hasLength && hasLower && hasUpper && hasDigit;

  const passwordsMatch = password === confirm && confirm !== "";

  function translateSignupError(error) {
    if (!error || !error.message) {
      return "Une erreur inconnue est survenue.";
    }

    const message = error.message.toLowerCase();

    if (message.includes("user already registered")) {
      return "Un compte existe déjà avec cette adresse email.";
    }

    if (message.includes("invalid email")) {
      return "L’adresse email est invalide.";
    }

    if (message.includes("password")) {
      return "Le mot de passe ne respecte pas les critères requis.";
    }

    if (message.includes("rate limit") || message.includes("too many")) {
      return "Trop de tentatives. Veuillez réessayer plus tard.";
    }

    return "Une erreur est survenue : " + error.message;
  }

  // Update user password.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!isPasswordValid) {
      showToast("Le mot de passe ne respecte pas les critères.", "error");
      return;
    }

    if (!passwordsMatch) {
      showToast("Les deux mots de passe ne correspondent pas.", "error");
      return;
    }

    const { error } = await updatePassword(password);

    if (error) {
      if (error.message && error.message.toLowerCase().includes("different")) {
        showToast("Le nouveau mot de passe doit être différent de l'ancien.", "error");
        return;
      }

      const translated = translateSignupError(error);
      showToast(translated, "error");
      return;
    }

    showToast("Mot de passe mis à jour avec succès.", "success");

    setPassword("");
    setConfirm("");
  }

  return (
    <div id="password" className="card w-full p-4 border border-base-300 bg-base-100 rounded-2xl">
      <h3 className="card-title flex flex-row justify-center items-center gap-2">
        <LockKeyhole /> Mot de passe
      </h3>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="fieldset w-full p-4 flex flex-col justify-center items-start gap-4 rounded-xl border border-base-300 bg-base-200">
          <div className="w-full flex flex-col justify-center items-center gap-2">
            {/* PASSWORD */}
            <div className="w-full">
              <label className="label mb-1">Nouveau mot de passe</label>

              <div className="relative w-full">
                <input
                  className={`input validator w-full pr-10 ${password.length === 0 ? "" : isPasswordValid ? "input-success" : "input-error"}`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Nouveau mot de passe..."
                  value={password}
                  onChange={function (event) { setPassword(event.target.value); }}
                />

                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer" type="button" onClick={function () { setShowPassword(!showPassword); }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* REQUIREMENTS */}
            <div className="w-full">
              <Requirement label="Au moins 6 caractères" valid={hasLength} />
              <Requirement label="Une lettre minuscule" valid={hasLower} />
              <Requirement label="Une lettre majuscule" valid={hasUpper} />
              <Requirement label="Un chiffre" valid={hasDigit} />

              <Requirement label="Les deux mots de passe correspondent" valid={passwordsMatch} className="mt-2" />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="w-full">
              <label className="label mb-1">Confirmer le mot de passe</label>

              <div className="w-full">
                <input
                  className={`input validator w-full ${confirm.length === 0 ? "" : passwordsMatch ? "input-success" : "input-error"}`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={function (event) { setConfirm(event.target.value); }}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col justify-center items-start gap-2">
            <button className="w-full lg:w-56 btn btn-primary text-white border-none shadow-none">
              <Save size="20" /> Mettre à jour
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default PasswordSettings;
