import { login, register, getCities } from "../service/api.js";
import logoIcon from "../assets/icons/logo.png";

export function Auth() {
    return `
        <div class="h-screen bg-[#F8F5F0] flex flex-col items-center justify-center px-4 md:px-6 font-sans overflow-hidden relative">
        <button onclick="window.navigateTo('/')" class="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-[#E9E1D7] text-[#4D4637] hover:text-[#755B00] hover:border-[#C9A84C] transition-all text-sm shadow-sm cursor-pointer z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span class="hidden sm:inline">Volver</span>
        </button>
        <div class="w-full max-w-md mx-4 md:mx-auto">
            
            <!-- Logo -->
            <div class="flex flex-col items-center mb-5">
                <img src="${logoIcon}" alt="Prismavent Logo" class="w-32 md:w-44 h-auto object-contain">
                <p class="text-lg md:text-xl font-medium text-gray-600 tracking-wide text-center mt-2">
                    From start to glow, we've got the flow
                </p>
            </div>

            <!-- Flip Card -->
            <div id="flip-card" class="relative w-full h-[480px] perspective-[1000px] transform-style-preserve-3d">
            
            <!-- LOGIN SIDE -->
            <div id="login-side" class="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl overflow-hidden will-change-transform" style="transform: rotateY(0deg) translateZ(0);">
                <div class="p-6 md:p-10">
                <div class="flex border-b border-gray-200 mb-6">
                    <button onclick="switchToLogin()" class="flex-1 pb-3 text-base font-medium border-b-2 border-[#C9A84C] text-gray-900">Login</button>
                    <button onclick="switchToSignup()" class="flex-1 pb-3 text-base font-medium text-gray-500 hover:text-gray-700">Sign Up</button>
                </div>

                <form id="login-form" class="space-y-6">
                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">EMAIL ADDRESS</label>
                    <input type="email" id="login-email" placeholder="carlos@agency.com" 
                            class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">PASSWORD</label>
                    <div class="relative">
                        <input type="password" id="login-password" placeholder="123456" maxlength="128"
                            class="w-full px-5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                        <button type="button" onclick="togglePassword(this)" class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">𓁺</button>
                    </div>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="w-4 h-4 accent-[#C9A84C]">
                        <span class="text-gray-600">Remember me</span>
                    </label>
                    <a href="#" class="text-[#C9A84C] hover:underline">Forgot password?</a>
                    </div>

                    <button type="submit" 
                            class="w-full bg-[#C9A84C] hover:bg-[#B8963A] text-white font-semibold py-3.5 rounded-2xl text-base tracking-wider mt-2">
                    ACCESS WORKSPACE &rarr;
                    </button>

                    <p id="login-error" class="hidden text-sm text-red-600 text-center"></p>
                </form>
                </div>
            </div>

            <!-- SIGNUP SIDE -->
            <div id="signup-side" class="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl overflow-hidden will-change-transform" style="transform: rotateY(180deg) translateZ(0);">
                <div class="p-6 md:p-10">
                <div class="flex border-b border-gray-200 mb-5">
                    <button onclick="switchToLogin()" class="flex-1 pb-3 text-base font-medium text-gray-500 hover:text-gray-700">Login</button>
                    <button onclick="switchToSignup()" class="flex-1 pb-3 text-base font-medium border-b-2 border-[#C9A84C] text-gray-900">Sign Up</button>
                </div>

                <form id="signup-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">FULL NAME</label>
                    <input type="text" id="signup-name" placeholder="Carlos Mendoza" maxlength="100"
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">EMAIL ADDRESS</label>
                    <input type="email" id="signup-email" placeholder="carlos@agency.com" maxlength="255"
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">PASSWORD</label>
                    <div class="relative">
                        <input type="password" id="signup-password" placeholder="Crea una contraseña segura" maxlength="128"
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                        <button type="button" onclick="togglePassword(this)" class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">𓁺</button>
                    </div>
                    <p class="text-[10px] text-[#9E8E6E] mt-1 leading-relaxed">Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo</p>
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">CELLPHONE</label>
                    <input type="tel" id="signup-phone" placeholder="+34 123 456 789" 
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">CITY</label>
                    <select id="signup-city" class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base bg-white">
                        <option value="">Select a city</option>
                    </select>
                    </div>

                    <button type="submit" 
                            class="w-full bg-[#C9A84C] hover:bg-[#B8963A] text-white font-semibold py-3 rounded-2xl text-base tracking-wider mt-2">
                    CREATE ACCOUNT &rarr;
                    </button>

                    <p id="signup-error" class="hidden text-sm text-red-600 text-center"></p>
                </form>
                </div>
            </div>
            </div>
        </div>
        </div>

        <!-- Modal de Confirmación -->
        <div id="confirmation-modal" class="hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-8 max-w-sm text-center">
            <div class="text-5xl mb-4"></div>
            <h3 class="text-xl font-semibold mb-2">&iexcl;Registro Exitoso!</h3>
            <p class="text-gray-600 mb-6">Hemos enviado un correo de confirmaci&oacute;n.</p>
            <button onclick="closeModalAndRedirect()" 
                    class="w-full bg-[#C9A84C] text-white py-3.5 rounded-2xl font-semibold">
            IR AL LOGIN
            </button>
        </div>
        </div>
    `;
}

// ====================== FUNCIONES GLOBALES ======================

// Flip card functions
window.switchToSignup = function() {
    const loginSide = document.getElementById('login-side');
    const signupSide = document.getElementById('signup-side');
    if (loginSide && signupSide) {
        loginSide.style.transform = 'rotateY(-180deg)';
        signupSide.style.transform = 'rotateY(0deg)';
    }
    loadCitiesDropdown();
};

async function loadCitiesDropdown() {
    const select = document.getElementById('signup-city');
    if (!select || select.dataset.loaded) return;
    try {
        const cities = await getCities();
        select.innerHTML = '<option value="">Select a city</option>';
        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city.id;
            opt.textContent = city.name;
            select.appendChild(opt);
        });
        select.dataset.loaded = 'true';
    } catch (err) {
        console.error('Could not load cities:', err);
    }
}

window.switchToLogin = function() {
    const loginSide = document.getElementById('login-side');
    const signupSide = document.getElementById('signup-side');
    if (loginSide && signupSide) {
        loginSide.style.transform = 'rotateY(0deg)';
        signupSide.style.transform = 'rotateY(180deg)';
    }
};

window.togglePassword = function(btn) {
    const input = btn.previousElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '\xd7';
    } else {
        input.type = 'password';
        btn.textContent = '\u2c3a';
    }
};

window.closeModalAndRedirect = function() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    switchToLogin();
};

// ====================== MANEJO DE FORMULARIOS ======================

function getLoginAttempts() {
  return parseInt(sessionStorage.getItem("login_attempts") || "0", 10);
}

function setLoginAttempts(n) {
  sessionStorage.setItem("login_attempts", String(n));
}

function getLoginBlockedUntil() {
  const val = sessionStorage.getItem("login_blocked_until");
  return val ? parseInt(val, 10) : null;
}

function setLoginBlockedUntil(ts) {
  if (ts === null) {
    sessionStorage.removeItem("login_blocked_until");
  } else {
    sessionStorage.setItem("login_blocked_until", String(ts));
  }
}

function updateLoginBlockUI(submitBtn, errorEl) {
  const blockedUntil = getLoginBlockedUntil();
  if (!blockedUntil) return;
  const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
  if (remaining <= 0) {
    setLoginBlockedUntil(null);
    setLoginAttempts(0);
    submitBtn.disabled = false;
    submitBtn.textContent = "ACCESS WORKSPACE →";
    errorEl.classList.add("hidden");
    return;
  }
  submitBtn.disabled = true;
  errorEl.textContent = `Demasiados intentos. Reintenta en ${remaining}s.`;
  errorEl.classList.remove("hidden");
  setTimeout(() => updateLoginBlockUI(submitBtn, errorEl), 1000);
}

document.addEventListener("submit", async (e) => {
  // Login
  if (e.target.id === "login-form") {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const blockedUntil = getLoginBlockedUntil();
    if (blockedUntil && blockedUntil > Date.now()) {
      updateLoginBlockUI(submitBtn, errorEl);
      return;
    }

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando...";

    try {
      await login(email, password);
      setLoginAttempts(0);
      setLoginBlockedUntil(null);
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      const attempts = getLoginAttempts() + 1;
      setLoginAttempts(attempts);
      if (attempts >= 3) {
        setLoginBlockedUntil(Date.now() + 30000);
        updateLoginBlockUI(submitBtn, errorEl);
      } else {
        errorEl.textContent = err.message || "No se pudo iniciar sesión.";
        errorEl.classList.remove("hidden");
        submitBtn.disabled = false;
        submitBtn.textContent = "ACCESS WORKSPACE →";
      }
    }
  }

  // Registro
  if (e.target.id === "signup-form") {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const phone = document.getElementById("signup-phone").value;
    const city_id = document.getElementById("signup-city").value;
    const errorEl = document.getElementById("signup-error");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creando cuenta...";

    try {
      await register(name, email, password, phone, city_id || null);
      // Mostrar modal
      document.getElementById("confirmation-modal").classList.remove("hidden");
      // Auto cerrar después de 2.5 segundos
      setTimeout(closeModalAndRedirect, 2500);
    } catch (err) {
      errorEl.textContent = err.message || "No se pudo crear la cuenta.";
      errorEl.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "CREATE ACCOUNT →";
    }
  }
});
