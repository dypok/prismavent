# Development Summary – User Registration and Login with Supabase Auth - Backend

During the development of this user story, the complete authentication system was implemented, covering both the **Backend** and the **Frontend**, following a well-structured, scalable architecture designed for future integrations.

## Backend

Authentication endpoints were developed using **FastAPI** and **Supabase Auth** to support user registration, login, and logout.

**The `POST /auth/register` endpoint** was implemented to register new users using their email and password. It also stores additional profile information, such as the user's name and phone number, in Supabase user metadata while triggering the email verification flow.

**The `POST /auth/login` endpoint** was developed to authenticate registered users and return an active session containing the JWT access token and the user's information.

**The `POST /auth/logout` endpoint** was implemented to securely terminate the authenticated user's session through Supabase.

**An authentication middleware** was created to protect private routes across the application. It validates the JWT included in each request, excludes public routes from authentication, stores the authenticated user's information for later use, and returns a **401 Unauthorized** response whenever authentication fails.

Additionally, the project's architecture was refactored by reorganizing folders, components, and configuration files to improve code maintainability. The technical architecture was also documented, including the request flow, architectural decisions, and development guidelines for future contributors.

## Frontend

On the frontend side, the complete authentication interface and logic were implemented.

**A unified authentication component with a modern Flip Card design** was created, combining both the Sign Up and Login forms while following the official UI mockups.

### The following user story functionalities were implemented:

- User Registration Form.
- User Login Form.
- Registration success confirmation message with automatic redirection to the Login page.

The application's routing was configured for the authentication views, and the interface animations and styling were enhanced to match the project's design guidelines.

The **api.js** service was developed to centralize communication with the backend, manage JWT token storage in the browser, and automatically attach the authentication token to every authorized request.

Session validation was implemented using reusable authentication utilities to verify whether a user is authenticated and to manage the logout process.

Private routes were protected by allowing access only to authenticated users and automatically redirecting users based on their authentication status. Additionally, a **Logout** option was added to the Sidebar, removing the stored token and updating the application's navigation flow.

While the backend authentication integration is being finalized, temporary tokens were used to validate and test the complete authentication workflow.

## Result

As a result of the Sprint, **the application's complete authentication workflow was successfully implemented**, including user registration, login, logout, route protection, secure JWT token management, project architecture organization, and a modern user interface ready for full backend integration.

The solution was developed following software engineering best practices for code organization, reusability, and maintainability, leaving the functionality ready for review and future enhancements in upcoming Sprint increments.


-----------------------------------------------------------------------


# Resumen de Desarrollo – Registro e inicio de sesión con Supabase Auth - Backend

Durante el desarrollo de esta historia de usuario se implementó el sistema completo de autenticación, abarcando tanto el Backend como el Frontend, siguiendo una arquitectura organizada, escalable y preparada para futuras integraciones.

## Backend

Se desarrollaron los endpoints de autenticación para registro, inicio y cierre de sesión utilizando FastAPI y Supabase Auth.

**Se implementó el endpoint POST /auth/register**, encargado de registrar nuevos usuarios mediante correo y contraseña, incluyendo información adicional como nombre y teléfono dentro de los metadatos de Supabase, iniciando además el flujo de verificación por correo electrónico.

**Se desarrolló el endpoint POST /auth/login**, responsable de autenticar usuarios registrados y retornar la sesión activa junto con el token JWT y la información del usuario.

**Se implementó el endpoint POST /auth/logout**, permitiendo finalizar de forma segura la sesión del usuario autenticado mediante Supabase.

**Se creó el middleware de autenticación**, encargado de proteger las rutas privadas del sistema. Este valida el token JWT enviado en cada solicitud, excluye las rutas públicas y almacena la información del usuario autenticado para su posterior utilización, respondiendo con un error 401 Unauthorized cuando la autenticación no es válida.
Finalmente, se realizó una reestructuración de la arquitectura del proyecto, reorganizando carpetas, componentes y configuraciones para mejorar la mantenibilidad del código. Asimismo, se documentó la arquitectura técnica mediante un documento que describe el flujo de peticiones, las decisiones de diseño y las guías para futuros desarrolladores.

## Frontend

En el frontend se desarrolló toda la interfaz y lógica necesaria para el flujo de autenticación.

**Se creó un componente unificado de autenticación con un diseño moderno basado en un efecto Flip Card**, incorporando los formularios de Registro e Inicio de Sesión, respetando el diseño definido en los mockups institucionales.

### Se implementaron las funcionalidades correspondientes a las historias de usuario:

- Formulario de Registro.
- Formulario de Inicio de Sesión.
- Mensaje de confirmación exitoso tras el registro con redirección automática al Login.

Se configuró el enrutamiento inicial para las vistas de autenticación y se optimizaron las animaciones y estilos de la interfaz.

Se desarrolló el servicio api.js, encargado de centralizar la comunicación con el backend, administrar el almacenamiento del token JWT en el navegador y automatizar su envío en todas las solicitudes autenticadas.

Se implementó la validación de sesión activa mediante utilidades reutilizables para verificar la autenticación del usuario y gestionar el cierre de sesión.

Se protegieron las rutas privadas del sistema, permitiendo el acceso únicamente a usuarios autenticados y redirigiendo automáticamente según el estado de la sesión. Además, se incorporó la funcionalidad de Cerrar Sesión desde el Sidebar, eliminando el token almacenado y actualizando el flujo de navegación.

Mientras culmina la integración definitiva con el backend, se utilizaron tokens temporales para validar y probar el funcionamiento completo del proceso de autenticación.

## Resultado

Como resultado del Sprint, **quedó implementado el flujo completo de autenticación de la aplicación, incluyendo registro, inicio y cierre de sesión, protección de rutas, manejo seguro de tokens JWT, organización de la arquitectura del proyecto y una interfaz moderna preparada para integrarse completamente con el backend**. El código fue desarrollado siguiendo buenas prácticas de organización, reutilización y mantenibilidad, dejando la funcionalidad lista para revisión y evolución en los siguientes incrementos del proyecto.
