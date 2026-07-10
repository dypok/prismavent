export function Auth() {
    return `
        <div class="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6 font-sans">
        <div class="w-full max-w-[400px]">
            
            <!-- Logo -->
            <div class="flex flex-col items-center mb-8">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 bg-[#C9A84C] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                P
                </div>
                <h1 class="text-4xl font-bold tracking-tight text-gray-900" style="font-family: 'Playfair Display', serif;">
                Prismavent
                </h1>
            </div>
            <p class="text-lg text-gray-700" style="font-family: 'Playfair Display', serif;">
                Where events come to life.
            </p>
            </div>

            <!-- Flip Card -->
            <div id="flip-card" class="relative w-full h-[580px] perspective-[1000px]">
            
            <!-- LOGIN SIDE -->
            <div id="login-side" class="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl overflow-hidden" style="transform: rotateY(0deg);">
                <div class="p-8">
                <div class="flex border-b border-gray-200 mb-6">
                    <button onclick="switchToLogin()" class="flex-1 pb-3 text-base font-medium border-b-2 border-[#C9A84C] text-gray-900">Login</button>
                    <button onclick="switchToSignup()" class="flex-1 pb-3 text-base font-medium text-gray-500 hover:text-gray-700">Sign Up</button>
                </div>

                <form id="login-form" class="space-y-6">
                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">EMAIL ADDRESS</label>
                    <input type="email" id="login-email" value="carlos@agency.com" 
                            class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">PASSWORD</label>
                    <div class="relative">
                        <input type="password" id="login-password" value="123456"
                            class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
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
                            class="w-full bg-[#C9A84C] hover:bg-[#B8963A] text-white font-semibold py-3.5 rounded-2xl text-base tracking-wider">
                    ACCESS WORKSPACE →
                    </button>
                </form>
                </div>
            </div>

            <!-- SIGNUP SIDE -->
            <div id="signup-side" class="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl overflow-hidden" style="transform: rotateY(180deg);">
                <div class="p-8">
                <div class="flex border-b border-gray-200 mb-6">
                    <button onclick="switchToLogin()" class="flex-1 pb-3 text-base font-medium text-gray-500 hover:text-gray-700">Login</button>
                    <button onclick="switchToSignup()" class="flex-1 pb-3 text-base font-medium border-b-2 border-[#C9A84C] text-gray-900">Sign Up</button>
                </div>

                <form id="signup-form" class="space-y-5">
                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">FULL NAME</label>
                    <input type="text" id="signup-name" placeholder="Carlos Mendoza" 
                            class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">EMAIL ADDRESS</label>
                    <input type="email" id="signup-email" placeholder="carlos@agency.com" 
                            class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">PASSWORD</label>
                    <div class="relative">
                        <input type="password" id="signup-password" placeholder="Crea una contraseña segura" 
                            class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                        <button type="button" onclick="togglePassword(this)" class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl">𓁺</button>
                    </div>
                    </div>

                    <div>
                    <label class="block text-xs tracking-widest text-gray-500 mb-1.5">CELLPHONE</label>
                    <input type="tel" id="signup-phone" placeholder="+34 123 456 789" 
                            class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C9A84C] text-base">
                    </div>

                    <button type="submit" 
                            class="w-full bg-[#C9A84C] hover:bg-[#B8963A] text-white font-semibold py-3.5 rounded-2xl text-base tracking-wider mt-3">
                    CREATE ACCOUNT →
                    </button>
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
            <h3 class="text-xl font-semibold mb-2">¡Registro Exitoso!</h3>
            <p class="text-gray-600 mb-6">Hemos enviado un correo de confirmación.</p>
            <button onclick="closeModalAndRedirect()" 
                    class="w-full bg-[#C9A84C] text-white py-3.5 rounded-2xl font-semibold">
            IR AL LOGIN
            </button>
        </div>
        </div>
    `;
}

// ====================== FUNCIONES GLOBALES ======================

// Flip functions mejoradas
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
        btn.textContent = '×';
    } else {
        input.type = 'password';
        btn.textContent = '𓁺';
    }
};

window.closeModalAndRedirect = function() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    switchToLogin();
};

// ====================== MANEJO DE FORMULARIOS ======================
// NOTA: no se usa 'DOMContentLoaded' porque este HTML se inserta
// dinámicamente (innerHTML) mucho después de que ese evento ya se
// disparó una sola vez al cargar la página. Se usa delegación de
// eventos sobre "document" (igual que en CustomEventForm.js), que
// funciona sin importar cuándo se insertó el formulario en el DOM.

document.addEventListener("submit", (e) => {
  // Login
  if (e.target.id === "login-form") {
    e.preventDefault();
    // TODO: reemplazar con el verdadero JWT cuando la autenticacion del backend sea integrada
    localStorage.setItem("token", "temp-token");

    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Registro
  if (e.target.id === "signup-form") {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;

    console.log("Registro exitoso:", { name, email });

    // Mostrar modal
    document.getElementById("confirmation-modal").classList.remove("hidden");

    // Auto cerrar después de 2.5 segundos
    setTimeout(closeModalAndRedirect, 2500);
  }
});