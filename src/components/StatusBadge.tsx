const statusStyles: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    Pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    Released: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    InProgress: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    Completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export default function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                statusStyles[status] ?? ''
            }`}
        >
      {status}
    </span>
    )
}