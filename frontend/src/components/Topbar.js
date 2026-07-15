import notificationIcon from "../assets/icons/notification_icon.svg";
import { getUserName } from "../utils/authUtils.js";

export function Topbar() {
  const userName = getUserName();
  return `
    <header class="flex justify-end items-center h-20 px-12 bg-[#FFF8F1]">

      <p class="text-sm text-[#4D4637] mr-8">
        Good morning, ${userName}
      </p>

      <button class="mr-6 cursor-pointer hover:opacity-70 transition">
        <img
          src="${notificationIcon}"
          alt="Notifications"
          class="w-5 h-5"
        />
      </button>

    </header>
  `;
}