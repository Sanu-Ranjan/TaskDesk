import { NavLink, Link } from "react-router-dom";

import { ROUTES } from "../constants/route";

const NAV_ITEMS = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: "bi-grid-1x2" },
  { label: "Project", to: ROUTES.PROJECT, icon: "bi-kanban" },
  { label: "Team", to: ROUTES.TEAM, icon: "bi-people" },
  { label: "Reports", to: ROUTES.REPORTS, icon: "bi-bar-chart" },
  { label: "Settings", to: ROUTES.SETTINGS, icon: "bi-gear" },
];

// Sidebar. On large screens it's a static column. On small screens it
// becomes a fixed off-canvas drawer controlled by `open`, with a
// backdrop; `onClose` fires when a link or the backdrop is tapped.
function Navigation({ open, onClose }) {
  return (
    <>
      {/* backdrop on mobile when the drawer is open */}
      {open && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <nav
        className={`d-flex flex-column bg-white border-end p-3 flex-shrink-0 taskdesk-sidebar ${
          open ? "is-open" : ""
        }`}
      >
        <Link
          to={ROUTES.DASHBOARD}
          className="fw-bold fs-5 text-primary mb-4 px-2 text-decoration-none"
          onClick={onClose}
        >
          TaskDesk
        </Link>

        <ul className="nav nav-pills flex-column gap-1 flex-grow-1">
          {NAV_ITEMS.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
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
      </nav>
    </>
  );
}

export default Navigation;
