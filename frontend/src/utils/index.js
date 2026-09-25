export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => {
      if (typeof item === 'string') return item;
      const message = item.message || item.msg || 'Invalid value';
      return item.field ? `${item.field}: ${message}` : message;
    }).join(', ');
  }
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || 'Something went wrong';
};
