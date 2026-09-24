export const validateFullName = (name = '') => {
  const normalized = name.trim();
  if (normalized.length < 2) return 'Full name must contain at least 2 characters';
  if (normalized.length > 100) return 'Full name must be at most 100 characters';
  return '';
};

export const validateGraduationYear = (year) => {
  if (year === '' || year === null || year === undefined) return '';
  if (!Number.isInteger(year) || year < 1950 || year > 2150) return 'Enter a valid graduation year between 1950 and 2150';
  return '';
};
