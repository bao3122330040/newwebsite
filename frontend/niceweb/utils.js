// utils.js
// Utility functions
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getApiEndpoint(path, BACKEND_URL) {
  if (BACKEND_URL.endsWith("/")) {
    return BACKEND_URL + path.replace(/^\//, "");
  }
  return BACKEND_URL + (path.startsWith("/") ? path : "/" + path);
}
