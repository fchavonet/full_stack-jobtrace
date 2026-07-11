function IconBox({
  icon: Icon,
  backgroundClassName = "bg-primary",
  iconClassName = "text-primary-content",
  containerClassName = "",
  size = 48,
  iconSize = 22,
}) {
  return (
    <div
      className={`shrink-0 flex justify-center items-center rounded-xl ${backgroundClassName} ${containerClassName}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-hidden="true"
    >
      <Icon
        className={iconClassName}
        width={iconSize}
        height={iconSize}
        strokeWidth={2}
      />
    </div>
  );
}

export default IconBox;
