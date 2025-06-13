import React from 'react';

function Button({
  children,
  className = '',
  type = 'button',
  size = 'default',
  disabled = false,
  isLoading = false,
  onClick = () => {},
  variant = 'default',
  loadingIndicator = (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),
  ...props
}) {
  // Base classes
  const baseClasses =
    'inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    default: 'text-white bg-primary-400 hover:bg-primary/90',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline:
      'border border-secondary-50 shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'text-white bg-secondary-400 hover:bg-secondary/80',
    ghost:
      'border border-secondary-50 shadow-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
    link: 'text-primary underline-offset-4 hover:underline'
  };

  // Size classes
  const sizeClasses = {
    icon: 'h-6 w-6',
    default: 'px-4 py-2',
    sm: 'rounded-md px-2',
    lg: 'rounded-md px-5'
  };

  // SVG styles (now using standard Tailwind)
  const svgClasses = 'pointer-events-none h-4 w-4 shrink-0';

  // Combine all classes
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // Clone children to add SVG classes if needed
  const renderChildren = () => {
    if (isLoading) {
      return <span className={svgClasses}>{loadingIndicator}</span>;
    }

    if (!children) return null;

    if (typeof children === 'string') {
      return children;
    }

    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === 'svg') {
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${svgClasses}`
        });
      }
      return child;
    });
  };

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={combinedClasses}
      disabled={disabled || isLoading}
    >
      {renderChildren()}
    </button>
  );
}

export { Button };
