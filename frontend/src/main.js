import "./style.css";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";


document.querySelector("#app").innerHTML = `
  <div class="flex">

    ${Sidebar("dashboard")}

    <div class="flex-1">

      ${Topbar("Carlos")}

      <main class="px-12 py-10 bg-[#FFF8F1] min-h-[calc(100vh-80px)]">
        <h1 class="text-3xl font-bold">
          Dashboard
        </h1>
      </main>

    </div>

  </div>
`;