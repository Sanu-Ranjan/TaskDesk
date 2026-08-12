import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import { apiGet, apiPost, apiDelete } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { ROUTES } from "../constants/route";

const PAGE_LIMIT = 9;

function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  const patchParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) next.delete(k);
        else next.set(k, v);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await apiGet(API_ENDPOINTS.PROJECTS.BASE, {
        page,
        limit: PAGE_LIMIT,
      });
      setProjects(body.data.projects);
      setTotalPages(body.data.pagination.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <AppLayout>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">Projects</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + New Project
        </button>
      </div>

      {error && <p className="text-danger">Error: {error}</p>}

      {projects.length === 0 && loading ? (
        <p className="text-muted">Loading projects...</p>
      ) : (
        <div
          style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.15s" }}
        >
          {projects.length === 0 ? (
            <p className="text-muted">No projects yet. Create one.</p>
          ) : (
            <div className="row g-3">
              {projects.map((p) => (
                <div className="col-12 col-sm-6 col-lg-4" key={p._id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6
                          className="card-title fw-bold text-primary mb-1"
                          role="button"
                          onClick={() =>
                            navigate(
                              ROUTES.PROJECT_DETAIL.replace(":id", p._id),
                            )
                          }
                        >
                          {p.name}
                        </h6>
                        <ProjectMenu
                          onEdit={() => setEditProject(p)}
                          onDelete={() => setDeleteProject(p)}
                        />
                      </div>
                      <p className="card-text text-muted small mb-0">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => patchParams({ page: page - 1 })}
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <li
                      className={`page-item ${n === page ? "active" : ""}`}
                      key={n}
                    >
                      <button
                        className="page-link"
                        onClick={() => patchParams({ page: n })}
                      >
                        {n}
                      </button>
                    </li>
                  ),
                )}
                <li
                  className={`page-item ${
                    page >= totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => patchParams({ page: page + 1 })}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {showCreate && (
        <CreateEditProjectModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            loadProjects();
          }}
        />
      )}

      {editProject && (
        <CreateEditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSaved={() => {
            setEditProject(null);
            loadProjects();
          }}
        />
      )}

      {deleteProject && (
        <DeleteProjectModal
          project={deleteProject}
          onClose={() => setDeleteProject(null)}
          onDeleted={() => {
            setDeleteProject(null);
            loadProjects();
          }}
        />
      )}
    </AppLayout>
  );
}

// state-based menu (no bootstrap-js dependency)
function ProjectMenu({ onEdit, onDelete }) {
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

function CreateEditProjectModal({ project, onClose, onSaved }) {
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setError("");
    setSaving(true);
    try {
      const payload = { name, description };
      if (isEdit) {
        await apiPost(API_ENDPOINTS.PROJECTS.GET_BY_ID(project._id), payload);
      } else {
        await apiPost(API_ENDPOINTS.PROJECTS.BASE, payload);
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
      title={isEdit ? "Edit Project" : "Create New Project"}
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
        <label className="form-label">Project Name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Project Description</label>
        <textarea
          className="form-control"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
        />
      </div>

      {error && <p className="text-danger mb-0">{error}</p>}
    </Modal>
  );
}

function DeleteProjectModal({ project, onClose, onDeleted }) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      await apiDelete(API_ENDPOINTS.PROJECTS.GET_BY_ID(project._id));
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="Delete Project"
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
        Are you sure you want to delete <strong>{project.name}</strong>? This
        can't be undone.
      </p>
      {error && <p className="text-danger mt-2 mb-0">{error}</p>}
    </Modal>
  );
}

export default Projects;
