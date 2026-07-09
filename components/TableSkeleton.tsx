export default function TableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: j === 0 ? '60%' : j === cols - 1 ? '40%' : '70%' }} />
            </td>
          ))}
          <td className="px-6 py-4">
            <div className="h-4 w-8 bg-gray-100 rounded-md animate-pulse ml-auto" />
          </td>
        </tr>
      ))}
    </>
  )
}
