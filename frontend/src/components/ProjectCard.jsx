import { useNavigate } from "react-router-dom";

import { ROUTES } from "../constants/route";

function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      className="card h-100 shadow-sm"
      role="button"
      onClick={() =>
        navigate(ROUTES.PROJECT_DETAIL.replace(":id", project._id))
      }
    >
      <div className="card-body">
        <h6 className="card-title fw-bold">{project.name}</h6>
        <p className="card-text text-muted small mb-0">{project.description}</p>
      </div>
    </div>
  );
}

export default ProjectCard;
