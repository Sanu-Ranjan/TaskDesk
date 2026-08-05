import { NavLink } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/route";

const NAV_ITEMS = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: "bi-grid-1x2" },
  { label: "Project", to: ROUTES.PROJECT, icon: "bi-kanban" },
  { label: "Team", to: ROUTES.TEAM, icon: "bi-people" },
  { label: "Reports", to: ROUTES.REPORTS, icon: "bi-bar-chart" },
  { label: "Settings", to: ROUTES.SETTINGS, icon: "bi-gear" },
];

function Navigation() {
  const { logout } = useAuth();

  return (
    <nav
      className="d-flex flex-column bg-white border-end p-3 flex-shrink-0"
      style={{ width: 220, minHeight: "100vh" }}
    >
      <div className="fw-bold fs-5 text-primary mb-4 px-2">TaskDesk</div>

      <ul className="nav nav-pills flex-column gap-1 flex-grow-1">
        {NAV_ITEMS.map((item) => (
          <li className="nav-item" key={item.to}>
            {/* NavLink renders a real <a href>, so right-click /
                open-in-new-tab works natively */}
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${
                  isActive ? "active" : "text-dark"
                }`
              }
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        className="btn btn-outline-secondary btn-sm mt-3"
        onClick={logout}
      >
        <i className="bi bi-box-arrow-right me-1" />
        Logout
      </button>
    </nav>
  );
}

export default Navigation;
