import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function LoginForm({ setMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const hasLength = password.length >= 6;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const isPasswordValid = hasLength && hasLower && hasUpper && hasDigit;

  // On successful login, close modal and redirect to dashboard.
  async function handleLogin(event) {
    event.preventDefault();

    const { error } = await login(email, password);

    if (!error) {
      document.getElementById("auth-modal").close();
      navigate("/dashboard");
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2 className="flex flex-row justify-center items-center gap-2 text-xl font-semibold">
        <LogIn /> Se connecter
      </h2>

      <form className="w-full" onSubmit={handleLogin}>
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
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-1">Mot de passe</label>

              {/* SWITCH TO: RESET PASSWORD */}
              <button className="mb-1 text-xs text-primary hover:underline cursor-pointer" type="button" onClick={function () { setMode("reset"); }}>
                Mot de passe oublié ?
              </button>
            </div>

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

          <button className="btn btn-primary w-full text-white border-none shadow-none">
            Se connecter
          </button>
        </fieldset>
      </form>

      {/* SWITCH TO: SIGNUP */}
      <button className="text-xs text-primary hover:underline cursor-pointer" onClick={function () { setMode("signup"); }}>
        Pas encore de compte ? Créez-en un
      </button>
    </div >
  );
}

export default LoginForm;
