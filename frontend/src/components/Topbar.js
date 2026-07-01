import notificationIcon from "../assets/icons/notification_icon.svg";
import avatarIcon from "../assets/icons/avatar_icon.svg";


export function Topbar(userName = "Carlos") {
  return `
    <header class="flex justify-end items-center h-20 px-12 bg-white">

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

      <img
        src="${avatarIcon}"
        alt="Avatar"
        class="w-9 h-9 rounded-full object-cover"
      />

    </header>
  `;
}