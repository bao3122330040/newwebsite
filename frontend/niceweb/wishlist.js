// wishlist.js
// Wishlist Module
let wishlist = JSON.parse(localStorage.getItem("gameZoneWishlist")) || [];

export function toggleWishlist(product, showNotification, updateWishlistUI) {
  const existingIndex = wishlist.findIndex((item) => item.id === product.id);
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    showNotification(`${product.name} removed from wishlist`, "info");
  } else {
    wishlist.push(product);
    showNotification(`${product.name} added to wishlist!`, "success");
  }
  localStorage.setItem("gameZoneWishlist", JSON.stringify(wishlist));
  updateWishlistUI();
}

export function getWishlist() {
  return wishlist;
}

export function setWishlist(newWishlist) {
  wishlist = newWishlist;
  localStorage.setItem("gameZoneWishlist", JSON.stringify(wishlist));
}
