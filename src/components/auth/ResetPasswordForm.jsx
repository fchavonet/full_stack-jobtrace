import { Check, Mail } from "lucide-react";
import { useState } from "react";

import { supabase } from "../../lib/supabase";

function ResetPasswordForm({ setMode }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Send reset password email.
  async function handleSubmit(event) {
    event.preventDefault();

    await supabase.auth.resetPasswordForEmail(email);

    setSent(true);
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2 className="flex flex-row justify-center items-center gap-2 text-xl font-semibold">
        <Mail /> Mot de passe oublié
      </h2>

      <fieldset className="fieldset w-full p-4 flex flex-col justify-center items-start gap-4 rounded-xl border border-base-300 bg-base-200">
        {sent ? (
          <div className="w-full flex flex-col justify-center items-center text-center gap-2">
            <Check className="text-success" size={34} />
            <p className="text-sm text-success">
              Un email de réinitialisation a été envoyé.
            </p>
          </div>
        ) : (
          <form className="w-full flex flex-col justify-center items-center gap-4" onSubmit={handleSubmit}>
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

            <button className="btn btn-primary w-full text-white border-none shadow-none">
              Envoyer
            </button>
          </form>
        )}
      </fieldset>

      <button className="text-xs text-primary hover:underline cursor-pointer" onClick={function () { setMode("login"); }}>
        Retour à la connexion
      </button>
    </div>
  );
}

export default ResetPasswordForm;
