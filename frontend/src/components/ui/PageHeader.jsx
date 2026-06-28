function PageHeader({ title, description, actions, actionsClassName = "" }) {
  let finalActionsClassName = "w-full md:w-auto flex flex-col md:flex-row justify-start md:justify-end items-stretch md:items-center gap-2";

  if (actionsClassName) {
    finalActionsClassName = actionsClassName;
  }

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="min-w-0">
        <h1 className="text-4xl font-bold text-base-content">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-base text-base-content/70">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className={finalActionsClassName}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
