// notification.js
// Notification System Module
export function showNotification(message, type = "success", duration = 3000) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => {
    notif.style.transform = "translateX(120%) translateY(-20px)";
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
  notification.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  });
}
