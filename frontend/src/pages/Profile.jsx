import { useNavigate } from "react-router-dom";

import Navigation from "../components/Navigation";
import TopBar from "../components/TopBar";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/route";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="d-flex">
      <Navigation />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <TopBar />
        <main className="flex-grow-1 p-4 bg-light" style={{ minWidth: 0 }}>
          <h4 className="fw-bold mb-4">Settings</h4>

          <div className="card shadow-sm" style={{ maxWidth: 480 }}>
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <span
                  className="badge rounded-circle bg-primary fs-5"
                  style={{ width: 56, height: 56, lineHeight: "44px" }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </span>
                <div>
                  <div className="fw-bold fs-5">{user?.name}</div>
                  <div className="text-muted">{user?.email}</div>
                </div>
              </div>

              <dl className="row mb-4">
                <dt className="col-sm-4 text-muted">Name</dt>
                <dd className="col-sm-8">{user?.name}</dd>

                <dt className="col-sm-4 text-muted">Email</dt>
                <dd className="col-sm-8">{user?.email}</dd>
              </dl>

              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
