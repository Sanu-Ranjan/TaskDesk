import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/route";

// Top bar: hamburger (mobile only) on the left, logged-in user and
// logout on the right.
function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="d-flex align-items-center bg-white border-bottom px-3 px-md-4 py-2">
      <button
        className="btn btn-sm btn-outline-secondary border-0 d-lg-none me-2"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <i className="bi bi-list fs-4" />
      </button>

      <div className="d-flex align-items-center gap-3 ms-auto">
        {user && (
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-circle bg-primary"
              style={{ width: 32, height: 32, lineHeight: "24px" }}
            >
              {user.name?.[0]?.toUpperCase()}
            </span>
            <div className="lh-sm d-none d-sm-block">
              <div className="fw-semibold small">{user.name}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <button
          className="btn btn-sm btn-outline-secondary border-0"
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
        >
          <i className="bi bi-box-arrow-right fs-5" />
        </button>
      </div>
    </div>
  );
}

export default TopBar;
