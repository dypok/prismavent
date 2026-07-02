import dashboardIcon from "../assets/icons/dashboard_icon.svg";
import eventsIcon from "../assets/icons/events_icon.svg";
import historyIcon from "../assets/icons/history_icon.svg";
import providersIcon from "../assets/icons/providers_icon.svg";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: dashboardIcon
  },
  {
    id: "events",
    label: "My Events",
    icon: eventsIcon
  },
  {
    id: "providers",
    label: "Providers",
    icon: providersIcon
  },
  {
    id: "history",
    label: "History",
    icon: historyIcon
  }
];

export function Sidebar(active = "dashboard") {
  const menu = menuItems
  .map((item) => {
    const isActive = item.id === active;

    return `
      <li
        class="
        flex
        items-center
        gap-3
        px-7
        py-3
        cursor-pointer
        transition
        relative
        ${
            isActive
                ? "text-[#755B00] font-medium"
                : "text-gray-500 hover:text-[#6B4F1D]"
        }
        "
        >

        ${isActive
        ? `<span class="absolute left-0 top-0 h-full w-1 bg-[#755B00] rounded-r"></span>`
        : ""}

        <img
        src="${item.icon}"
        alt="${item.label}"
        class="w-4 h-4"
        />

        <span class="text-sm">
        ${item.label}
        </span>

        </li>
    `;
  })
  .join("");

  return `
        <aside class="w-60 min-h-screen bg-F8F0E4 border-r border-gray-200 shadow-md flex flex-col justify-between py-8">

            <div>

                <div class="px-7 mb-14">
                    <div class="h-12 flex items-center">
                          Logo de Prismavent 
                    </div>

                    <p class="font-body text-xs tracking-[0.2em] uppercase text-gray-500 mt-1">
                        Event Planning
                    </p>
                </div>

                <nav>
                    <ul class="space-y-2">
                        ${menu}
                    </ul>
                </nav>

            </div>

            <div class="px-6 pb-6">
                <button
                    class="w-full bg-[#C9A84C] text-white py-3 rounded-md font-medium hover:bg-[#b89539] transition"
                >
                    + New Event
                </button>
            </div>

        </aside>
`;
}