// products.js
// Product Data and Utilities
export const products = [
  // ... Copy the products array from script.js ...
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}
