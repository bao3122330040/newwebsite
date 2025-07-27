// main.js
// Main entry point for the app
import { initializeAccessibility } from './accessibility.js';
import { showNotification } from './notification.js';
import { products } from './products.js';
import * as cartModule from './cart.js';
import * as wishlistModule from './wishlist.js';
import { loadProducts, createProductCard } from './productGrid.js';
import { setupAdvancedSearch } from './search.js';
import { initializeChatbot } from './chatbot.js';
import { initEnhancedAnimations, optimizeAnimations } from './ui.js';

document.addEventListener("DOMContentLoaded", function () {
    initializeAccessibility();
    optimizeAnimations();
    initEnhancedAnimations();
    setupAdvancedSearch();
    initializeChatbot();
    // Example: Load products into grid
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        loadProducts('all', productsGrid, createProductCard);
    }
});

// Export for debugging
window.cartModule = cartModule;
window.wishlistModule = wishlistModule;
window.products = products;
