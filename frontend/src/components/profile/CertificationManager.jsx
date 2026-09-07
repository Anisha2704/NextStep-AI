import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { formatDate } from '../../utils';
import * as userService from '../../services/userService';

const CertificationManager = ({ certifications = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    provider: '',
    issueDate: '',
    credentialUrl: '',
  });

  const resetForm = () => {
    setForm({ name: '', provider: '', issueDate: '', credentialUrl: '' });
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Certification name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await userService.addCertification(form);
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add certification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await userService.deleteCertification(certId);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete certification');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Certifications"
        subtitle={`${certifications.length} certification${certifications.length !== 1 ? 's' : ''}`}
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add
          </Button>
        }
      />

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      {showForm && (
        <div className="mb-4 rounded-xl border border-border bg-lavender/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Certificate Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Provider"
              placeholder="Coursera, AWS, Google"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
            />
            <Input
              label="Issue Date"
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            />
            <Input
              label="Credential URL"
              value={form.credentialUrl}
              onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
              containerClassName="sm:col-span-2"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleSubmit} loading={loading}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {certifications.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          No certifications added yet.
        </p>
      ) : (
        <div className="space-y-2">
          {certifications.map((cert) => (
            <div
              key={cert._id || cert.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-medium text-text-main">{cert.name}</p>
                <p className="text-xs text-text-secondary">
                  {cert.provider}
                  {cert.issueDate && ` · ${formatDate(cert.issueDate)}`}
                </p>
              </div>
              <div className="flex gap-1">
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-text-secondary hover:text-primary"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(cert._id || cert.id)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-error/10 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CertificationManager;
