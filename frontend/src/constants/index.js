export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const EDUCATION_LEVELS = ['High School', 'Diploma', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Other'];
export const EXPERIENCE_LEVELS = ['Student', 'Entry-level', 'Early career', 'Mid career', 'Experienced'];

export const WORK_TYPES = ['Remote', 'Hybrid', 'On-site'];

export const INTEREST_OPTIONS = [
  'Artificial Intelligence',
  'Web Development',
  'Data Science',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX',
  'Blockchain',
  'Mobile Development',
  'DevOps',
  'Machine Learning',
];

export const CAREER_DOMAIN_OPTIONS = [
  'Software Engineering',
  'Data & Analytics',
  'Artificial Intelligence',
  'Cloud & DevOps',
  'Cybersecurity',
  'Product & Design',
  'Business & Finance',
  'Healthcare',
  'Education',
  'Research',
];

export const SKILL_CATEGORIES = [
  'Programming',
  'Framework',
  'Database',
  'Cloud',
  'Soft Skills',
  'Tools',
  'Other',
];

export const PROFILE_WEIGHTS = {
  basicInfo: 15,
  education: 20,
  skills: 20,
  interests: 10,
  careerGoals: 20,
  projects: 10,
  certifications: 5,
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Profile', path: '/profile', icon: 'User' },
  { label: 'Career', path: '/career', icon: 'Briefcase' },
  { label: 'Skills', path: '/skills', icon: 'Brain' },


  { label: 'Learning', path: '/learning', icon: 'BookOpen' },
  { label: 'Assessment', path: '/assessment', icon: 'ClipboardCheck' },
  { label: 'Resume', path: '/resume', icon: 'FileText', comingSoon: true },
  { label: 'Placement', path: '/placement', icon: 'Target', comingSoon: true },
];
