export function GuestModal() {
  return `
    <div
      id="guest-modal"
      class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50"
    >

      <div class="bg-white rounded-2xl p-6 w-[420px]">

        <h2 class="text-xl font-bold mb-5">
          Invitado
        </h2>

        <form id="guest-form" class="space-y-4">

          <input
            id="guest-name"
            type="text"
            placeholder="Nombre completo"
            class="w-full border rounded-xl p-3"
            required
          />

          <textarea
            id="guest-notes"
            placeholder="Notas"
            class="w-full border rounded-xl p-3"
          ></textarea>

          <label class="flex items-center gap-2">

            <input
              id="guest-confirmed"
              type="checkbox"
            />

            Confirmado

          </label>

          <div class="flex justify-end gap-3">

            <button
              type="button"
              id="cancel-guest"
              class="px-4 py-2 border rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="px-4 py-2 bg-[#755B00] text-white rounded-xl"
            >
              Guardar
            </button>

          </div>

        </form>

      </div>

    </div>
  `;
}