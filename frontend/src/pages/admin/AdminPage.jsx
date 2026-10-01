import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, getErrorMessage, getInitials } from '../../utils';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
  { id: 'attempts', label: 'Attempt Analytics', icon: BarChart3 },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

const cardClass = 'rounded-2xl border border-border bg-white shadow-xs';
const buttonPrimary =
  'inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-bright disabled:opacity-50';
const buttonQuiet =
  'inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-text-main transition hover:bg-lavender disabled:opacity-50 shadow-2xs';
const fieldClass =
  'w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-text-main outline-none transition placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20';

function StatCard({ label, value, note, icon: Icon, tint = 'violet', trend }) {
  const colors = {
    violet: 'bg-primary-light text-primary',
    cyan:   'bg-cyan-soft text-cyan-600',
    amber:  'bg-amber-100 text-amber-700',
    green:  'bg-emerald-100 text-emerald-700',
  };
  return (
    <article className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-text-main">
            {Number(value || 0).toLocaleString()}
          </p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[tint]}`}>
          <Icon size={20} />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary">
        {trend != null && (
          <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
        {note}
      </div>
    </article>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-white text-text-main shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Admin workspace</p>
            <h2 className="mt-0.5 text-xl font-bold text-text-main">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-lavender hover:text-text-main"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}

function ConfirmModal({ title, message, confirmText = 'Confirm', confirmVariant = 'danger', onClose, onConfirm, busy }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" onClick={onClose} className={buttonQuiet} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition disabled:opacity-50 ${
              confirmVariant === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-primary hover:bg-primary-bright'
            }`}
          >
            {busy ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const emptyCourse = { title: '', provider: '', description: '', skills: '', url: '', level: 'Beginner', duration: '' };

const sampleQuestion = {
  prompt: 'Which keyword declares a block-scoped variable in JavaScript?',
  options: ['var', 'let', 'define', 'static'],
  correctAnswer: 1,
  explanation: '`let` declares a block-scoped local variable.',
  skill: 'Variables',
};

const sampleAssessment = {
  slug: 'javascript-fundamentals',
  version: 1,
  title: 'JavaScript Fundamentals',
  description: 'Evaluate your knowledge of JavaScript basics, data types, and functions.',
  subject: 'Web Development',
  subjectSlug: 'web-development',
  topic: 'JavaScript',
  topicSlug: 'javascript',
  skill: 'JavaScript',
  category: 'Programming',
  difficulty: 'Beginner',
  durationMinutes: 15,
  passingScore: 70,
  active: true,
  questions: [sampleQuestion],
};

export default function AdminPage() {
  const { activeTab: tab, setActiveTab: setTab } = useOutletContext();
  const [overview, setOverview] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [usersSearch, setUsersSearch] = useState('');
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Courses State
  const [courses, setCourses] = useState([]);
  const [coursesSearch, setCoursesSearch] = useState('');
  const [coursesLevel, setCoursesLevel] = useState('All');

  // Assessments State
  const [assessments, setAssessments] = useState([]);
  const [builderMode, setBuilderMode] = useState('visual'); // 'visual' | 'json'
  const [assessmentForm, setAssessmentForm] = useState(sampleAssessment);
  const [assessmentJson, setAssessmentJson] = useState('');

  // Attempts Analytics State
  const [attempts, setAttempts] = useState([]);
  const [attemptsPagination, setAttemptsPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [attemptsSearch, setAttemptsSearch] = useState('');
  const [attemptsStatus, setAttemptsStatus] = useState('all');

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', type: 'info', broadcast: false });

  // UI States
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null); // { type, ...payload }
  const [courseForm, setCourseForm] = useState(emptyCourse);

  const loadData = useCallback(async (currentTab, page = 1) => {
    setLoading(true);
    setError('');
    try {
      if (currentTab === 'overview') {
        const { data } = await api.get('/admin/overview');
        setOverview(data.overview);
      } else if (currentTab === 'users') {
        const { data } = await api.get('/admin/users', {
          params: { page, limit: 10, search: usersSearch },
        });
        setUsers(data.users);
        setUsersPagination(data.pagination);
      } else if (currentTab === 'courses') {
        const { data } = await api.get('/admin/courses', {
          params: { search: coursesSearch, level: coursesLevel },
        });
        setCourses(data.courses);
      } else if (currentTab === 'assessments') {
        const { data } = await api.get('/admin/assessments');
        setAssessments(data.assessments);
      } else if (currentTab === 'attempts') {
        const { data } = await api.get('/admin/attempts', {
          params: { page, limit: 10, search: attemptsSearch, status: attemptsStatus },
        });
        setAttempts(data.attempts);
        setAttemptsPagination(data.pagination);
      } else if (currentTab === 'announcements') {
        const { data } = await api.get('/admin/announcements');
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [usersSearch, coursesSearch, coursesLevel, attemptsSearch, attemptsStatus]);

  useEffect(() => {
    loadData(tab, 1);
  }, [tab, loadData]);

  const runAction = async (fn, successMessage, reloadTab = tab) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      setNotice(successMessage);
      setModal(null);
      await loadData(reloadTab, 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // --- User Handlers ---
  const handleViewUser = async (userId) => {
    setBusy(true);
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetails(data.user);
      setModal({ type: 'userDetails' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // --- Course Handlers ---
  const handleEditCourse = (course = null) => {
    setCourseForm(
      course
        ? { ...course, skills: (course.skills || []).join(', ') }
        : emptyCourse
    );
    setModal({ type: 'course', course });
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    const payload = {
      ...courseForm,
      skills: courseForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    return runAction(
      () => (modal.course ? api.put(`/admin/courses/${modal.course._id}`, payload) : api.post('/admin/courses', payload)),
      modal.course ? 'Course updated successfully.' : 'Course added to library.',
      'courses'
    );
  };

  const handleDeleteCourseConfirm = (course) => {
    setModal({
      type: 'confirm',
      title: 'Delete Course?',
      message: `Are you sure you want to delete "${course.title}"? This cannot be undone.`,
      confirmText: 'Delete Course',
      confirmVariant: 'danger',
      onConfirm: () =>
        runAction(() => api.delete(`/admin/courses/${course._id}`), 'Course removed from library.', 'courses'),
    });
  };

  // --- Assessment Handlers ---
  const handleNewAssessment = () => {
    setAssessmentForm(sampleAssessment);
    setAssessmentJson(JSON.stringify(sampleAssessment, null, 2));
    setBuilderMode('visual');
    setModal({ type: 'assessment' });
  };

  const handleSaveAssessment = (e) => {
    e.preventDefault();
    let payload;
    try {
      payload = builderMode === 'json' ? JSON.parse(assessmentJson) : assessmentForm;
    } catch {
      setError('Invalid JSON syntax in assessment editor.');
      return;
    }

    return runAction(
      () => (modal?.assessment ? api.patch(`/admin/assessments/${modal.assessment._id}`, payload) : api.post('/admin/assessments', payload)),
      modal?.assessment ? 'Assessment updated.' : 'Assessment created.',
      'assessments'
    );
  };

  const handleToggleAssessmentActive = (assessment) => {
    return runAction(
      () => api.patch(`/admin/assessments/${assessment._id}`, { active: !assessment.active }),
      `Assessment ${assessment.active ? 'paused' : 'published'}.`,
      'assessments'
    );
  };

  const handleDeleteAssessmentConfirm = (assessment) => {
    setModal({
      type: 'confirm',
      title: 'Delete Assessment?',
      message: `Are you sure you want to permanently delete "${assessment.title}"?`,
      confirmText: 'Delete Assessment',
      confirmVariant: 'danger',
      onConfirm: () =>
        runAction(() => api.delete(`/admin/assessments/${assessment._id}`), 'Assessment deleted.', 'assessments'),
    });
  };

  const addQuestionVisual = () => {
    setAssessmentForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { prompt: '', options: ['', '', '', ''], correctAnswer: 0, skill: '', explanation: '' },
      ],
    }));
  };

  const updateQuestionVisual = (qIndex, field, value) => {
    setAssessmentForm((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const updateOptionVisual = (qIndex, oIndex, value) => {
    setAssessmentForm((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[qIndex].options];
      updatedOptions[oIndex] = value;
      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const removeQuestionVisual = (qIndex) => {
    setAssessmentForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  // --- Announcement Handlers ---
  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    return runAction(
      () => (modal?.announcement ? api.patch(`/admin/announcements/${modal.announcement._id}`, announcementForm) : api.post('/admin/announcements', announcementForm)),
      modal?.announcement ? 'Announcement updated.' : 'Announcement published.',
      'announcements'
    );
  };

  const handleDeleteAnnouncementConfirm = (announcement) => {
    setModal({
      type: 'confirm',
      title: 'Delete Announcement?',
      message: `Delete announcement "${announcement.title}"?`,
      confirmText: 'Delete',
      confirmVariant: 'danger',
      onConfirm: () => runAction(() => api.delete(`/admin/announcements/${announcement._id}`), 'Announcement deleted.', 'announcements'),
    });
  };

  // CSV Export
  const handleExportCsv = async () => {
    setBusy(true);
    try {
      const response = await api.get('/admin/attempts/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assessment-attempts-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNotice('CSV report downloaded.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 pb-12">
      {/* Page header strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            {tab === 'overview' && 'Platform Overview'}
            {tab === 'users' && 'User Management'}
            {tab === 'courses' && 'Course Library'}
            {tab === 'assessments' && 'Assessments'}
            {tab === 'attempts' && 'Attempt Analytics'}
            {tab === 'announcements' && 'Announcements'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {tab === 'overview' && 'Live platform metrics and recent student activity'}
            {tab === 'users' && 'Search, inspect details, and review student accounts'}
            {tab === 'courses' && 'Add, edit and curate learning resources'}
            {tab === 'assessments' && 'Build, publish and manage skill evaluations'}
            {tab === 'attempts' && 'Review student attempt records and export CSV reports'}
            {tab === 'announcements' && 'Broadcast notifications and updates to students'}
          </p>
        </div>
        <button
          onClick={() => loadData(tab)}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-text-secondary shadow-2xs transition hover:bg-lavender hover:text-text-main"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss error" className="text-rose-500 hover:text-rose-700">
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600" /> {notice}
          </span>
          <button onClick={() => setNotice('')} aria-label="Dismiss notice" className="text-emerald-500 hover:text-emerald-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tab Contents */}
      {loading ? (
        <div className={`${cardClass} flex min-h-64 items-center justify-center p-8`}>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            Loading admin workspace data…
          </div>
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Students" value={overview?.students} note="registered student accounts" icon={GraduationCap} tint="violet" />
                <StatCard label="Learning Courses" value={overview?.courses} note="in resource library" icon={BookOpen} tint="cyan" />
                <StatCard label="Active Assessments" value={overview?.activeAssessments} note={`of ${overview?.assessments || 0} total created`} icon={ClipboardCheck} tint="amber" />
                <StatCard label="Assessment Attempts" value={overview?.attempts} note={`${overview?.passedAttempts || 0} passed`} icon={Activity} tint="green" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                {/* Recent Signups */}
                <section className={`${cardClass} overflow-hidden`}>
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                      <h2 className="font-bold text-text-main">Recent Signups</h2>
                      <p className="mt-0.5 text-xs text-text-secondary">Latest registered accounts across platform</p>
                    </div>
                    <button onClick={() => setTab('users')} className="text-sm font-semibold text-primary hover:underline">
                      Manage Users →
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {overview?.recentUsers?.length ? (
                      overview.recentUsers.map((person) => (
                        <div key={person.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-lavender/30">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                            {getInitials(person.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-text-main">{person.name}</p>
                            <p className="truncate text-xs text-text-secondary">{person.email}</p>
                          </div>
                          {person.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                              <ShieldCheck size={11} /> Master Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <GraduationCap size={11} /> Student
                            </span>
                          )}
                          <span className="hidden text-xs text-text-secondary sm:block">{formatDate(person.createdAt)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="px-5 py-10 text-center text-sm text-text-secondary">No student signups yet.</p>
                    )}
                  </div>
                </section>

                {/* Platform Summary */}
                <section className={`${cardClass} p-5`}>
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <Activity size={19} />
                    </span>
                    <div>
                      <h2 className="font-bold text-text-main">Platform Activity</h2>
                      <p className="text-xs text-text-secondary">Live metrics summary</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {[
                      { label: 'Learning Roadmaps Generated', value: overview?.roadmaps, icon: ArrowUpRight },
                      { label: 'Resume Analyses Completed', value: overview?.resumes, icon: ArrowDownRight },
                      { label: 'Administrator Accounts', value: overview?.admins, icon: ShieldCheck },
                      { label: 'Active Announcements', value: overview?.announcementsCount, icon: Megaphone },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3 rounded-xl bg-lavender/40 p-3">
                        <span className="rounded-lg bg-primary-light p-2 text-primary">
                          <Icon size={15} />
                        </span>
                        <span className="flex-1 text-sm text-text-secondary">{label}</span>
                        <strong className="text-lg font-bold text-text-main">{Number(value || 0).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">User Accounts</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {usersPagination.total} total members · Search and inspect student details.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadData('users', 1);
                  }}
                  className="relative w-full sm:max-w-xs"
                >
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    className={`${fieldClass} pl-9`}
                    placeholder="Search by name or email"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                  />
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="border-b border-border bg-lavender/50 text-xs uppercase tracking-wide text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Member</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Joined Date</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((person) => (
                      <tr key={person.id} className="transition-colors hover:bg-lavender/25">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                              {getInitials(person.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-main">{person.name}</p>
                              <p className="text-xs text-text-secondary">{person.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {person.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                              <ShieldCheck size={12} /> Master Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <GraduationCap size={12} /> Student
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-text-secondary">{formatDate(person.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleViewUser(person.id)} className={buttonQuiet} title="View Details">
                              <Eye size={15} /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!users.length && <p className="px-5 py-12 text-center text-sm text-text-secondary">No matching accounts found.</p>}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <p className="text-xs text-text-secondary">
                  Page {usersPagination.page} of {usersPagination.pages || 1} ({usersPagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={usersPagination.page <= 1}
                    onClick={() => loadData('users', usersPagination.page - 1)}
                    className={`${buttonQuiet} disabled:opacity-40`}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    disabled={usersPagination.page >= usersPagination.pages}
                    onClick={() => loadData('users', usersPagination.page + 1)}
                    className={`${buttonQuiet} disabled:opacity-40`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* COURSES TAB */}
          {tab === 'courses' && (
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">Course Library</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">Manage learning resources recommended to students.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      className={`${fieldClass} pl-8 py-1.5 text-xs w-44 sm:w-56`}
                      placeholder="Search courses..."
                      value={coursesSearch}
                      onChange={(e) => setCoursesSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className={`${fieldClass} py-1.5 text-xs w-32`}
                    value={coursesLevel}
                    onChange={(e) => setCoursesLevel(e.target.value)}
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button className={buttonPrimary} onClick={() => handleEditCourse()}>
                    <Plus size={16} /> Add Course
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <article
                    key={course._id}
                    className="flex flex-col rounded-2xl border border-border bg-white p-4 shadow-2xs transition hover:border-primary/40 hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-soft text-cyan-600">
                        <BookOpen size={18} />
                      </span>
                      <span className="rounded-full border border-border bg-lavender px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                        {course.level || 'All levels'}
                      </span>
                    </div>
                    <h3 className="mt-4 font-bold leading-5 text-text-main">{course.title}</h3>
                    <p className="mt-1 text-xs font-medium text-primary">
                      {course.provider || 'Independent Resource'}
                      {course.duration ? ` · ${course.duration}` : ''}
                    </p>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-text-secondary">
                      {course.description || 'No description added.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(course.skills || []).map((skill) => (
                        <span key={skill} className="rounded-md border border-border/80 bg-lavender/60 px-2 py-0.5 text-[10px] text-text-secondary font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      {course.url ? (
                        <a className="text-xs font-semibold text-primary hover:underline" href={course.url} target="_blank" rel="noreferrer">
                          Open Resource ↗
                        </a>
                      ) : (
                        <span className="text-xs text-text-secondary/50">No link</span>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => handleEditCourse(course)} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-text-secondary hover:bg-lavender hover:text-text-main">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCourseConfirm(course)} aria-label={`Delete ${course.title}`} className="rounded-lg p-1.5 text-text-secondary hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!courses.length && <p className="py-12 text-center text-sm text-text-secondary">No matching courses found.</p>}
            </section>
          )}

          {/* ASSESSMENTS TAB */}
          {tab === 'assessments' && (
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">Assessment Catalog</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">Create, publish, pause, or remove skill evaluations for learners.</p>
                </div>
                <button className={buttonPrimary} onClick={handleNewAssessment}>
                  <Plus size={16} /> New Assessment
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="border-b border-border bg-lavender/50 text-xs uppercase tracking-wide text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Assessment Title</th>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold">Difficulty</th>
                      <th className="px-4 py-3 font-semibold">Questions</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {assessments.map((assessment) => (
                      <tr key={assessment._id} className="transition-colors hover:bg-lavender/25">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-text-main">{assessment.title}</p>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {assessment.topic} · {assessment.durationMinutes} min · Pass: {assessment.passingScore}%
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-secondary">{assessment.subject}</td>
                        <td className="px-4 py-4 text-sm text-text-secondary">{assessment.difficulty}</td>
                        <td className="px-4 py-4 text-sm text-text-secondary">{assessment.questionCount}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${assessment.active ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-border bg-lavender text-text-secondary'}`}>
                            {assessment.active ? 'Published' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button disabled={busy} onClick={() => handleToggleAssessmentActive(assessment)} className={buttonQuiet}>
                              {assessment.active ? 'Pause' : 'Publish'}
                            </button>
                            <button onClick={() => handleDeleteAssessmentConfirm(assessment)} className="rounded-xl border border-border p-2 text-text-secondary hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!assessments.length && <p className="px-5 py-12 text-center text-sm text-text-secondary">No assessments created yet.</p>}
              </div>
            </section>
          )}

          {/* ATTEMPTS ANALYTICS TAB */}
          {tab === 'attempts' && (
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">Student Assessment Analytics</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">Inspect student scores, pass rates, and download CSV reports.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      className={`${fieldClass} pl-8 py-1.5 text-xs w-44 sm:w-56`}
                      placeholder="Search student or exam..."
                      value={attemptsSearch}
                      onChange={(e) => setAttemptsSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className={`${fieldClass} py-1.5 text-xs w-32`}
                    value={attemptsStatus}
                    onChange={(e) => setAttemptsStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button onClick={handleExportCsv} disabled={busy} className={buttonQuiet}>
                    <Download size={15} /> Download CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-border bg-lavender/50 text-xs uppercase tracking-wide text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Assessment Title</th>
                      <th className="px-4 py-3 font-semibold">Score</th>
                      <th className="px-4 py-3 font-semibold">Percentage</th>
                      <th className="px-4 py-3 font-semibold">Result</th>
                      <th className="px-5 py-3 font-semibold">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attempts.map((att) => (
                      <tr key={att.id} className="transition-colors hover:bg-lavender/25">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-text-main">{att.studentName}</p>
                          <p className="text-xs text-text-secondary">{att.studentEmail}</p>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-text-main">{att.assessmentTitle}</td>
                        <td className="px-4 py-4 text-sm text-text-secondary">
                          {att.score} / {att.totalQuestions}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-text-main">{att.percentage}%</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${att.passed ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-rose-200 bg-rose-50 text-rose-700'}`}>
                            {att.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-secondary">{formatDate(att.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!attempts.length && <p className="px-5 py-12 text-center text-sm text-text-secondary">No assessment attempts recorded yet.</p>}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <p className="text-xs text-text-secondary">
                  Page {attemptsPagination.page} of {attemptsPagination.pages || 1} ({attemptsPagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={attemptsPagination.page <= 1}
                    onClick={() => loadData('attempts', attemptsPagination.page - 1)}
                    className={`${buttonQuiet} disabled:opacity-40`}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    disabled={attemptsPagination.page >= attemptsPagination.pages}
                    onClick={() => loadData('attempts', attemptsPagination.page + 1)}
                    className={`${buttonQuiet} disabled:opacity-40`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {tab === 'announcements' && (
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">Platform Announcements</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">Publish updates and broadcast notifications to students.</p>
                </div>
                <button
                  className={buttonPrimary}
                  onClick={() => {
                    setAnnouncementForm({ title: '', message: '', type: 'info', broadcast: false });
                    setModal({ type: 'announcement' });
                  }}
                >
                  <Plus size={16} /> New Announcement
                </button>
              </div>

              <div className="divide-y divide-border">
                {announcements.map((anc) => (
                  <article key={anc.id} className="flex flex-col sm:flex-row items-start justify-between gap-4 p-5 transition hover:bg-lavender/30">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          anc.type === 'urgent'
                            ? 'border border-rose-200 bg-rose-50 text-rose-700'
                            : anc.type === 'warning'
                            ? 'border border-amber-200 bg-amber-50 text-amber-700'
                            : 'border border-primary/20 bg-primary-light text-primary'
                        }`}>
                          {anc.type}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${anc.isPublished ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-border bg-lavender text-text-secondary'}`}>
                          {anc.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-text-secondary">{formatDate(anc.createdAt)}</span>
                      </div>
                      <h3 className="font-bold text-text-main text-base">{anc.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">{anc.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          runAction(
                            () => api.patch(`/admin/announcements/${anc.id}`, { isPublished: !anc.isPublished }),
                            `Announcement ${anc.isPublished ? 'unpubished' : 'published'}.`,
                            'announcements'
                          )
                        }
                        className={buttonQuiet}
                      >
                        {anc.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncementConfirm(anc)}
                        className="rounded-xl border border-border p-2 text-text-secondary hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
                {!announcements.length && <p className="px-5 py-12 text-center text-sm text-text-secondary">No announcements created yet.</p>}
              </div>
            </section>
          )}
        </>
      )}

      {/* --- MODALS --- */}

      {/* User Details Modal */}
      {modal?.type === 'userDetails' && selectedUserDetails && (
        <Modal title="User Profile Details" onClose={() => setModal(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-lavender/60 p-4 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-xs">
                {getInitials(selectedUserDetails.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">{selectedUserDetails.name}</h3>
                <p className="text-sm text-text-secondary">{selectedUserDetails.email}</p>
                {selectedUserDetails.role === 'admin' ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <ShieldCheck size={12} /> Master Admin
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <GraduationCap size={12} /> Student
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="text-xs text-text-secondary">College / School</p>
                <p className="font-semibold text-text-main mt-0.5">{selectedUserDetails.education?.college || 'Not set'}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="text-xs text-text-secondary">Location</p>
                <p className="font-semibold text-text-main mt-0.5">{selectedUserDetails.location || 'Not set'}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="text-xs text-text-secondary">Member Since</p>
                <p className="font-semibold text-text-main mt-0.5">{formatDate(selectedUserDetails.createdAt)}</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <p className="text-xs text-text-secondary">Assessment Attempts</p>
                <p className="font-semibold text-text-main mt-0.5">{selectedUserDetails.attemptsCount || 0} completed</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button onClick={() => setModal(null)} className={buttonQuiet}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {modal?.type === 'confirm' && (
        <ConfirmModal
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText}
          confirmVariant={modal.confirmVariant}
          onClose={() => setModal(null)}
          onConfirm={modal.onConfirm}
          busy={busy}
        />
      )}

      {/* Course Modal */}
      {modal?.type === 'course' && (
        <Modal title={modal.course ? 'Edit Course' : 'Add New Course'} onClose={() => setModal(null)}>
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Course Title *
                <input required maxLength="160" className={fieldClass} value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Provider
                <input className={fieldClass} value={courseForm.provider} onChange={(e) => setCourseForm({ ...courseForm, provider: e.target.value })} placeholder="e.g. Coursera, Udemy" />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium text-text-main">
              Description
              <textarea rows="3" className={fieldClass} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Resource URL
                <input type="url" className={fieldClass} value={courseForm.url} onChange={(e) => setCourseForm({ ...courseForm, url: e.target.value })} placeholder="https://…" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Skills <span className="font-normal text-text-secondary">(comma separated)</span>
                <input className={fieldClass} value={courseForm.skills} onChange={(e) => setCourseForm({ ...courseForm, skills: e.target.value })} placeholder="React, JavaScript" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Difficulty Level
                <select className={fieldClass} value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                  {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Duration
                <input className={fieldClass} value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="e.g. 6 hours" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" className={buttonQuiet} onClick={() => setModal(null)}>Cancel</button>
              <button disabled={busy} className={buttonPrimary}>{busy ? 'Saving…' : modal.course ? 'Save Changes' : 'Add Course'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assessment Dual Builder Modal */}
      {modal?.type === 'assessment' && (
        <Modal title={modal.assessment ? 'Edit Assessment' : 'Create Assessment'} onClose={() => setModal(null)}>
          <form onSubmit={handleSaveAssessment} className="space-y-5">
            {/* Builder Mode Selector */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex rounded-xl bg-lavender p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (builderMode === 'json') {
                      try {
                        const parsed = JSON.parse(assessmentJson);
                        setAssessmentForm(parsed);
                      } catch {
                        setError('Cannot switch to Visual Builder: Invalid JSON');
                        return;
                      }
                    }
                    setBuilderMode('visual');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    builderMode === 'visual' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  Visual Builder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssessmentJson(JSON.stringify(assessmentForm, null, 2));
                    setBuilderMode('json');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    builderMode === 'json' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  JSON Schema Editor
                </button>
              </div>
              <span className="text-xs text-text-secondary">
                {builderMode === 'visual' ? `${assessmentForm.questions?.length || 0} Questions` : 'Raw JSON Schema'}
              </span>
            </div>

            {builderMode === 'visual' ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-semibold text-text-main">
                    Title *
                    <input required className={fieldClass} value={assessmentForm.title} onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })} />
                  </label>
                  <label className="space-y-1 text-xs font-semibold text-text-main">
                    Subject *
                    <input required className={fieldClass} value={assessmentForm.subject} onChange={(e) => setAssessmentForm({ ...assessmentForm, subject: e.target.value })} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-1 text-xs font-semibold text-text-main">
                    Difficulty
                    <select className={fieldClass} value={assessmentForm.difficulty} onChange={(e) => setAssessmentForm({ ...assessmentForm, difficulty: e.target.value })}>
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-semibold text-text-main">
                    Duration (Minutes)
                    <input type="number" min="1" className={fieldClass} value={assessmentForm.durationMinutes} onChange={(e) => setAssessmentForm({ ...assessmentForm, durationMinutes: Number(e.target.value) })} />
                  </label>
                  <label className="space-y-1 text-xs font-semibold text-text-main">
                    Passing Score (%)
                    <input type="number" min="1" max="100" className={fieldClass} value={assessmentForm.passingScore} onChange={(e) => setAssessmentForm({ ...assessmentForm, passingScore: Number(e.target.value) })} />
                  </label>
                </div>

                {/* Questions List */}
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-text-main">Questions</h4>
                    <button type="button" onClick={addQuestionVisual} className={buttonQuiet}>
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {assessmentForm.questions?.map((q, qIndex) => (
                    <div key={qIndex} className="rounded-xl border border-border bg-lavender/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Question #{qIndex + 1}</span>
                        {assessmentForm.questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestionVisual(qIndex)} className="text-xs text-rose-600 hover:underline">
                            Remove
                          </button>
                        )}
                      </div>
                      <label className="block space-y-1 text-xs font-medium text-text-main">
                        Prompt *
                        <input required className={fieldClass} value={q.prompt} onChange={(e) => updateQuestionVisual(qIndex, 'prompt', e.target.value)} placeholder="e.g. What is closure in JavaScript?" />
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options?.map((opt, oIndex) => (
                          <label key={oIndex} className="space-y-1 text-xs font-medium text-text-main">
                            Option {oIndex + 1} {oIndex === q.correctAnswer && '✅ (Correct)'}
                            <input required className={fieldClass} value={opt} onChange={(e) => updateOptionVisual(qIndex, oIndex, e.target.value)} />
                          </label>
                        ))}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 text-xs font-medium text-text-main">
                          Correct Option Index
                          <select className={fieldClass} value={q.correctAnswer} onChange={(e) => updateQuestionVisual(qIndex, 'correctAnswer', Number(e.target.value))}>
                            {q.options?.map((_, oIdx) => (
                              <option key={oIdx} value={oIdx}>Option {oIdx + 1}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1 text-xs font-medium text-text-main">
                          Skill Tag
                          <input className={fieldClass} value={q.skill || ''} onChange={(e) => updateQuestionVisual(qIndex, 'skill', e.target.value)} />
                        </label>
                      </div>
                      <label className="block space-y-1 text-xs font-medium text-text-main">
                        Explanation
                        <input className={fieldClass} value={q.explanation || ''} onChange={(e) => updateQuestionVisual(qIndex, 'explanation', e.target.value)} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  JSON Schema editor. Update assessment properties and question objects directly. Correct answers are kept private.
                </p>
                <textarea
                  required
                  spellCheck="false"
                  className={`${fieldClass} min-h-[360px] resize-y font-mono text-xs leading-5`}
                  value={assessmentJson}
                  onChange={(e) => setAssessmentJson(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setAssessmentJson(JSON.stringify(sampleAssessment, null, 2))}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Restore Sample Schema
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" className={buttonQuiet} onClick={() => setModal(null)}>Cancel</button>
              <button disabled={busy} className={buttonPrimary}>{busy ? 'Saving…' : modal.assessment ? 'Save Changes' : 'Create Assessment'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Announcement Modal */}
      {modal?.type === 'announcement' && (
        <Modal title={modal.announcement ? 'Edit Announcement' : 'Create Announcement'} onClose={() => setModal(null)}>
          <form onSubmit={handleSaveAnnouncement} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-text-main">
              Announcement Title *
              <input required className={fieldClass} value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="e.g. System Maintenance or New Course Release" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-text-main">
              Message *
              <textarea required rows="4" className={fieldClass} value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} placeholder="Write message details for students..." />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-text-main">
                Type
                <select className={fieldClass} value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                  <option value="success">Success</option>
                </select>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-lavender/40 p-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-primary" checked={announcementForm.broadcast} onChange={(e) => setAnnouncementForm({ ...announcementForm, broadcast: e.target.checked })} />
                <div>
                  <p className="text-sm font-semibold text-text-main">Broadcast as Notification</p>
                  <p className="text-xs text-text-secondary">Send an in-app notification to all active students.</p>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" className={buttonQuiet} onClick={() => setModal(null)}>Cancel</button>
              <button disabled={busy} className={buttonPrimary}>{busy ? 'Publishing…' : 'Publish Announcement'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
