function getSectionCardClassName(className) {
  let finalClassName = "w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm";

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getSectionCardHeaderClassName(centered) {
  if (centered) {
    return "w-full flex flex-col justify-center items-center gap-1 text-center";
  }

  return "w-full flex flex-row justify-between items-start gap-4";
}

function getSectionCardTitleBlockClassName(centered) {
  if (centered) {
    return "w-full min-w-0";
  }

  return "w-full min-w-0 flex-1";
}

function getSectionCardRightElementClassName(centered, className) {
  let finalClassName = "shrink-0";

  if (centered) {
    finalClassName = finalClassName + " mt-2";
  }

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getSectionCardContentClassName(hasHeader, className) {
  let finalClassName = "w-full";

  if (hasHeader) {
    finalClassName = finalClassName + " mt-6";
  }

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getMetricCardClassName(className) {
  let finalClassName = "w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm";

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getItemCardClassName(className, interactive) {
  let finalClassName = "w-full min-w-0 p-4 rounded-xl bg-base-200";

  if (interactive) {
    finalClassName = finalClassName + " hover:bg-base-300 cursor-pointer";
  }

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getProgressItemCardValueClassName(className) {
  let finalClassName = "shrink-0 text-2xl font-black text-base-content";

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

export function SectionCard({
  as: Component = "div",
  title,
  description,
  rightElement,
  children,
  className = "",
  contentClassName = "",
  rightElementClassName = "",
  centered = false,
  ...props
}) {
  const hasHeader = Boolean(title || description || rightElement);

  return (
    <Component className={getSectionCardClassName(className)} {...props}>
      {hasHeader && (
        <div className={getSectionCardHeaderClassName(centered)}>
          <div className={getSectionCardTitleBlockClassName(centered)}>
            {title && (
              <h2 className="text-lg font-semibold text-base-content truncate">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-sm text-base-content/60 truncate">
                {description}
              </p>
            )}
          </div>

          {rightElement && (
            <div className={getSectionCardRightElementClassName(centered, rightElementClassName)}>
              {rightElement}
            </div>
          )}
        </div>
      )}

      {children && (
        <div className={getSectionCardContentClassName(hasHeader, contentClassName)}>
          {children}
        </div>
      )}
    </Component>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  className = "",
}) {
  return (
    <div className={getMetricCardClassName(className)}>
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-base-content truncate">
            {label}
          </h2>

          {helper && (
            <p className="mt-1 text-xs text-base-content/60 truncate">
              {helper}
            </p>
          )}
        </div>

        <p className="shrink-0 text-2xl md:text-4xl font-black text-base-content">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ItemCard({
  as: Component = "div",
  title,
  subtitle,
  rightElement,
  children,
  className = "",
  interactive = false,
  ...props
}) {
  return (
    <Component className={getItemCardClassName(className, interactive)} {...props}>
      {children && (
        <>
          {children}
        </>
      )}

      {!children && (
        <div className="w-full min-w-0 flex flex-row justify-between items-center gap-4">
          <div className="w-full min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-semibold text-base-content truncate">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-1 text-xs text-base-content/60 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {rightElement && (
            <div className="shrink-0">
              {rightElement}
            </div>
          )}
        </div>
      )}
    </Component>
  );
}

export function ProgressItemCard({
  title,
  subtitle,
  value,
  progressWidth,
  className = "",
  valueClassName = "",
}) {
  return (
    <ItemCard className={className}>
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-base-content">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-base-content/60">
              {subtitle}
            </p>
          )}
        </div>

        <p className={getProgressItemCardValueClassName(valueClassName)}>
          {value}
        </p>
      </div>

      <div className="w-full h-2 mt-4 rounded-full bg-base-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: progressWidth }}
        />
      </div>
    </ItemCard>
  );
}

export function ActiveFilterCard({
  title = "Filtre actif",
  description = "Cliquez sur le bouton de droite pour désactiver le filtre.",
  actionLabel = "Afficher toutes",
  onClear,
  className = "",
}) {
  return (
    <SectionCard className={className}>
      <div className="w-full min-w-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-base-content">
            {title}
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            {description}
          </p>
        </div>

        <button className="btn btn-ghost btn-sm w-full md:w-auto shrink-0 cursor-pointer" type="button" onClick={onClear}>
          {actionLabel}
        </button>
      </div>
    </SectionCard>
  );
}