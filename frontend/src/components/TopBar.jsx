import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/route";

// Thin top bar showing who is logged in, with a logout button in the
// top-right corner. Sits above the main content of a page.
function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="d-flex align-items-center justify-content-end gap-3 bg-white border-bottom px-4 py-2">
      {user && (
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge rounded-circle bg-primary"
            style={{ width: 32, height: 32, lineHeight: "24px" }}
          >
            {user.name?.[0]?.toUpperCase()}
          </span>
          <div className="lh-sm">
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
  );
}

export default TopBar;
