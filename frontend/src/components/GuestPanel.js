export function GuestsPanel(event) {
  const guests = event?.guests || [];

  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

      <div class="flex justify-between items-center mb-5">

        <h2 class="text-lg font-bold text-[#1E1B15]">
          Invitados
        </h2>

        <button
          id="btn-add-guest"
          class="px-4 py-2 rounded-xl bg-[#755B00] text-white text-sm hover:bg-[#5F4A00]"
        >
          + Agregar
        </button>

      </div>

      <div class="text-sm text-gray-500 mb-4">
        ${guests.length} invitados registrados
      </div>

      <table class="w-full text-sm">

        <thead>
          <tr class="border-b">
            <th class="text-left py-2">Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          ${
            guests.map(guest => `
              <tr class="border-b">

                <td class="py-3">
                  ${guest.full_name}
                </td>

                <td class="text-center">
                  ${guest.confirmed ? "✅" : "⏳"}
                </td>

                <td class="text-center">

                  <button
                    class="edit-guest text-[#755B00] font-medium hover:underline"
                    data-id="${guest.id}"
                    data-name="${guest.full_name}"
                    data-notes="${guest.notes || ""}"
                    data-confirmed="${guest.confirmed}"
                  >
                    Edit
                  </button>

                  <button
                    class="delete-guest ml-4 text-red-600 font-medium hover:underline"
                    data-id="${guest.id}"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            `).join("")
          }

        </tbody>

      </table>

    </div>
  `;
}