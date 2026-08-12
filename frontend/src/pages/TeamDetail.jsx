import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import TeamTasks from "../components/TeamTasks";
import { apiGet, apiPost, apiDelete } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { ROUTES } from "../constants/route";

function TeamDetail() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await apiGet(API_ENDPOINTS.TEAM.GET_TEAM_BY_ID(id));
      setTeam(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function handleRemove(userId) {
    try {
      await apiDelete(API_ENDPOINTS.TEAM.REMOVE_MEMBER(id, userId));
      loadTeam();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppLayout>
      <Link to={ROUTES.TEAM} className="text-decoration-none small">
        &larr; Back to Teams
      </Link>

      {loading && <p className="text-muted mt-3">Loading team...</p>}
      {error && <p className="text-danger mt-3">Error: {error}</p>}

      {!loading && !error && team && (
        <>
          <div className="d-flex align-items-center justify-content-between mt-3 mb-1">
            <h4 className="fw-bold mb-0">{team.name}</h4>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAdd(true)}
            >
              + Member
            </button>
          </div>
          <p className="text-muted">{team.description}</p>

          <h6 className="text-uppercase text-muted small mt-4 mb-3">Members</h6>

          {(team.members || []).length === 0 ? (
            <p className="text-muted">No members yet.</p>
          ) : (
            <ul className="list-group" style={{ maxWidth: 480 }}>
              {team.members.map((m) => (
                <li
                  key={m._id}
                  className="list-group-item d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <span
                      className="badge rounded-circle bg-secondary"
                      style={{ width: 32, height: 32, lineHeight: "24px" }}
                    >
                      {m.name?.[0]?.toUpperCase()}
                    </span>
                    <span>
                      {m.name}
                      <span className="text-muted small ms-2">{m.email}</span>
                    </span>
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(m._id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <TeamTasks teamId={id} />
        </>
      )}

      {showAdd && team && (
        <AddMemberModal
          teamId={id}
          currentMemberIds={(team.members || []).map((m) => m._id)}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            loadTeam();
          }}
        />
      )}
    </AppLayout>
  );
}

function AddMemberModal({ teamId, currentMemberIds, onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const body = await apiGet(API_ENDPOINTS.USERS.GET_ALL);
        // only users not already in the team
        setUsers(body.data.filter((u) => !currentMemberIds.includes(u._id)));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [currentMemberIds]);

  async function handleAdd() {
    if (!selected) return;
    setError("");
    setSaving(true);
    try {
      await apiPost(API_ENDPOINTS.TEAM.ADD_MEMBER(teamId), {
        userId: selected,
      });
      onAdded();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add New Member"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={saving || !selected}
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </>
      }
    >
      <label className="form-label">Select User</label>
      <select
        className="form-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Choose a user...</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>
      {users.length === 0 && (
        <p className="text-muted small mt-2 mb-0">
          All users are already members.
        </p>
      )}
      {error && <p className="text-danger mt-2 mb-0">{error}</p>}
    </Modal>
  );
}

export default TeamDetail;
