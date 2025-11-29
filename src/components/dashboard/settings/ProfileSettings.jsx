import { Save, Trash2, UserRoundPen } from "lucide-react";
import { useState, useMemo } from "react";

import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Extract user profile metadata (first/last name).
  const meta = user?.user_metadata || {};

  // Initial values derived from user metadata.
  const defaultFirst = useMemo(function () {
    if (meta.first_name) return meta.first_name;

    return "";
  }, [meta.first_name]);

  const defaultLast = useMemo(function () {
    if (meta.last_name) return meta.last_name;

    return "";
  }, [meta.last_name]);

  // Controlled fields.
  const [first, setFirst] = useState(defaultFirst);
  const [last, setLast] = useState(defaultLast);

  // Keep only letters (with accents), spaces and hyphens.
  function sanitizeLetters(value) {
    return value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, "");
  }

  // DaisyUI validation classes.
  function getValidatorClass(value) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return "input-error";
    }

    return "input-success";
  }

  // Update user names.
  async function handleSubmit(event) {
    event.preventDefault();

    const f = first.trim();
    const l = last.trim();

    if (f.length === 0) {
      showToast("Le prénom est obligatoire.", "error");

      return;
    }

    if (l.length === 0) {
      showToast("Le nom est obligatoire.", "error");

      return;
    }

    const result = await updateProfile(f, l);

    if (result.error) {
      showToast("Erreur lors de l’enregistrement.", "error");

      return;
    }

    showToast("Profil mis à jour avec succès.", "success");
  }

  // Reset profile names.
  async function handleClear() {

    const result = await updateProfile("", "");

    if (result.error) {
      showToast("Impossible de réinitialiser.", "error");

      return;
    }

    // Reset local fields.
    setFirst("");
    setLast("");

    showToast("Nom et prénom effacés. L’email sera utilisé.", "warning");
  }

  return (
    <div className="card w-full p-4 border border-base-300 bg-base-100 rounded-2xl">
      <h3 className="card-title flex flex-row justify-center items-center gap-2">
        <UserRoundPen /> Profil utilisateur
      </h3>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="fieldset w-full p-4 flex flex-col justify-center items-start gap-4 rounded-xl border border-base-300 bg-base-200">
          <div className="w-full flex flex-col justify-center items-center gap-2">
            {/* FIRST NAME */}
            <div className="w-full">
              <label className="label mb-1">Prénom</label>

              <input
                className={"input validator w-full " + getValidatorClass(first)}
                maxLength={30}
                placeholder="Prénom…"
                value={first}
                onChange={function (event) { const clean = sanitizeLetters(event.target.value); setFirst(clean); }}
              />
            </div>

            {/* LAST NAME */}
            <div className="w-full">
              <label className="label mb-1">Nom</label>

              <input
                className={"input validator w-full " + getValidatorClass(last)}
                maxLength={40}
                placeholder="Votre nom…"
                value={last}
                onChange={function (event) { const clean = sanitizeLetters(event.target.value); setLast(clean); }}
              />
            </div>
          </div>

          <div className="w-full flex flex-col justify-center items-start gap-2">
            <button className="w-full lg:w-56 btn btn-primary text-white border-none shadow-none">
              <Save size="20" /> Enregistrer
            </button>

            <button className="w-full lg:w-56 btn btn-secondary texte-white border-none shadow-none" type="button" onClick={handleClear}>
              <Trash2 size="20" /> Effacer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettings;
