function ProjectCard({ project }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h6 className="card-title fw-bold">{project.name}</h6>
        <p className="card-text text-muted small mb-0">
          {project.description}
        </p>
      </div>
    </div>
  );
}

export default ProjectCard;
