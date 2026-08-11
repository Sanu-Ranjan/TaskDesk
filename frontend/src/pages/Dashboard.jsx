import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import Navigation from "../components/Navigation";
import TopBar from "../components/TopBar";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import { apiGet } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";

const PAGE_LIMIT = 9;
const TASK_STATUSES = ["To Do", "In Progress", "Completed", "Blocked"];

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // URL is the source of truth for filter + page numbers
  const statusFilter = searchParams.get("status") || "";
  const mine = searchParams.get("mine") === "1";
  const projectPage = Math.max(
    1,
    parseInt(searchParams.get("projectPage")) || 1,
  );
  const taskPage = Math.max(1, parseInt(searchParams.get("taskPage")) || 1);

  // ----- projects -----
  const [projects, setProjects] = useState([]);
  const [projectTotalPages, setProjectTotalPages] = useState(1);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  // ----- tasks -----
  const [tasks, setTasks] = useState([]);
  const [taskTotalPages, setTaskTotalPages] = useState(1);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  // patch URL params without dropping the others
  const patchParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  // ---- fetch projects ----
  useEffect(() => {
    let active = true;
    (async () => {
      setProjectsLoading(true);
      setProjectsError("");
      try {
        const body = await apiGet(API_ENDPOINTS.PROJECTS.BASE, {
          page: projectPage,
          limit: PAGE_LIMIT,
        });
        if (!active) return;
        setProjects(body.data.projects);
        setProjectTotalPages(body.data.pagination.totalPages || 1);
      } catch (err) {
        if (active) setProjectsError(err.message);
      } finally {
        if (active) setProjectsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [projectPage]);

  // ---- fetch tasks ----
  useEffect(() => {
    let active = true;
    (async () => {
      setTasksLoading(true);
      setTasksError("");
      try {
        const params = { page: taskPage, limit: PAGE_LIMIT };
        if (statusFilter) params.status = statusFilter;
        if (mine && user?._id) params.owner = user._id;
        const body = await apiGet(API_ENDPOINTS.TASKS.BASE, params);
        if (!active) return;
        setTasks(body.data.tasks);
        setTaskTotalPages(body.data.pagination.totalPages || 1);
      } catch (err) {
        if (active) setTasksError(err.message);
      } finally {
        if (active) setTasksLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [taskPage, statusFilter, mine, user]);

  // changing the filter resets task page to 1
  function handleStatusChange(status) {
    patchParams({ status, taskPage: null });
  }

  return (
    <div className="d-flex">
      <Navigation />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <TopBar />
        <main className="flex-grow-1 p-4 bg-light" style={{ minWidth: 0 }}>
          {/* ---------------- Projects ---------------- */}
          <section className="mb-5">
            <h4 className="fw-bold mb-3">Projects</h4>

            {projectsError ? (
              <p className="text-danger">Error: {projectsError}</p>
            ) : projects.length === 0 && projectsLoading ? (
              <p className="text-muted">Loading projects...</p>
            ) : (
              <div
                style={{
                  opacity: projectsLoading ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {projects.length === 0 ? (
                  <p className="text-muted">No projects found.</p>
                ) : (
                  <div className="row g-3">
                    {projects.map((p) => (
                      <div className="col-12 col-sm-6 col-lg-4" key={p._id}>
                        <ProjectCard project={p} />
                      </div>
                    ))}
                  </div>
                )}

                {projectTotalPages > 1 && (
                  <Pager
                    page={projectPage}
                    totalPages={projectTotalPages}
                    onChange={(n) => patchParams({ projectPage: n })}
                  />
                )}
              </div>
            )}
          </section>

          {/* ---------------- My Tasks ---------------- */}
          <section>
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold mb-0">Tasks</h4>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    className={`btn ${
                      mine ? "btn-outline-primary" : "btn-primary"
                    }`}
                    onClick={() => patchParams({ mine: null, taskPage: null })}
                  >
                    All Tasks
                  </button>
                  <button
                    className={`btn ${
                      mine ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => patchParams({ mine: "1", taskPage: null })}
                  >
                    My Tasks
                  </button>
                </div>
              </div>

              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All statuses</option>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {tasksError ? (
              <p className="text-danger">Error: {tasksError}</p>
            ) : tasks.length === 0 && tasksLoading ? (
              <p className="text-muted">Loading tasks...</p>
            ) : (
              <div
                style={{
                  opacity: tasksLoading ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {tasks.length === 0 ? (
                  <p className="text-muted">No tasks found.</p>
                ) : (
                  <div className="row g-3">
                    {tasks.map((t) => (
                      <div className="col-12 col-sm-6 col-lg-4" key={t._id}>
                        <TaskCard task={t} />
                      </div>
                    ))}
                  </div>
                )}

                {taskTotalPages > 1 && (
                  <Pager
                    page={taskPage}
                    totalPages={taskTotalPages}
                    onChange={(n) => patchParams({ taskPage: n })}
                  />
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  return (
    <nav className="mt-3">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>
            Prev
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <li className={`page-item ${n === page ? "active" : ""}`} key={n}>
            <button className="page-link" onClick={() => onChange(n)}>
              {n}
            </button>
          </li>
        ))}
        <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Dashboard;
