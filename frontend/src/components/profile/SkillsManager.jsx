import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { PROFICIENCY_LEVELS, SKILL_CATEGORIES } from '../../constants';
import * as userService from '../../services/userService';

const SkillsManager = ({ skills = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: 'Programming',
    proficiency: 'Beginner',
    yearsOfExperience: 0,
  });

  const resetForm = () => {
    setForm({ name: '', category: 'Programming', proficiency: 'Beginner', yearsOfExperience: 0 });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (skill) => {
    setForm({
      name: skill.name,
      category: skill.category || 'Programming',
      proficiency: skill.proficiency || 'Beginner',
      yearsOfExperience: skill.yearsOfExperience || 0,
    });
    setEditingId(skill._id || skill.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Skill name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await userService.updateSkill(editingId, form);
      } else {
        await userService.addSkill(form);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await userService.deleteSkill(skillId);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const proficiencyVariant = {
    Beginner: 'outline',
    Intermediate: 'cyan',
    Advanced: 'primary',
    Expert: 'success',
  };

  return (
    <Card>
      <CardHeader
        title="Skills"
        subtitle={`${skills.length} skill${skills.length !== 1 ? 's' : ''} added`}
        action={
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add Skill
          </Button>
        }
      />

      {error && <p className="mb-3 text-sm text-error">{error}</p>}

      {showForm && (
        <div className="mb-4 rounded-xl border border-border bg-lavender/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Skill Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={SKILL_CATEGORIES}
            />
            <Select
              label="Proficiency"
              value={form.proficiency}
              onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
              options={PROFICIENCY_LEVELS}
            />
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              value={form.yearsOfExperience}
              onChange={(e) => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
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

      {skills.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          No skills added yet. Add at least 3 skills for better recommendations.
        </p>
      ) : (
        <div className="space-y-2">
          {skills.map((skill) => (
            <div
              key={skill._id || skill.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-text-main">{skill.name}</span>
                <Badge variant={proficiencyVariant[skill.proficiency] || 'outline'}>
                  {skill.proficiency}
                </Badge>
                {skill.category && (
                  <span className="text-xs text-text-secondary">{skill.category}</span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(skill)}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-lavender hover:text-primary"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(skill._id || skill.id)}
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

export default SkillsManager;
