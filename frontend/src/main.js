import "./style.css";
import { Auth } from "./components/Auth.js";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";

console.log(" Main.js cargado - Ruta:", window.location.pathname);

function renderPage() {
  const path = window.location.pathname;

  // Rutas de autenticación
  if (path === '/auth' || path === '/login' || path === '/register' || path === '/') {
    document.querySelector("#app").innerHTML = Auth();
    console.log(" Mostrando Auth");
    
  // Rutas del Dashboard
  } else if (path === '/dashboard' || path === '/home') {
    document.querySelector("#app").innerHTML = `
      <div class="flex h-screen">
        ${Sidebar("dashboard")}
        <div class="flex-1 flex flex-col">
          ${Topbar("Carlos")}
          <main class="flex-1 p-8 bg-[#FFF8F1] overflow-auto">
            <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-2">Bienvenido de vuelta</p>
          </main>
        </div>
      </div>
    `;
    console.log("Mostrando Dashboard");
  } 
  // 404
  else {
    document.querySelector("#app").innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-red-500">404</h1>
          <p class="text-2xl mt-4">Página no encontrada</p>
          <a href="/auth" class="mt-6 inline-block px-6 py-3 bg-amber-600 text-white rounded-2xl">Ir al Login</a>
        </div>
      </div>
    `;
  }
}

// Render inicial
renderPage();

// Soporte para botones atrás/adelante del navegador
window.addEventListener('popstate', renderPage);