export function EventTemplateCard({
  title,
  description,
  icon,
  backgroundColor,
  buttonText,
}) {
  return `
    <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-xl">

      <div
        class="h-36 flex items-center justify-center text-5xl"
        style="background:${backgroundColor}"
      >
        ${icon}
      </div>

      <div class="p-6">

        <h2
          class="text-3xl font-semibold text-[#2E241B]"
          style="font-family:'Playfair Display', serif;"
        >
          ${title}
        </h2>

        <p class="mt-3 text-[#5B5145] leading-6">
          ${description}
        </p>

        <button
          class="mt-6 text-[#9A7600] font-semibold hover:underline"
        >
          ${buttonText} →
        </button>

      </div>

    </div>
  `;
}