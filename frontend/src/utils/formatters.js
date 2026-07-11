export function formatDate(dateStr) {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

export function formatCurrency(amount) {
    if (amount == null) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

export function getStatusColor(status) {
    const lower = (status || '').toLowerCase();
    if (lower.includes('borrador')) return 'bg-gray-400';
    if (lower.includes('planificando')) return 'bg-violet-500';
    if (lower.includes('confirmado')) return 'bg-green-500';
    if (lower.includes('finalizado')) return 'bg-blue-500';
    return 'bg-gray-400';
}