'use client'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export default function ActionButton({ label, children, className = '', ...props }: ActionButtonProps) {
  return (
    <div className="relative group/tip">
      <button className={className} {...props}>
        {children}
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tip:opacity-100 translate-y-1 group-hover/tip:translate-y-0 transition-all duration-150 whitespace-nowrap z-50">
        <span className="block bg-gray-800 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-lg">
          {label}
        </span>
        <span className="block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-800 mx-auto" />
      </div>
    </div>
  )
}
