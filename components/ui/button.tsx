import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', asChild = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-4 py-2"
    
    const variants = {
      default: "bg-blue-600 text-white shadow hover:bg-blue-700",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
      outline: "border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700",
      secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-700",
      link: "text-blue-600 underline-offset-4 hover:underline",
    }
    
    const variantStyles = variants[variant] || variants.default
    const finalClassName = `${baseStyles} ${variantStyles} ${className}`

    if (asChild && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: `${finalClassName} ${child.props.className || ''}`,
        ...props,
        children: child.props.children
      })
    }

    return (
      <button
        className={finalClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
