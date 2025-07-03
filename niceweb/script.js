// DOM Elements
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartCount = document.querySelector(".cart-count");
const productsGrid = document.querySelector(".products-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchBtn = document.getElementById("search-btn");
const mobileMenu = document.getElementById("mobile-menu");
const navMenu = document.querySelector(".nav-menu");

// Shopping Cart
let cart = [];

// Chatbot State
let chatbotState = {
  isOpen: false,
  sessionId: null,
  isTyping: false,
  useAgent: true, // Use agent by default for enhanced capabilities
};

// Enhanced Gaming Products Data - Phase 3
const products = [
  // PC Gaming Category
  {
    id: 1,
    name: "ASUS ROG Strix G16 Gaming Laptop",
    description: "Intel Core i7-13650HX, RTX 4080, 16GB DDR5, 1TB SSD",
    price: 1799.99,
    originalPrice: 2199.99,
    category: "pc",
    icon: "fas fa-laptop",
    rating: 4.8,
    reviews: 524,
    badge: "bestseller",
    discount: 18,
    brand: "ASUS",
    specs: {
      processor: "Intel Core i7-13650HX",
      graphics: "NVIDIA RTX 4080 8GB",
      memory: "16GB DDR5",
      storage: "1TB NVMe SSD",
      display: "16\" QHD 165Hz"
    },
    compatibility: ["Windows 11", "VR Ready"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 2,
    name: "MSI GeForce RTX 4090 SUPRIM X",
    description: "24GB GDDR6X, RGB Mystic Light, Triple Fan Cooling",
    price: 1899.99,
    originalPrice: 2199.99,
    category: "pc",
    icon: "fas fa-microchip",
    rating: 4.9,
    reviews: 892,
    badge: "bestseller",
    discount: 14,
    brand: "MSI",
    specs: {
      memory: "24GB GDDR6X",
      coreClock: "2640 MHz",
      memorySpeed: "21 Gbps",
      outputs: "3x DisplayPort, 1x HDMI",
      powerRequirement: "850W"
    },
    compatibility: ["4K Gaming", "8K Ready", "VR", "Ray Tracing"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 3,
    name: "Alienware Aurora R15 Gaming Desktop",
    description: "Intel i9-13900F, RTX 4080, 32GB DDR5, Liquid Cooled",
    price: 3299.99,
    originalPrice: 3899.99,
    category: "pc",
    icon: "fas fa-desktop",
    rating: 4.7,
    reviews: 298,
    badge: "premium",
    discount: 15,
    brand: "Dell",
    specs: {
      processor: "Intel Core i9-13900F",
      graphics: "NVIDIA RTX 4080 16GB",
      memory: "32GB DDR5",
      storage: "1TB NVMe + 2TB HDD",
      cooling: "Liquid Cooling"
    },
    compatibility: ["Windows 11 Pro", "VR Ready", "4K Gaming"],
    inStock: true,
    fastShipping: false
  },

  // Console Gaming Category
  {
    id: 4,
    name: "PlayStation 5 Console (Slim)",
    description: "1TB SSD, 4K Gaming, Ray Tracing, DualSense Controller",
    price: 499.99,
    category: "console",
    icon: "fab fa-playstation",
    rating: 4.9,
    reviews: 1247,
    badge: "bestseller",
    brand: "Sony",
    specs: {
      storage: "1TB Custom SSD",
      resolution: "Up to 4K",
      frameRate: "Up to 120fps",
      audioTech: "3D Audio",
      backwardCompatibility: "PS4 Games"
    },
    compatibility: ["4K TV", "HDR", "VR2 Ready"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 5,
    name: "Xbox Series X Console",
    description: "1TB Custom SSD, 4K/120fps Gaming, Smart Delivery",
    price: 499.99,
    category: "console",
    icon: "fab fa-xbox",
    rating: 4.8,
    reviews: 923,
    badge: "bestseller",
    brand: "Microsoft",
    specs: {
      storage: "1TB Custom NVMe SSD",
      resolution: "Up to 4K",
      frameRate: "Up to 120fps",
      rayTracing: "Hardware Ray Tracing",
      gamePass: "Game Pass Compatible"
    },
    compatibility: ["4K TV", "HDR10", "Dolby Vision"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 6,
    name: "Nintendo Switch OLED Model",
    description: "7\" OLED Screen, Enhanced Audio, 64GB Internal Storage",
    price: 349.99,
    category: "console",
    icon: "fas fa-gamepad",
    rating: 4.7,
    reviews: 789,
    badge: "new",
    brand: "Nintendo",
    specs: {
      display: "7\" OLED Touchscreen",
      resolution: "1280x720 (Handheld)",
      storage: "64GB Internal",
      connectivity: "Wi-Fi, Bluetooth",
      batteryLife: "4.5-9 hours"
    },
    compatibility: ["Handheld", "TV Mode", "Tabletop"],
    inStock: true,
    fastShipping: true
  },

  // Gaming Accessories Category
  {
    id: 7,
    name: "Razer BlackWidow V4 Pro Mechanical Keyboard",
    description: "Green Switches, Chroma RGB, Magnetic Wrist Rest, USB-C",
    price: 229.99,
    originalPrice: 279.99,
    category: "accessories",
    icon: "fas fa-keyboard",
    rating: 4.6,
    reviews: 445,
    badge: "new",
    discount: 18,
    brand: "Razer",
    specs: {
      switches: "Razer Green Mechanical",
      lighting: "Chroma RGB Per-Key",
      connectivity: "USB-C + Wireless",
      features: "Programmable Macro Keys",
      batteryLife: "200 hours"
    },
    compatibility: ["Windows", "Mac", "Linux"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 8,
    name: "Logitech G Pro X Superlight 2",
    description: "25,600 DPI, HERO 2 Sensor, 60g Ultra-Light, Wireless",
    price: 159.99,
    originalPrice: 199.99,
    category: "accessories",
    icon: "fas fa-mouse",
    rating: 4.8,
    reviews: 672,
    badge: "bestseller",
    discount: 20,
    brand: "Logitech",
    specs: {
      sensor: "HERO 2 25K",
      dpi: "25,600 DPI",
      weight: "60g",
      connectivity: "LIGHTSPEED Wireless",
      batteryLife: "95 hours"
    },
    compatibility: ["Windows", "Mac", "Linux"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 9,
    name: "SteelSeries Arctis Nova Pro Wireless",
    description: "Active Noise Cancellation, Dual Audio, 38-hour Battery",
    price: 349.99,
    originalPrice: 399.99,
    category: "accessories",
    icon: "fas fa-headphones",
    rating: 4.7,
    reviews: 356,
    badge: "premium",
    discount: 13,
    brand: "SteelSeries",
    specs: {
      drivers: "40mm Neodymium",
      anc: "Active Noise Cancellation",
      connectivity: "2.4GHz + Bluetooth",
      batteryLife: "38 hours",
      microphone: "ClearCast Gen 2"
    },
    compatibility: ["PC", "PlayStation", "Xbox", "Switch", "Mobile"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 10,
    name: "ASUS ROG Swift PG32UQX Gaming Monitor",
    description: "32\" 4K Mini LED, 144Hz, G-Sync Ultimate, HDR1400",
    price: 2999.99,
    originalPrice: 3499.99,
    category: "accessories",
    icon: "fas fa-desktop",
    rating: 4.9,
    reviews: 187,
    badge: "premium",
    discount: 14,
    brand: "ASUS",
    specs: {
      size: "32-inch",
      resolution: "3840x2160 (4K)",
      refreshRate: "144Hz",
      panelType: "Mini LED",
      hdr: "DisplayHDR 1400"
    },
    compatibility: ["G-Sync Ultimate", "FreeSync", "HDR10"],
    inStock: false,
    fastShipping: false
  },
  {
    id: 11,
    name: "Secretlab TITAN Evo 2022 Gaming Chair",
    description: "Premium Leatherette, 4-Way Armrests, Magnetic Head Pillow",
    price: 519.99,
    originalPrice: 639.99,
    category: "accessories",
    icon: "fas fa-chair",
    rating: 4.5,
    reviews: 1205,
    badge: "bestseller",
    discount: 19,
    brand: "Secretlab",
    specs: {
      material: "PRIME 2.0 Leatherette",
      weightCapacity: "290 lbs",
      height: "Adjustable 130-140cm",
      armrests: "4-Way Adjustable",
      warranty: "5 years"
    },
    compatibility: ["Universal Fit", "All Desk Heights"],
    inStock: true,
    fastShipping: false
  },

  // Mobile Gaming Category
  {
    id: 12,
    name: "ASUS ROG Phone 7 Ultimate",
    description: "Snapdragon 8 Gen 2, 16GB RAM, 6000mAh, 165Hz Display",
    price: 1399.99,
    originalPrice: 1599.99,
    category: "mobile",
    icon: "fas fa-mobile-alt",
    rating: 4.6,
    reviews: 298,
    badge: "new",
    discount: 13,
    brand: "ASUS",
    specs: {
      processor: "Snapdragon 8 Gen 2",
      memory: "16GB LPDDR5X",
      storage: "512GB UFS 4.0",
      display: "6.78\" AMOLED 165Hz",
      battery: "6000mAh"
    },
    compatibility: ["5G", "AirTrigger 6", "ROG Vision"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 13,
    name: "Razer Kishi V2 Pro Mobile Controller",
    description: "Universal USB-C, Microswitches, Chroma RGB, Stream Deck",
    price: 149.99,
    category: "mobile",
    icon: "fas fa-gamepad",
    rating: 4.4,
    reviews: 423,
    badge: "new",
    brand: "Razer",
    specs: {
      connectivity: "USB-C Direct",
      compatibility: "Android & iPhone 15",
      switches: "Razer Microswitches",
      features: "Stream Deck Keys",
      app: "Razer Nexus"
    },
    compatibility: ["Android", "iPhone 15 Series", "Cloud Gaming"],
    inStock: true,
    fastShipping: true
  },
  {
    id: 14,
    name: "Backbone One PlayStation Edition",
    description: "PlayStation Licensed, Low Latency, Precise Controls",
    price: 99.99,
    category: "mobile",
    icon: "fas fa-gamepad",
    rating: 4.3,
    reviews: 567,
    badge: "bestseller",
    brand: "Backbone",
    specs: {
      connectivity: "Lightning/USB-C",
      latency: "Ultra-low",
      compatibility: "PlayStation Remote Play",
      passthrough: "Charging Pass-through",
      app: "Backbone App"
    },
    compatibility: ["iPhone", "Android", "PlayStation Remote Play"],
    inStock: true,
    fastShipping: true
  }
];

// Wishlist functionality
let wishlist = JSON.parse(localStorage.getItem('gameZoneWishlist')) || [];

// Advanced search and filter state
let searchState = {
  term: '',
  sortBy: 'relevance',
  priceRange: { min: 0, max: 5000 },
  brands: [],
  inStockOnly: false
};

// API Endpoint config
const BACKEND_URL =
  window.BACKEND_URL ||
  (typeof process !== "undefined" && process.env && process.env.BACKEND_URL) ||
  "http://localhost:5000";

// Initialize - Enhanced for Phase 3
document.addEventListener("DOMContentLoaded", function () {
  initializeComponents();
  loadProductsWithRetry(); // Enhanced loading with retry
  startCountdown();
  initEnhancedAnimations(); // Enhanced animations
  setupAdvancedSearch(); // Advanced search functionality
  setupMobileMenu();
  initializeChatbot();
  initializeAccessibility(); // New accessibility features
  updateWishlistUI(); // Initialize wishlist UI
  
  // Progressive enhancement - reduce motion if preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduce-motion');
  }
});

function initializeComponents() {
  // Cart Events
  cartBtn.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartModal);

  // Product Filters
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      e.target.classList.add("active");

      // Get filter category
      const category = e.target.dataset.filter;

      // Filter products with animation
      productsGrid.style.opacity = "0.5";
      setTimeout(() => {
        loadProducts(category);
      }, 500);
    });
  });
}

// Initialize Chatbot
function initializeChatbot() {
  // Check if chatbot elements exist
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");

  if (!chatbotToggle || !chatbotContainer) {
    console.log("Chatbot elements not found, creating them...");
    createChatbotElements();
    return;
  }

  // Set up event listeners
  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.classList.toggle("open");
    chatbotToggle.classList.toggle("active");
    if (chatbotContainer.classList.contains("open")) {
      chatbotInput.focus();
      // Send welcome message if it's a new session
      if (!chatbotState.sessionId) {
        setTimeout(() => {
          addChatMessage(
            "bot",
            "🎮 Welcome to GameZone! I'm your AI gaming assistant. How can I help you find the perfect gaming gear today?"
          );
        }, 500);
      }
    }
  });

  // Send message on button click
  chatbotSend.addEventListener("click", sendMessage);

  // Send message on Enter key press
  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // Close chatbot on outside click
  document.addEventListener("click", (e) => {
    if (
      chatbotContainer.classList.contains("open") &&
      !chatbotContainer.contains(e.target) &&
      !chatbotToggle.contains(e.target)
    ) {
      chatbotContainer.classList.remove("open");
      chatbotToggle.classList.remove("active");
    }
  });
}

// Create Chatbot Elements
function createChatbotElements() {
  // Create chatbot toggle button
  const chatbotToggle = document.createElement("div");
  chatbotToggle.id = "chatbot-toggle";
  chatbotToggle.className = "chatbot-toggle";
  chatbotToggle.innerHTML = '<i class="fas fa-comments"></i>';

  // Create chatbot container
  const chatbotContainer = document.createElement("div");
  chatbotContainer.id = "chatbot-container";
  chatbotContainer.className = "chatbot-container";

  chatbotContainer.innerHTML = `
    <div class="chatbot-header">
      <div class="chatbot-title">
        <i class="fas fa-robot"></i>
        <span>GameZone AI Assistant</span>
      </div>
      <div class="chatbot-status">
        <span class="status-indicator online"></span>
        <span>Online</span>
      </div>
    </div>
    <div class="chatbot-messages" id="chatbot-messages"></div>
    <div class="chatbot-input-area">
      <input type="text" id="chatbot-input" placeholder="Ask me about gaming products..." />
      <button id="chatbot-send">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
    <div class="chatbot-footer">
      <small>Powered by LangChain & Gemini AI</small>
    </div>
  `;

  // Add to page
  document.body.appendChild(chatbotToggle);
  document.body.appendChild(chatbotContainer);

  // Initialize after creating elements
  setTimeout(() => {
    initializeChatbot();
  }, 100);
}

// Send Message Function
async function sendMessage() {
  const chatbotInput = document.getElementById("chatbot-input");
  const messageText = chatbotInput.value.trim();

  if (messageText === "" || chatbotState.isTyping) return;

  // Add user message to chat
  addChatMessage("user", messageText);
  chatbotInput.value = "";
  chatbotState.isTyping = true;

  // Show typing indicator
  addTypingIndicator();

  try {
    // Use either agent or regular chatbot based on state
    const endpoint = getApiEndpoint(
      chatbotState.useAgent ? "/api/agent/chat" : "/api/chatbot/chat"
    );

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
        sessionId: chatbotState.sessionId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Update session ID if provided
      if (data.sessionId) {
        chatbotState.sessionId = data.sessionId;
      }

      // Remove typing indicator and add bot response
      removeTypingIndicator();
      addChatMessage("bot", data.response, data.toolsUsed);
    } else {
      removeTypingIndicator();
      addChatMessage(
        "bot",
        "Sorry, I'm having trouble right now. Please try again later."
      );
    }
  } catch (error) {
    console.error("Chat error:", error);
    removeTypingIndicator();
    addChatMessage(
      "bot",
      "Sorry, I'm experiencing connection issues. Please try again later."
    );
  } finally {
    chatbotState.isTyping = false;
  }
}

// Add Chat Message
function addChatMessage(sender, text, toolsUsed = null) {
  const chatbotMessages = document.getElementById("chatbot-messages");
  const messageElement = document.createElement("div");
  messageElement.className = `chat-message ${sender}`;

  // Create message content
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = text;
  messageElement.appendChild(messageContent);

  // Add tools used indicator if available
  if (toolsUsed && toolsUsed.length > 0) {
    const toolsElement = document.createElement("div");
    toolsElement.className = "tools-used";
    toolsElement.innerHTML = `<small>🔧 Used: ${toolsUsed.join(", ")}</small>`;
    messageElement.appendChild(toolsElement);
  }

  chatbotMessages.appendChild(messageElement);

  // Scroll to bottom of chat
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Typing indicator functions
function addTypingIndicator() {
  const chatbotMessages = document.getElementById("chatbot-messages");
  const typingElement = document.createElement("div");
  typingElement.className = "chat-message bot typing-indicator";
  typingElement.id = "typing-indicator";
  typingElement.innerHTML =
    '<div class="typing-dots"><span></span><span></span><span></span></div>';
  chatbotMessages.appendChild(typingElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingElement = document.getElementById("typing-indicator");
  if (typingElement) {
    typingElement.remove();
  }
}

// Load Products
function loadProducts(category = "all") {
  productsGrid.innerHTML = "";

  const filteredProducts =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  filteredProducts.forEach((product, index) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);

    // Add animation delay
    setTimeout(() => {
      productCard.style.opacity = "1";
      productCard.style.transform = "translateY(0)";
    }, index * 100);
  });

  // Restore grid opacity
  setTimeout(() => {
    productsGrid.style.opacity = "1";
  }, 600);
}

// Enhanced Product Card Creation - Phase 3
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.style.opacity = "0";
  card.style.transform = "translateY(20px)";
  card.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

  // Check if product is in wishlist
  const isInWishlist = wishlist.some(item => item.id === product.id);

  // Generate star rating HTML
  const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHTML += '<span class="star">★</span>';
      } else if (i === fullStars && hasHalfStar) {
        starsHTML += '<span class="star half">★</span>';
      } else {
        starsHTML += '<span class="star empty">★</span>';
      }
    }
    return starsHTML;
  };

  // Generate enhanced badge HTML
  const generateBadge = (product) => {
    let badges = '';
    
    if (product.badge) {
      badges += `<div class="product-badge ${product.badge}">${product.badge}</div>`;
    }
    
    if (product.discount) {
      badges += `<div class="product-badge discount">-${product.discount}%</div>`;
    }
    
    if (!product.inStock) {
      badges += `<div class="product-badge out-of-stock">Out of Stock</div>`;
    } else if (product.fastShipping) {
      badges += `<div class="product-badge fast-shipping">Fast Shipping</div>`;
    }
    
    return badges;
  };

  // Generate enhanced price HTML
  const generatePrice = (product) => {
    let priceHTML = `<span class="current-price">$${product.price}</span>`;
    
    if (product.originalPrice) {
      const savings = (product.originalPrice - product.price).toFixed(2);
      priceHTML = `
        <span class="original-price">$${product.originalPrice}</span>
        ${priceHTML}
        <span class="savings">Save $${savings}</span>
      `;
    }
    
    return priceHTML;
  };

  // Generate product specs preview
  const generateSpecsPreview = (product) => {
    if (!product.specs) return '';
    
    const specsKeys = Object.keys(product.specs).slice(0, 2); // Show first 2 specs
    const specsHTML = specsKeys.map(key => {
      const value = product.specs[key];
      return `<span class="spec-item">${key}: ${value}</span>`;
    }).join('');
    
    return specsHTML ? `<div class="specs-preview">${specsHTML}</div>` : '';
  };

  // Generate compatibility badges
  const generateCompatibility = (product) => {
    if (!product.compatibility || product.compatibility.length === 0) return '';
    
    const compatItems = product.compatibility.slice(0, 3).map(item =>
      `<span class="compat-tag">${item}</span>`
    ).join('');
    
    return `<div class="compatibility">${compatItems}</div>`;
  };

  card.innerHTML = `
    <div class="product-image">
      ${generateBadge(product)}
      <div class="product-actions">
        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}" aria-label="Add to wishlist">
          <i class="fas fa-heart"></i>
        </button>
        <button class="quick-view-btn" data-id="${product.id}" aria-label="Quick view">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <i class="${product.icon}" aria-hidden="true"></i>
      ${product.brand ? `<div class="brand-logo">${product.brand}</div>` : ''}
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.name}</h3>
      ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
      
      ${product.rating ? `
        <div class="product-rating">
          <div class="stars">${generateStars(product.rating)}</div>
          <span class="rating-text">${product.rating} (${product.reviews || 0} reviews)</span>
        </div>
      ` : ''}
      
      ${generateSpecsPreview(product)}
      ${generateCompatibility(product)}
      
      <div class="product-price">
        ${generatePrice(product)}
      </div>
      
      <div class="product-controls">
        <div class="quantity-controls" style="display: none;">
          <button class="qty-btn minus" data-id="${product.id}">-</button>
          <span class="quantity">1</span>
          <button class="qty-btn plus" data-id="${product.id}">+</button>
        </div>
        <button class="add-to-cart ${!product.inStock ? 'disabled' : ''}" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
          <span class="btn-text">${!product.inStock ? 'Out of Stock' : 'Add to Cart'}</span>
          <span class="loading-spinner" style="display: none;"></span>
        </button>
      </div>
    </div>
  `;

  // Enhanced event listeners
  const addToCartBtn = card.querySelector(".add-to-cart");
  const wishlistBtn = card.querySelector(".wishlist-btn");
  const quickViewBtn = card.querySelector(".quick-view-btn");

  // Add to cart functionality with enhanced loading state
  if (product.inStock) {
    addToCartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Add loading state
      addToCartBtn.classList.add('loading');
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        addToCart(product);
        addToCartBtn.classList.remove('loading');
        
        // Show success animation
        addToCartBtn.classList.add('success');
        setTimeout(() => {
          addToCartBtn.classList.remove('success');
        }, 1000);
      }, 600);
    });
  }

  // Wishlist functionality
  wishlistBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleWishlist(product);
    wishlistBtn.classList.toggle('active');
    
    // Add animation
    wishlistBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      wishlistBtn.style.transform = 'scale(1)';
    }, 200);
  });

  // Quick view functionality
  quickViewBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showQuickView(product);
  });

  return card;
}

// Shopping Cart Functions
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  // Update cart count
  cartCount.textContent = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Update cart items
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = "Total: $0.00";
    return;
  }

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
            <span>${item.name}</span>
            <div class="cart-item-controls">
                <span>$${item.price} x ${item.quantity}</span>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

    cartItems.appendChild(cartItem);
  });

  // Add remove functionality
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(e.target.closest(".remove-item").dataset.id);
      removeFromCart(productId);
    });
  });

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

function openCart() {
  cartModal.style.display = "flex";
}

function closeCartModal() {
  cartModal.style.display = "none";
}

// Enhanced Notification System
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => {
    notif.style.transform = 'translateX(120%) translateY(-20px)';
    setTimeout(() => {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    }, 300);
  });

  document.body.appendChild(notification);

  // Trigger entry animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Auto-remove notification
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, duration);

  // Add click to dismiss
  notification.addEventListener('click', () => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  });
}

// Search Functionality
function setupSearch() {
  searchBtn.addEventListener("click", () => {
    const searchTerm = prompt("Search for products:");
    if (searchTerm) {
      searchProducts(searchTerm);
    }
  });
}

function searchProducts(searchTerm) {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  productsGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = '<p class="no-results">No products found</p>';
    return;
  }

  filteredProducts.forEach((product, index) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);

    setTimeout(() => {
      productCard.style.opacity = "1";
      productCard.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// Mobile Menu
function setupMobileMenu() {
  mobileMenu.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });
}

// Countdown Timer
function startCountdown() {
  const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const endTime = now + 12 * 60 * 60 * 1000 + 45 * 60 * 1000 + 30 * 1000; // 12h 45m 30s from now
    const timeLeft = endTime - now;

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      const hoursElement = document.getElementById("hours");
      const minutesElement = document.getElementById("minutes");
      const secondsElement = document.getElementById("seconds");

      if (hoursElement)
        hoursElement.textContent = hours.toString().padStart(2, "0");
      if (minutesElement)
        minutesElement.textContent = minutes.toString().padStart(2, "0");
      if (secondsElement)
        secondsElement.textContent = seconds.toString().padStart(2, "0");
    } else {
      clearInterval(countdownInterval);
      const dealTimer = document.querySelector(".deal-timer");
      if (dealTimer) {
        dealTimer.innerHTML = '<p style="color: #ff0080;">Deal Expired!</p>';
      }
    }
  }, 1000);
}

// Animations
function initAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll(".category-card, .product-card, .deal-item")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Newsletter Form
document.addEventListener("DOMContentLoaded", function () {
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      if (email) {
        showNotification("Thank you for subscribing to our newsletter!");
        this.reset();
      }
    });
  }
});

function getApiEndpoint(path) {
  if (BACKEND_URL.endsWith("/")) {
    return BACKEND_URL + path.replace(/^\//, "");
  }
  return BACKEND_URL + (path.startsWith("/") ? path : "/" + path);
}

// Enhanced Functions for Phase 3 Features

// Wishlist Management
function toggleWishlist(product) {
  const existingIndex = wishlist.findIndex(item => item.id === product.id);
  
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    showNotification(`${product.name} removed from wishlist`, 'info');
  } else {
    wishlist.push(product);
    showNotification(`${product.name} added to wishlist!`, 'success');
  }
  
  // Save to localStorage
  localStorage.setItem('gameZoneWishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  // Update wishlist count if wishlist icon exists
  const wishlistCount = document.getElementById('wishlist-count');
  if (wishlistCount) {
    wishlistCount.textContent = wishlist.length;
  }
}

// Quick View Modal
function showQuickView(product) {
  // Remove existing modal if present
  const existingModal = document.getElementById('quick-view-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'quick-view-modal';
  modal.className = 'quick-view-modal';
  
  const specsHTML = product.specs ? Object.entries(product.specs).map(([key, value]) => 
    `<div class="spec-row"><span class="spec-key">${key}:</span> <span class="spec-value">${value}</span></div>`
  ).join('') : '';
  
  const compatHTML = product.compatibility ? product.compatibility.map(item => 
    `<span class="compat-badge">${item}</span>`
  ).join('') : '';

  modal.innerHTML = `
    <div class="quick-view-content">
      <div class="quick-view-header">
        <h3>${product.name}</h3>
        <button class="close-quick-view" aria-label="Close quick view">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="quick-view-body">
        <div class="quick-view-image">
          <i class="${product.icon}"></i>
          ${product.brand ? `<div class="brand-badge">${product.brand}</div>` : ''}
        </div>
        <div class="quick-view-details">
          <p class="product-description">${product.description || 'Premium gaming product designed for enthusiasts.'}</p>
          
          ${product.rating ? `
            <div class="rating-section">
              <div class="stars">${generateStarsHTML(product.rating)}</div>
              <span>${product.rating} (${product.reviews} reviews)</span>
            </div>
          ` : ''}
          
          <div class="price-section">
            <span class="current-price">$${product.price}</span>
            ${product.originalPrice ? `
              <span class="original-price">$${product.originalPrice}</span>
              <span class="savings">Save $${(product.originalPrice - product.price).toFixed(2)}</span>
            ` : ''}
          </div>
          
          ${specsHTML ? `
            <div class="specs-section">
              <h4>Specifications</h4>
              <div class="specs-grid">${specsHTML}</div>
            </div>
          ` : ''}
          
          ${compatHTML ? `
            <div class="compatibility-section">
              <h4>Compatibility</h4>
              <div class="compat-tags">${compatHTML}</div>
            </div>
          ` : ''}
          
          <div class="quick-view-actions">
            <button class="btn btn-primary add-to-cart-modal" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
              <i class="fas fa-shopping-cart"></i>
              ${!product.inStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button class="btn btn-secondary toggle-wishlist-modal" data-id="${product.id}">
              <i class="fas fa-heart"></i>
              ${wishlist.some(item => item.id === product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="quick-view-backdrop"></div>
  `;

  document.body.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.close-quick-view').addEventListener('click', () => modal.remove());
  modal.querySelector('.quick-view-backdrop').addEventListener('click', () => modal.remove());
  
  const addToCartModalBtn = modal.querySelector('.add-to-cart-modal');
  if (addToCartModalBtn && product.inStock) {
    addToCartModalBtn.addEventListener('click', () => {
      addToCart(product);
      modal.remove();
    });
  }
  
  modal.querySelector('.toggle-wishlist-modal').addEventListener('click', () => {
    toggleWishlist(product);
    modal.remove();
  });

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function generateStarsHTML(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHTML += '<span class="star">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      starsHTML += '<span class="star half">★</span>';
    } else {
      starsHTML += '<span class="star empty">★</span>';
    }
  }
  return starsHTML;
}

// Enhanced Search Functionality
function setupAdvancedSearch() {
  // Create search modal if it doesn't exist
  if (!document.getElementById('search-modal')) {
    createSearchModal();
  }
  
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      showSearchModal();
    });
  }
}

function createSearchModal() {
  const modal = document.createElement('div');
  modal.id = 'search-modal';
  modal.className = 'search-modal';
  
  modal.innerHTML = `
    <div class="search-modal-content">
      <div class="search-modal-header">
        <h3>Search Products</h3>
        <button class="close-search" aria-label="Close search">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="search-modal-body">
        <div class="search-input-container">
          <input type="text" id="advanced-search-input" placeholder="Search for gaming products..." />
          <button class="search-submit">
            <i class="fas fa-search"></i>
          </button>
        </div>
        
        <div class="search-filters">
          <div class="filter-group">
            <label>Category:</label>
            <select id="category-filter">
              <option value="all">All Categories</option>
              <option value="pc">PC Gaming</option>
              <option value="console">Consoles</option>
              <option value="accessories">Accessories</option>
              <option value="mobile">Mobile Gaming</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Price Range:</label>
            <div class="price-range">
              <input type="range" id="price-min" min="0" max="5000" value="0" />
              <input type="range" id="price-max" min="0" max="5000" value="5000" />
              <div class="price-display">
                <span id="price-min-display">$0</span> - <span id="price-max-display">$5000</span>
              </div>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Sort By:</label>
            <select id="sort-filter">
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" id="in-stock-only" />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>
        
        <div class="search-results" id="search-results">
          <p class="search-placeholder">Enter a search term to find products</p>
        </div>
      </div>
    </div>
    <div class="search-modal-backdrop"></div>
  `;
  
  document.body.appendChild(modal);
  setupSearchModalEvents();
}

function setupSearchModalEvents() {
  const modal = document.getElementById('search-modal');
  const closeBtn = modal.querySelector('.close-search');
  const backdrop = modal.querySelector('.search-modal-backdrop');
  const searchInput = modal.querySelector('#advanced-search-input');
  const searchSubmit = modal.querySelector('.search-submit');
  
  closeBtn.addEventListener('click', () => hideSearchModal());
  backdrop.addEventListener('click', () => hideSearchModal());
  
  searchInput.addEventListener('input', debounce(performSearch, 300));
  searchSubmit.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  
  // Filter event listeners
  modal.querySelector('#category-filter').addEventListener('change', performSearch);
  modal.querySelector('#sort-filter').addEventListener('change', performSearch);
  modal.querySelector('#in-stock-only').addEventListener('change', performSearch);
  
  // Price range listeners
  const priceMin = modal.querySelector('#price-min');
  const priceMax = modal.querySelector('#price-max');
  priceMin.addEventListener('input', updatePriceDisplay);
  priceMax.addEventListener('input', updatePriceDisplay);
  priceMin.addEventListener('change', performSearch);
  priceMax.addEventListener('change', performSearch);
}

function showSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
    modal.querySelector('#advanced-search-input').focus();
  }, 10);
}

function hideSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

function performSearch() {
  const modal = document.getElementById('search-modal');
  const searchTerm = modal.querySelector('#advanced-search-input').value.toLowerCase();
  const category = modal.querySelector('#category-filter').value;
  const sortBy = modal.querySelector('#sort-filter').value;
  const inStockOnly = modal.querySelector('#in-stock-only').checked;
  const priceMin = parseInt(modal.querySelector('#price-min').value);
  const priceMax = parseInt(modal.querySelector('#price-max').value);
  
  let filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm)) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm));
    
    const matchesCategory = category === 'all' || product.category === category;
    const matchesPrice = product.price >= priceMin && product.price <= priceMax;
    const matchesStock = !inStockOnly || product.inStock;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });
  
  // Sort results
  filteredProducts.sort((a, b) => {
    switch(sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0);
      default:
        return 0;
    }
  });
  
  displaySearchResults(filteredProducts);
}

function displaySearchResults(results) {
  const resultsContainer = document.getElementById('search-results');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p class="no-results">No products found matching your criteria</p>';
    return;
  }
  
  resultsContainer.innerHTML = `
    <div class="search-results-header">
      <p>Found ${results.length} product${results.length !== 1 ? 's' : ''}</p>
    </div>
    <div class="search-results-grid">
      ${results.map(product => createSearchResultCard(product)).join('')}
    </div>
  `;
}

function createSearchResultCard(product) {
  const isInWishlist = wishlist.some(item => item.id === product.id);
  
  return `
    <div class="search-result-card" data-id="${product.id}">
      <div class="result-image">
        <i class="${product.icon}"></i>
      </div>
      <div class="result-info">
        <h4>${product.name}</h4>
        <p class="result-price">$${product.price}</p>
        ${product.rating ? `<div class="result-rating">${generateStarsHTML(product.rating)} ${product.rating}</div>` : ''}
      </div>
      <div class="result-actions">
        <button class="btn-icon wishlist-result ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
          <i class="fas fa-heart"></i>
        </button>
        <button class="btn-icon add-cart-result" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
        </button>
      </div>
    </div>
  `;
}

function updatePriceDisplay() {
  const modal = document.getElementById('search-modal');
  const priceMin = modal.querySelector('#price-min').value;
  const priceMax = modal.querySelector('#price-max').value;
  
  modal.querySelector('#price-min-display').textContent = `$${priceMin}`;
  modal.querySelector('#price-max-display').textContent = `$${priceMax}`;
}

// Utility function for debouncing
function debounce(func, wait) {
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

// Progressive Content Loading with Retry
async function loadProductsWithRetry(category = 'all', retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  try {
    // Show loading state
    showLoadingState();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    // Simulate potential failure for demo (5% chance)
    if (Math.random() < 0.05 && retryCount === 0) {
      throw new Error('Network error');
    }
    
    // Load products successfully
    loadProducts(category);
    hideLoadingState();
    
  } catch (error) {
    console.error('Failed to load products:', error);
    
    if (retryCount < maxRetries) {
      showRetryState(retryCount + 1);
      setTimeout(() => {
        loadProductsWithRetry(category, retryCount + 1);
      }, retryDelay * (retryCount + 1)); // Exponential backoff
    } else {
      showErrorState();
    }
  }
}

function showLoadingState() {
  const productsGrid = document.querySelector('.products-grid');
  productsGrid.innerHTML = `
    <div class="loading-message">
      <div class="loading-spinner-large"></div>
      <p>Loading awesome gaming products...</p>
    </div>
  `;
}

function showRetryState(attempt) {
  const productsGrid = document.querySelector('.products-grid');
  productsGrid.innerHTML = `
    <div class="retry-message">
      <div class="loading-spinner-large"></div>
      <p>Connection issue detected. Retrying... (Attempt ${attempt}/3)</p>
    </div>
  `;
}

function showErrorState() {
  const productsGrid = document.querySelector('.products-grid');
  productsGrid.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Failed to Load Products</h3>
      <p>We're having trouble loading products. Please check your connection and try again.</p>
      <button class="btn btn-primary retry-btn" onclick="loadProductsWithRetry()">
        <i class="fas fa-redo"></i>
        Retry
      </button>
    </div>
  `;
}

function hideLoadingState() {
  // Loading state will be replaced by products
}

// Enhanced Animations - Phase 3
function initEnhancedAnimations() {
  // Advanced intersection observer for scroll animations
  const observerOptions = {
    threshold: [0.1, 0.3, 0.7],
    rootMargin: "0px 0px -50px 0px",
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const animationType = target.dataset.animation || 'fade-up';
        
        // Add staggered animation delays for groups
        if (target.classList.contains('product-card')) {
          const index = Array.from(target.parentNode.children).indexOf(target);
          target.style.animationDelay = `${index * 100}ms`;
        }
        
        target.classList.add('animate-in', animationType);
        
        // Add pulse effect for interactive elements
        if (target.classList.contains('category-card')) {
          target.addEventListener('mouseenter', () => {
            if (!document.body.classList.contains('reduce-motion')) {
              target.style.transform = 'scale(1.05) translateY(-5px)';
            }
          });
          
          target.addEventListener('mouseleave', () => {
            target.style.transform = 'scale(1) translateY(0)';
          });
        }
      }
    });
  }, observerOptions);

  // Enhanced particle system for hero section
  initParticleSystem();

  // Observe elements for animation
  document.querySelectorAll('.category-card, .product-card, .deal-item, .section-title').forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    animationObserver.observe(el);
  });

  // Enhanced navbar scroll effect
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const header = document.querySelector(".header");
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      header.classList.add("scrolled");
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }
    } else {
      header.classList.remove("scrolled", "hidden");
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });

  // Smooth scrolling with enhanced easing
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
      }
    });
  });
}

// Enhanced Particle System
function initParticleSystem() {
  const heroParticles = document.querySelector('.hero-particles');
  if (!heroParticles) return;

  // Clear existing particles
  heroParticles.innerHTML = '';

  // Create floating geometric shapes
  const shapes = ['circle', 'triangle', 'square', 'diamond'];
  const colors = ['var(--warm-orange)', 'var(--warm-gold)', 'var(--brand-cyan)', 'var(--gaming-purple)'];

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = `particle ${shapes[Math.floor(Math.random() * shapes.length)]}`;
    
    // Random positioning
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = 4 + Math.random() * 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random animation duration
    const duration = 10 + Math.random() * 20;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * duration}s`;
    
    heroParticles.appendChild(particle);
  }

  // Mouse interaction with particles
  heroParticles.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('reduce-motion')) return;
    
    const rect = heroParticles.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    document.querySelectorAll('.particle').forEach((particle, index) => {
      const distance = Math.sqrt(
        Math.pow(x - parseFloat(particle.style.left) / 100, 2) + 
        Math.pow(y - parseFloat(particle.style.top) / 100, 2)
      );
      
      if (distance < 0.15) {
        particle.style.transform = `scale(${1.5 + Math.random() * 0.5}) rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = '0.8';
      } else {
        particle.style.transform = 'scale(1) rotate(0deg)';
        particle.style.opacity = '0.3';
      }
    });
  });
}

// Accessibility Enhancements - Phase 3
function initializeAccessibility() {
  // Enhanced keyboard navigation
  setupKeyboardNavigation();
  
  // ARIA live regions for dynamic content
  createLiveRegions();
  
  // Focus management
  setupFocusManagement();
  
  // Screen reader announcements
  setupScreenReaderSupport();
}

function setupKeyboardNavigation() {
  // Enhanced keyboard navigation for product cards
  document.addEventListener('keydown', (e) => {
    const focusedElement = document.activeElement;
    
    if (focusedElement.classList.contains('product-card')) {
      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Open quick view
          const productId = focusedElement.querySelector('[data-id]').dataset.id;
          const product = products.find(p => p.id == productId);
          if (product) showQuickView(product);
          break;
        
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          focusNextProduct(focusedElement);
          break;
        
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          focusPrevProduct(focusedElement);
          break;
        
        case 'c':
          // Add to cart shortcut
          e.preventDefault();
          const addBtn = focusedElement.querySelector('.add-to-cart');
          if (addBtn && !addBtn.disabled) addBtn.click();
          break;
        
        case 'w':
          // Wishlist shortcut
          e.preventDefault();
          const wishBtn = focusedElement.querySelector('.wishlist-btn');
          if (wishBtn) wishBtn.click();
          break;
      }
    }
    
    // Global shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'k':
          e.preventDefault();
          showSearchModal();
          break;
      }
    }
    
    // Escape key handling
    if (e.key === 'Escape') {
      closeModals();
    }
  });
}

function focusNextProduct(current) {
  const products = Array.from(document.querySelectorAll('.product-card'));
  const currentIndex = products.indexOf(current);
  const nextIndex = (currentIndex + 1) % products.length;
  products[nextIndex].focus();
}

function focusPrevProduct(current) {
  const products = Array.from(document.querySelectorAll('.product-card'));
  const currentIndex = products.indexOf(current);
  const prevIndex = currentIndex === 0 ? products.length - 1 : currentIndex - 1;
  products[prevIndex].focus();
}

function createLiveRegions() {
  // Create ARIA live region for announcements
  const liveRegion = document.createElement('div');
  liveRegion.id = 'live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  
  document.body.appendChild(liveRegion);
}

function announceToScreenReader(message) {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}

function setupFocusManagement() {
  // Manage focus for modals
  document.addEventListener('show-modal', (e) => {
    const modal = e.target;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    // Trap focus within modal
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        trapFocus(e, focusableElements);
      }
    });
  });
}

function trapFocus(e, focusableElements) {
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

function setupScreenReaderSupport() {
  // Enhanced product card accessibility
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const productName = e.target.closest('.product-card').querySelector('.product-title').textContent;
      announceToScreenReader(`${productName} added to shopping cart`);
    }
    
    if (e.target.classList.contains('wishlist-btn')) {
      const productName = e.target.closest('.product-card').querySelector('.product-title').textContent;
      const isActive = e.target.classList.contains('active');
      announceToScreenReader(`${productName} ${isActive ? 'added to' : 'removed from'} wishlist`);
    }
  });
}

function closeModals() {
  // Close all open modals
  const modals = document.querySelectorAll('.quick-view-modal, .search-modal, .cart-modal');
  modals.forEach(modal => {
    if (modal.style.display !== 'none') {
      modal.style.display = 'none';
      modal.classList.remove('show');
    }
  });
}

// Performance Optimizations
function optimizeAnimations() {
  // Use CSS transforms for better performance
  const style = document.createElement('style');
  style.textContent = `
    .reduce-motion * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    .product-card {
      will-change: transform, opacity;
    }
    
    .particle {
      will-change: transform, opacity;
      backface-visibility: hidden;
    }
  `;
  document.head.appendChild(style);
}

// Initialize performance optimizations
optimizeAnimations();
