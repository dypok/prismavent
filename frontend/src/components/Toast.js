export function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.textContent = message;

  toast.className = `
    fixed top-6 right-6 z-50
    px-5 py-3 rounded-xl shadow-lg
    text-white font-medium
    transition-all duration-300
    ${type === "success"
      ? "bg-green-600"
      : "bg-red-600"}
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}