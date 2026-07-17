import { login, register } from "../service/api.js";
import logoIcon from "../assets/icons/logo.png";

export function Auth() {
    return `
        <div class="h-screen bg-[#F8F5F0] flex flex-col items-center justify-center px-6 font-sans overflow-hidden">
        <div class="w-full max-w-[400px]">
            
            <!-- Logo -->
            <div class="flex flex-col items-center mb-5">
                <img src="${logoIcon}" alt="Prismavent Logo" class="w-44 h-auto object-contain">
                <p class="text-lg md:text-xl font-medium text-gray-600 tracking-wide text-center mt-2" style="font-family: 'Playfair Display', serif;">
                    From start to glow, we've got the flow
                </p>
            </div>

            <!-- Flip Card -->
            <div id="flip-card" class="relative w-full h-[480px] perspective-[1000px] transform-style-preserve-3d">
            
            <!-- LOGIN SIDE -->
            <div id="login-side" class="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl overflow-hidden will-change-transform" style="transform: rotateY(0deg) translateZ(0);">
                <div class="p-8">
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
                        <input type="password" id="login-password" placeholder="123456"
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
                <div class="p-8">
                <div class="flex border-b border-gray-200 mb-5">
                    <button onclick="switchToLogin()" class="flex-1 pb-3 text-base font-medium text-gray-500 hover:text-gray-700">Login</button>
                    <button onclick="switchToSignup()" class="flex-1 pb-3 text-base font-medium border-b-2 border-[#C9A84C] text-gray-900">Sign Up</button>
                </div>

                <form id="signup-form" class="space-y-4">
                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">FULL NAME</label>
                    <input type="text" id="signup-name" placeholder="Carlos Mendoza" 
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">EMAIL ADDRESS</label>
                    <input type="email" id="signup-email" placeholder="carlos@agency.com" 
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">PASSWORD</label>
                    <div class="relative">
                        <input type="password" id="signup-password" placeholder="Crea una contraseña segura" 
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                        <button type="button" onclick="togglePassword(this)" class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">𓁺</button>
                    </div>
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1">CELLPHONE</label>
                    <input type="tel" id="signup-phone" placeholder="+34 123 456 789" 
                            class="w-full px-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
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
};

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

document.addEventListener("submit", async (e) => {
  // Login
  if (e.target.id === "login-form") {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando...";

    try {
      await login(email, password);
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      errorEl.textContent = err.message || "No se pudo iniciar sesión.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      submitBtn.textContent = "ACCESS WORKSPACE →";
    }
  }

  // Registro
  if (e.target.id === "signup-form") {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const phone = document.getElementById("signup-phone").value;
    const errorEl = document.getElementById("signup-error");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creando cuenta...";

    try {
      await register(name, email, password, phone);
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
