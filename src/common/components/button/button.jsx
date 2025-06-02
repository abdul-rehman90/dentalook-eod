import React from 'react';

function Button({
  children,
  className = '',
  asChild = false,
  type = 'button',
  size = 'default',
  onClick = () => {},
  variant = 'default',
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
    >
      {renderChildren()}
    </button>
  );
}

export { Button };
