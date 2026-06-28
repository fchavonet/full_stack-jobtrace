function getSectionCardClassName(className) {
  let finalClassName = "w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm";

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

export function SectionCard({
  as: Component = "div",
  title,
  description,
  rightElement,
  children,
  className = "",
  contentClassName = "",
  ...props
}) {
  const hasHeader = Boolean(title || description || rightElement);

  return (
    <Component className={getSectionCardClassName(className)} {...props}>
      {hasHeader && (
        <div className="w-full flex flex-row justify-between items-start gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-xl font-bold text-base-content">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-base-content/60">
                {description}
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
          <h2 className="text-sm font-semibold text-base-content">
            {label}
          </h2>

          {helper && (
            <p className="mt-1 text-xs text-base-content/60">
              {helper}
            </p>
          )}
        </div>

        <p className="shrink-0 text-3xl font-black text-base-content">
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
          <div className="min-w-0">
            {title && (
              <h3 className="font-semibold text-base-content truncate">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-1 text-sm text-base-content/60 truncate">
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
