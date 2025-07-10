// accessibility.js
// Accessibility Enhancements Module
export function initializeAccessibility() {
  setupKeyboardNavigation();
  createLiveRegions();
  setupFocusManagement();
  setupScreenReaderSupport();
}

function setupKeyboardNavigation() {
  // ... Copy the setupKeyboardNavigation function ...
}

function createLiveRegions() {
  // ... Copy the createLiveRegions function ...
}

function setupFocusManagement() {
  // ... Copy the setupFocusManagement function ...
}

function setupScreenReaderSupport() {
  // ... Copy the setupScreenReaderSupport function ...
}

export function announceToScreenReader(message) {
  const liveRegion = document.getElementById("live-region");
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = "";
    }, 1000);
  }
}
