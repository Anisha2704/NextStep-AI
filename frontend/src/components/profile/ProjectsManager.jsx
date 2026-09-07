import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import * as userService from '../../services/userService';

const ProjectsManager = ({ projects = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    role: '',
  });

  const resetForm = () => {
    setForm({ name: '', description: '', technologies: '', githubUrl: '', liveUrl: '', role: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description || '',
      technologies: (project.technologies || []).join(', '),
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      role: project.role || '',
    });
    setEditingId(project._id || project.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Project name is required');
      return;
    }
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      technologies: form.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await userService.updateProject(editingId, payload);
      } else {
        await userService.addProject(payload);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await userService.deleteProject(projectId);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
        action={
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add Project
          </Button>
        }
      />

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      {showForm && (
        <div className="mb-4 rounded-xl border border-border bg-lavender/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Project Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              containerClassName="sm:col-span-2"
            />
            <Textarea
              label="Description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Technologies (comma separated)"
              placeholder="React, Node.js, MongoDB"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Your Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <Input
              label="GitHub URL"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            />
            <Input
              label="Live URL"
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              containerClassName="sm:col-span-2"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleSubmit} loading={loading}>
              {editingId ? 'Update' : 'Add'}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          No projects yet. Showcase your work to stand out.
        </p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project._id || project.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-text-main">{project.name}</h4>
                  {project.role && (
                    <p className="text-xs text-text-secondary">{project.role}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-text-secondary hover:text-primary">
                      <GithubIcon size={16} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-text-secondary hover:text-primary">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button onClick={() => handleEdit(project)} className="rounded-lg p-1.5 text-text-secondary hover:bg-lavender hover:text-primary">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(project._id || project.id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-error/10 hover:text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-text-secondary">{project.description}</p>
              )}
              {project.technologies?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ProjectsManager;
