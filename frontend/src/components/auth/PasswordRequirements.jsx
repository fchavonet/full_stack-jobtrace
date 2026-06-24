import { Check, X } from "lucide-react";

function PasswordRequirement({ label, isValid }) {
  let icon = <X className="h-4 w-4 text-error" />;
  let textClassName = "text-error";

  if (isValid) {
    icon = <Check className="h-4 w-4 text-success" />;
    textClassName = "text-success";
  }

  return (
    <div className="flex flex-row justify-start items-center gap-2 text-xs">
      {icon}

      <span className={textClassName}>
        {label}
      </span>
    </div>
  );
}

function PasswordRequirements({ password, passwordConfirmation }) {
  const hasLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const passwordsMatch = password === passwordConfirmation && passwordConfirmation.length > 0;

  return (
    <div className="p-4 rounded-xl border border-base-300 bg-base-200">
      <p className="mb-2 text-xs text-base-content/70">
        Le mot de passe doit contenir :
      </p>

      <div className="flex flex-col justify-center items-start gap-1">
        <PasswordRequirement
          isValid={hasLength}
          label="Au moins 6 caractères"
        />

        <PasswordRequirement
          isValid={hasLowercase}
          label="Une lettre minuscule"
        />

        <PasswordRequirement
          isValid={hasUppercase}
          label="Une lettre majuscule"
        />

        <PasswordRequirement
          isValid={hasDigit}
          label="Un chiffre"
        />
      </div>

      <hr className="my-2 border-t border-base-content/20" />

      <div>
        <PasswordRequirement
          isValid={passwordsMatch}
          label="Les mots de passe doivent être identiques."
        />
      </div>
    </div>
  );
}

export default PasswordRequirements;
