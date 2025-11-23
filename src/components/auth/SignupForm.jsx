import { Check, Eye, EyeOff, UserRoundPlus, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";

// Renders password rule with its valid state.
function Requirement({ label, valid, className = "" }) {
  return (
    <div className={`flex flex-row justify-start items-center gap-2 ${className}`}>
      {valid ? <Check className="text-success" size={16} /> : <X className="text-error" size={16} />}
      <span className={valid ? "text-success" : "text-error"}>{label}</span>
    </div>
  );
}

function SignupForm({ setMode }) {
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState("");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const hasLength = password.length >= 6;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const isPasswordValid = hasLength && hasLower && hasUpper && hasDigit;

  const passwordsMatch = password === confirm && confirm !== "";

  async function handleSignup(event) {
    event.preventDefault();

    const { data, error } = await signup(email, password);

    if (data?.user?.identities?.length === 0) {
      return;
    }

    if (error) {
      return;
    }

    setMode("login");
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2 className="flex flex-row justify-center items-center gap-2 text-xl font-semibold">
        <UserRoundPlus /> Créer un compte
      </h2>

      <form className="w-full" onSubmit={handleSignup}>
        <fieldset className="fieldset w-full p-4 flex flex-col justify-center items-start gap-4 rounded-xl border border-base-300 bg-base-200">
          {/* EMAIL */}
          <div className="w-full">
            <label className="label mb-1">Email</label>

            <input
              className={`input validator w-full ${email.length === 0 ? "" : isEmailValid ? "input-success" : "input-error"}`}
              type="email"
              required
              autoComplete="off"
              placeholder="Email..."
              value={email}
              onChange={function (event) { setEmail(event.target.value); }}
            />
          </div>

          {/* PASSWORD */}
          <div className="w-full">
            <label className="label mb-1">Mot de passe</label>

            <div className="relative w-full">
              <input
                className={`input validator w-full pr-10 ${password.length === 0 ? "" : isPasswordValid ? "input-success" : "input-error"}`}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="off"
                placeholder="Mot de passe..."
                value={password}
                onChange={function (event) { setPassword(event.target.value); }}
              />

              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer z-50" type="button" onClick={function () { setShowPassword(!showPassword); }}>
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

            <input
              className={`input validator w-full ${confirm.length === 0 ? "" : passwordsMatch ? "input-success" : "input-error"}`}
              type={showPassword ? "text" : "password"}
              required
              autoComplete="off"
              placeholder="Confirmer le mot de passe..."
              value={confirm}
              onChange={function (event) { setConfirm(event.target.value); }}
            />
          </div>

          {/* SUBMIT */}
          <button className="btn btn-primary w-full text-white border-none shadow-none">
            Créer un compte
          </button>
        </fieldset>
      </form>

      {/* SWITCH TO: LOGIN */}
      <button className="text-xs text-primary hover:underline cursor-pointer" onClick={function () { setMode("login"); }}>
        Déjà un compte ? Connectez-vous
      </button>
    </div>
  );
}

export default SignupForm;
