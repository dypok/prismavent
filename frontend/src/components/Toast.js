export function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.textContent = message;

  toast.className = `
    fixed top-6 right-6 z-50
    px-5 py-3 rounded-xl shadow-lg
    text-white font-medium
    animate-fade-in
    ${type === "success"
      ? "bg-green-600"
      : "bg-red-600"}
  `;

  document.body.appendChild(toast);

  // Fade out animation before removing
  setTimeout(() => {
    toast.style.animation = "fadeIn 0.3s ease-out reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}