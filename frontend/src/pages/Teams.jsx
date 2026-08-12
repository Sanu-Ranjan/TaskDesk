import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import { apiGet, apiPost, apiDelete } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { ROUTES } from "../constants/route";

function Teams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [deleteTeam, setDeleteTeam] = useState(null);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await apiGet(API_ENDPOINTS.TEAM.GET_TEAMS);
      setTeams(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return (
    <AppLayout>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Teams</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + New Team
        </button>
      </div>

      {loading && <p className="text-muted">Loading teams...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      {!loading && !error && (
        <div className="row g-3">
          {teams.length === 0 && (
            <p className="text-muted">No teams yet. Create one.</p>
          )}
          {teams.map((team) => (
            <div className="col-12 col-sm-6 col-lg-4" key={team._id}>
              <div
                className="card h-100 shadow-sm"
                role="button"
                onClick={() =>
                  navigate(ROUTES.TEAM_DETAIL.replace(":id", team._id))
                }
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="card-title fw-bold mb-1 text-primary">
                      {team.name}
                    </h6>
                    <div onClick={(e) => e.stopPropagation()}>
                      <TeamMenu
                        onEdit={() => setEditTeam(team)}
                        onDelete={() => setDeleteTeam(team)}
                      />
                    </div>
                  </div>

                  <p className="card-text text-muted small mb-2">
                    {team.description}
                  </p>

                  <div className="d-flex align-items-center gap-1 flex-wrap">
                    {(team.members || []).slice(0, 4).map((m) => (
                      <span
                        key={m._id}
                        className="badge rounded-circle bg-secondary"
                        title={m.name}
                        style={{ width: 28, height: 28, lineHeight: "20px" }}
                      >
                        {m.name?.[0]?.toUpperCase()}
                      </span>
                    ))}
                    {(team.members || []).length > 4 && (
                      <span className="badge rounded-pill bg-light text-dark border">
                        +{team.members.length - 4}
                      </span>
                    )}
                    {(team.members || []).length === 0 && (
                      <span className="text-muted small">No members</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEditTeamModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            loadTeams();
          }}
        />
      )}

      {editTeam && (
        <CreateEditTeamModal
          team={editTeam}
          onClose={() => setEditTeam(null)}
          onSaved={() => {
            setEditTeam(null);
            loadTeams();
          }}
        />
      )}

      {deleteTeam && (
        <DeleteTeamModal
          team={deleteTeam}
          onClose={() => setDeleteTeam(null)}
          onDeleted={() => {
            setDeleteTeam(null);
            loadTeams();
          }}
        />
      )}
    </AppLayout>
  );
}

// simple state-based menu (no Bootstrap JS dependency)
function TeamMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="position-relative">
      <button
        className="btn btn-sm btn-light border-0"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        &#8942;
      </button>
      {open && (
        <ul
          className="dropdown-menu show"
          style={{ position: "absolute", right: 0, top: "100%" }}
        >
          <li>
            <button
              className="dropdown-item"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              Edit
            </button>
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              Delete
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

// ---------------- Create / Edit modal ----------------

function CreateEditTeamModal({ team, onClose, onSaved }) {
  const isEdit = Boolean(team);
  const [name, setName] = useState(team?.name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [members, setMembers] = useState(
    (team?.members || []).map((m) => m._id),
  );
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const body = await apiGet(API_ENDPOINTS.USERS.GET_ALL);
        setUsers(body.data);
      } catch {
        // non-fatal: member picker just stays empty
      }
    })();
  }, []);

  function toggleMember(id) {
    setMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    setError("");
    setSaving(true);
    try {
      const payload = { name, description, members };
      if (isEdit) {
        await apiPost(API_ENDPOINTS.TEAM.UPDATE_TEAM(team._id), payload);
      } else {
        await apiPost(API_ENDPOINTS.TEAM.CREATE_TEAM, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Team" : "Create New Team"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </>
      }
    >
      <div className="mb-3">
        <label className="form-label">Team Name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Members</label>
        <div
          className="border rounded p-2"
          style={{ maxHeight: 160, overflowY: "auto" }}
        >
          {users.length === 0 && (
            <span className="text-muted small">No users available</span>
          )}
          {users.map((u) => (
            <div className="form-check" key={u._id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`user-${u._id}`}
                checked={members.includes(u._id)}
                onChange={() => toggleMember(u._id)}
              />
              <label className="form-check-label" htmlFor={`user-${u._id}`}>
                {u.name} <span className="text-muted small">({u.email})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-danger mb-0">{error}</p>}
    </Modal>
  );
}

// ---------------- Delete confirm modal ----------------

function DeleteTeamModal({ team, onClose, onDeleted }) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      await apiDelete(API_ENDPOINTS.TEAM.DELETE_TEAM(team._id));
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="Delete Team"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </>
      }
    >
      <p className="mb-0">
        Are you sure you want to delete <strong>{team.name}</strong>? This can't
        be undone.
      </p>
      {error && <p className="text-danger mt-2 mb-0">{error}</p>}
    </Modal>
  );
}

export default Teams;
