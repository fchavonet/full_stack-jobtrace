function getBadgeColorClassName(color) {
  if (color === "primary") {
    return "bg-primary text-primary-content";
  }

  if (color === "secondary") {
    return "bg-secondary text-secondary-content";
  }

  if (color === "accent") {
    return "bg-accent text-accent-content";
  }

  if (color === "info") {
    return "bg-info text-info-content";
  }

  if (color === "success") {
    return "bg-success text-success-content";
  }

  if (color === "warning") {
    return "bg-warning text-warning-content";
  }

  if (color === "error") {
    return "bg-error text-error-content";
  }

  if (color === "neutral") {
    return "bg-neutral text-neutral-content";
  }

  return "bg-base-200 text-base-content";
}

function getBadgeClassName(color, className, interactive) {
  let finalClassName = "max-w-full min-w-0 shrink-0 px-2 py-1 inline-flex flex-row justify-center items-center gap-2 rounded-sm text-xs font-semibold leading-none text-center";

  finalClassName = finalClassName + " " + getBadgeColorClassName(color);

  if (interactive) {
    finalClassName = finalClassName + " hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer";
  }

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function BadgeContent({ icon: Icon, label }) {
  return (
    <>
      {Icon && (
        <Icon className="w-4 h-4 shrink-0" />
      )}

      <span className="min-w-0 text-center truncate">
        {label}
      </span>
    </>
  );
}

function Badge({
  label,
  color = "base",
  href = "",
  onClick,
  icon,
  className = "",
  title = "",
}) {
  const interactive = Boolean(href || onClick);
  const finalClassName = getBadgeClassName(color, className, interactive);
  const finalTitle = title || label;

  if (href) {
    return (
      <a
        className={finalClassName}
        href={href}
        title={finalTitle}
      >
        <BadgeContent
          icon={icon}
          label={label}
        />
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        className={finalClassName}
        type="button"
        title={finalTitle}
        onClick={onClick}
      >
        <BadgeContent
          icon={icon}
          label={label}
        />
      </button>
    );
  }

  return (
    <span
      className={finalClassName}
      title={finalTitle}
    >
      <BadgeContent
        icon={icon}
        label={label}
      />
    </span>
  );
}

export default Badge;
