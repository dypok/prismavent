export function DeleteResourceModal() {
  return `
    <div
      id="resource-delete-modal"
      class="fixed inset-0 bg-black/40 hidden items-center justify-center z-50 animate-fade-in backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl p-8 w-[420px] shadow-2xl animate-scale-in">

        <h2 class="text-2xl font-bold mb-3 text-[#1E1B15]">
          Delete Resource
        </h2>

        <p class="text-gray-600 mb-6">
          This action permanently deletes this resource from the event and cannot be undone.
        </p>

        <div class="flex justify-end gap-3">

          <button
            id="cancel-resource-delete"
            class="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            id="confirm-resource-delete"
            class="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
          >
            Delete Resource
          </button>

        </div>

      </div>
    </div>
  `;
}
