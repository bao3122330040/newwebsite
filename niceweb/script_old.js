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

// Chatbot Elements
let chatbotToggle, chatbotContainer, chatbotMessages, chatbotInput, chatbotSend;

// Shopping Cart
let cart = [];

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
    name: "Gaming Monitor 144Hz",
    price: 299.99,
    category: "pc",
    icon: "fas fa-desktop",
  },
  {
    id: 9,
    name: "Gaming Chair RGB",
    price: 249.99,
    category: "accessories",
    icon: "fas fa-chair",
  },
];

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
  initEventListeners();
  startCountdown();
  initAnimations();
});

// Load Products
function loadProducts(filter = "all") {
  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((product) => product.category === filter);

  productsGrid.innerHTML = "";

  filteredProducts.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
        <div class="product-image">
            <i class="${product.icon}"></i>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `;
  return card;
}

// Add to Cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  showNotification("Product added to cart!");
}

// Remove from Cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

// Update Cart UI
function updateCartUI() {
  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Update cart items
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="color: rgba(255,255,255,0.7); text-align: center;">Your cart is empty</p>';
  } else {
    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div>
                        <h4 style="color: #fff; margin: 0; font-size: 0.9rem;">${item.name}</h4>
                        <p style="color: #00f5ff; margin: 0.5rem 0 0 0;">$${item.price} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background: #ff0080; color: #fff; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
      cartItems.appendChild(cartItem);
    });
  }

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Event Listeners
function initEventListeners() {
  // Cart Modal
  cartBtn.addEventListener("click", () => {
    cartModal.style.display = "block";
  });

  closeCart.addEventListener("click", () => {
    cartModal.style.display = "none";
  });

  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = "none";
    }
  });

  // Product Filters
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      btn.classList.add("active");
      // Filter products
      const filter = btn.dataset.filter;
      loadProducts(filter);
    });
  });

  // Mobile Menu
  mobileMenu.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // Smooth Scrolling for Navigation
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

  // Newsletter Form
  const newsletterForm = document.querySelector(".newsletter-form");
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification("Thank you for subscribing!");
    e.target.reset();
  });

  // Category Cards
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      // Scroll to products section
      document
        .getElementById("products")
        .scrollIntoView({ behavior: "smooth" });
      // Filter products after a short delay
      setTimeout(() => {
        filterBtns.forEach((btn) => {
          btn.classList.remove("active");
          if (btn.dataset.filter === category) {
            btn.classList.add("active");
          }
        });
        loadProducts(category);
      }, 500);
    });
  });

  // Chatbot Toggle
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");

  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.classList.toggle("open");
    chatbotToggle.classList.toggle("active");
    if (chatbotContainer.classList.contains("open")) {
      chatbotInput.focus();
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
    }  });
}

// Send Message Function
async function sendMessage() {
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
    const endpoint = chatbotState.useAgent ? '/api/agent/chat' : '/api/chatbot/chat';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
        sessionId: chatbotState.sessionId
      })
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
      addChatMessage("bot", "Sorry, I'm having trouble right now. Please try again.");
    }

  } catch (error) {
    console.error('Chat error:', error);
    removeTypingIndicator();
    addChatMessage("bot", "Sorry, I'm experiencing connection issues. Please try again.");
  } finally {
    chatbotState.isTyping = false;
  }
}

// Add Chat Message
function addChatMessage(sender, text, toolsUsed = null) {
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
    toolsElement.innerHTML = `<small>🔧 Used: ${toolsUsed.join(', ')}</small>`;
    messageElement.appendChild(toolsElement);
  }

  chatbotMessages.appendChild(messageElement);

  // Scroll to bottom of chat
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Typing indicator functions
function addTypingIndicator() {
  const typingElement = document.createElement("div");
  typingElement.className = "chat-message bot typing-indicator";
  typingElement.id = "typing-indicator";
  typingElement.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  chatbotMessages.appendChild(typingElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingElement = document.getElementById("typing-indicator");
  if (typingElement) {
    typingElement.remove();
  }
}

// Get Bot Response (Simulated)
function getBotResponse(message) {
  // Simple keyword-based responses
  const responses = {
    hello: "Hi there! How can I assist you today?",
    laptop: "We have a great selection of gaming laptops!",
    keyboard: "Check out our mechanical RGB keyboards!",
    playstation: "The PlayStation 5 is a popular choice!",
    mouse: "Our gaming mice are top-notch!",
    headset: "Experience immersive sound with our gaming headsets!",
    xbox: "The Xbox Series X is available now!",
    graphics: "The RTX 4090 is a powerful graphics card!",
    monitor: "Consider our gaming monitors with 144Hz refresh rate!",
    chair: "Game in comfort with our RGB gaming chairs!",
    thanks: "You're welcome! Let me know if you have any other questions.",
    bye: "Goodbye! Have a great day!",
  };

  // Default response
  let response = "I'm sorry, I didn't understand that.";

  // Check if message matches any keyword
  for (const key in responses) {
    if (message.toLowerCase().includes(key)) {
      response = responses[key];
      break;
    }
  }

  return response;
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

      document.getElementById("hours").textContent = hours
        .toString()
        .padStart(2, "0");
      document.getElementById("minutes").textContent = minutes
        .toString()
        .padStart(2, "0");
      document.getElementById("seconds").textContent = seconds
        .toString()
        .padStart(2, "0");
    } else {
      clearInterval(countdownInterval);
      document.querySelector(".deal-timer").innerHTML =
        '<p style="color: #ff0080;">Deal Expired!</p>';
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
    const navbar = document.querySelector(".header");
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(10, 10, 10, 0.98)";
    } else {
      navbar.style.background = "rgba(10, 10, 10, 0.95)";
    }
  });
}

// Notification System
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #00f5ff, #ff0080);
        color: white;
        padding: 1rem 2rem;
        border-radius: 30px;
        font-weight: 600;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 245, 255, 0.3);
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Search Functionality
searchBtn.addEventListener("click", () => {
  const searchTerm = prompt("Search for products:");
  if (searchTerm) {
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredProducts.length > 0) {
      productsGrid.innerHTML = "";
      filteredProducts.forEach((product) => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
      });

      // Scroll to products
      document
        .getElementById("products")
        .scrollIntoView({ behavior: "smooth" });
      showNotification(`Found ${filteredProducts.length} products`);
    } else {
      showNotification("No products found");
    }
  }
});

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Press 'C' to open cart
  if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.altKey) {
    cartModal.style.display = "block";
  }

  // Press 'Escape' to close cart
  if (e.key === "Escape") {
    cartModal.style.display = "none";
  }
});

// Performance Optimization - Lazy Loading
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Add some interactive particles
function createParticles() {
  const particleContainer = document.querySelector(".hero-particles");

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: #00f5ff;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: twinkle ${2 + Math.random() * 3}s infinite;
            opacity: ${0.3 + Math.random() * 0.7};
        `;
    particleContainer.appendChild(particle);
  }
}

// Add CSS for particle animation
const style = document.createElement("style");
style.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    
    .notification {
        font-family: 'Orbitron', monospace;
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: rgba(10, 10, 10, 0.98);
            padding: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-menu.active li {
            margin: 0.5rem 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize particles
createParticles();

// Add loading effect for better UX
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  document.body.style.transition = "opacity 0.5s ease";
});

// Set initial body opacity
document.body.style.opacity = "0";

// Chatbot Functionality
// Chatbot State
let chatbotState = {
  isOpen: false,
  sessionId: null,
  isTyping: false,
  useAgent: true // Use agent by default for enhanced capabilities
};

// Chatbot Toggle
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotContainer = document.getElementById("chatbot-container");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");

chatbotToggle.addEventListener("click", () => {
  chatbotContainer.classList.toggle("open");
  chatbotToggle.classList.toggle("active");
  if (chatbotContainer.classList.contains("open")) {
    chatbotInput.focus();
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

// Send Message Function
function sendMessage() {
  const messageText = chatbotInput.value.trim();
  if (messageText === "") return;

  // Add user message to chat
  addChatMessage("user", messageText);
  chatbotInput.value = "";

  // Simulate bot response
  setTimeout(() => {
    const botResponse = getBotResponse(messageText);
    addChatMessage("bot", botResponse);
  }, 1000);
}

// Add Chat Message
function addChatMessage(sender, text) {
  const messageElement = document.createElement("div");
  messageElement.className = `chat-message ${sender}`;
  messageElement.textContent = text;
  chatbotMessages.appendChild(messageElement);

  // Scroll to bottom of chat
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Get Bot Response (Simulated)
function getBotResponse(message) {
  // Simple keyword-based responses
  const responses = {
    hello: "Hi there! How can I assist you today?",
    laptop: "We have a great selection of gaming laptops!",
    keyboard: "Check out our mechanical RGB keyboards!",
    playstation: "The PlayStation 5 is a popular choice!",
    mouse: "Our gaming mice are top-notch!",
    headset: "Experience immersive sound with our gaming headsets!",
    xbox: "The Xbox Series X is available now!",
    graphics: "The RTX 4090 is a powerful graphics card!",
    monitor: "Consider our gaming monitors with 144Hz refresh rate!",
    chair: "Game in comfort with our RGB gaming chairs!",
    thanks: "You're welcome! Let me know if you have any other questions.",
    bye: "Goodbye! Have a great day!",
  };

  // Default response
  let response = "I'm sorry, I didn't understand that.";

  // Check if message matches any keyword
  for (const key in responses) {
    if (message.toLowerCase().includes(key)) {
      response = responses[key];
      break;
    }
  }

  return response;
}
