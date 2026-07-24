import { useNavigate } from "react-router-dom";

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
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h2>Profile</h2>

      <p>
        <strong>Name:</strong> {user?.name}
      </p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>

      <button onClick={handleLogout}>Log out</button>

      <pre style={{ background: "#f4f4f4", padding: 12, marginTop: 24 }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}

export default Profile;
