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

// Sample Products Data
const products = [
  {
    id: 1,
    name: "Gaming Laptop RTX 4080",
    price: 1299.99,
    category: "pc",
    icon: "fas fa-laptop",
  },
  {
    id: 2,
    name: "Mechanical RGB Keyboard",
    price: 149.99,
    category: "accessories",
    icon: "fas fa-keyboard",
  },
  {
    id: 3,
    name: "PlayStation 5 Console",
    price: 499.99,
    category: "console",
    icon: "fab fa-playstation",
  },
  {
    id: 4,
    name: "Gaming Mouse Pro",
    price: 79.99,
    category: "accessories",
    icon: "fas fa-mouse",
  },
  {
    id: 5,
    name: "Gaming Headset 7.1",
    price: 129.99,
    category: "accessories",
    icon: "fas fa-headphones",
  },
  {
    id: 6,
    name: "Xbox Series X",
    price: 499.99,
    category: "console",
    icon: "fab fa-xbox",
  },
  {
    id: 7,
    name: "RTX 4090 Graphics Card",
    price: 1599.99,
    category: "pc",
    icon: "fas fa-microchip",
  },
  {
    id: 8,
    name: 'Gaming Monitor 27"',
    price: 299.99,
    category: "accessories",
    icon: "fas fa-desktop",
  },
  {
    id: 9,
    name: "Gaming Chair RGB",
    price: 399.99,
    category: "accessories",
    icon: "fas fa-chair",
  },
  {
    id: 10,
    name: "Nintendo Switch OLED",
    price: 349.99,
    category: "console",
    icon: "fas fa-gamepad",
  },
  {
    id: 11,
    name: "Gaming Phone",
    price: 999.99,
    category: "mobile",
    icon: "fas fa-mobile-alt",
  },
  {
    id: 12,
    name: "Mobile Gaming Controller",
    price: 59.99,
    category: "mobile",
    icon: "fas fa-gamepad",
  },
];

// API Endpoint config
const BACKEND_URL =
  window.BACKEND_URL ||
  (typeof process !== "undefined" && process.env && process.env.BACKEND_URL) ||
  "http://localhost:5000";

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  initializeComponents();
  loadProducts();
  startCountdown();
  initAnimations();
  setupSearch();
  setupMobileMenu();
  initializeChatbot();
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

// Create Product Card
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.style.opacity = "0";
  card.style.transform = "translateY(20px)";
  card.style.transition = "all 0.3s ease";

  card.innerHTML = `
        <div class="product-icon">
            <i class="${product.icon}"></i>
        </div>
        <h3>${product.name}</h3>
        <p class="product-price">$${product.price}</p>
        <button class="btn btn-primary add-to-cart" data-id="${product.id}">
            Add to Cart
        </button>
    `;

  // Add to cart functionality
  const addToCartBtn = card.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", () => addToCart(product));

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

// Notification System
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
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
