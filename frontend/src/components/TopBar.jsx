import { useAuth } from "../contexts/AuthContext";

// Thin top bar showing who is logged in. Sits above the main content
// of a page (to the right of the sidebar).
function TopBar() {
  const { user } = useAuth();

  return (
    <div className="d-flex align-items-center justify-content-end bg-white border-bottom px-4 py-2">
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
    </div>
  );
}

export default TopBar;
