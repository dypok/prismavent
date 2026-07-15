export function DeleteEventModal() {
  return `
    <div
      id="delete-modal"
      class="fixed inset-0 bg-black/40 hidden items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 w-[420px] shadow-xl">

        <h2 class="text-2xl font-semibold mb-3">
          Delete Event
        </h2>

        <p class="text-gray-600 mb-6">
          Are you sure? This action cannot be undone.
        </p>

        <div class="flex justify-end gap-3">

          <button
            id="cancel-delete"
            class="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            id="confirm-delete"
            class="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>
    </div>
  `;
}