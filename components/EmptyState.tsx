import { FileX } from 'lucide-react'

interface Props {
  title?: string
  message?: string
}

export default function EmptyState({ title = "No records found", message = "Try adjusting your search or filters." }: Props) {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <FileX size={36} strokeWidth={1.5} className="text-gray-300" />
          <p className="text-sm font-bold text-gray-500">{title}</p>
          <p className="text-xs font-medium">{message}</p>
        </div>
      </td>
    </tr>
  )
}
