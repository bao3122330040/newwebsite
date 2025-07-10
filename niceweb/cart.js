// cart.js
// Shopping Cart Module
let cart = [];

export function addToCart(product, showNotification, updateCartUI) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
  showNotification(`${product.name} added to cart!`);
}

export function removeFromCart(productId, updateCartUI) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

export function getCart() {
  return cart;
}

export function setCart(newCart) {
  cart = newCart;
}
