import { NavLink } from "react-router-dom";

const BASE_LINK_CLASS = "w-full px-4 py-2 flex items-center justify-start gap-2 text-sm font-medium rounded-lg";

function getNavLinkClassName({ isActive }) {
  if (isActive) {
    return BASE_LINK_CLASS + " text-primary-content bg-primary";
  }

  return BASE_LINK_CLASS + " text-base-content/80 hover:text-primary-content hover:bg-primary";
}

function getDisabledClassName() {
  return BASE_LINK_CLASS + " w-full text-base-content/40 cursor-not-allowed";
}

function SidebarNavItem({ item, onClick }) {
  const Icon = item.Icon;

  if (item.disabled) {
    return (
      <li>
        <button className={getDisabledClassName()} type="button" disabled>
          <Icon className="w-4 h-4" />
          <span>{item.label}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <NavLink className={getNavLinkClassName} end={item.end} to={item.path} onClick={onClick}>
        <Icon className="w-4 h-4" />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

export default SidebarNavItem;
