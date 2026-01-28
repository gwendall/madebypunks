import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "white" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  target?: string;
  rel?: string;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-pixel font-bold uppercase tracking-wider transition-all duration-100 ease-in-out relative";

  // Size styles
  const sizeStyles = {
    sm: "text-base px-4 py-2", // Minimum MD size
    md: "text-lg px-6 py-3", // Bumped up
    lg: "text-xl px-8 py-4", // Bumped up
  };

  // Variant styles
  const variantStyles = {
    primary:
      "bg-punk-blue-light text-white shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--shadow-color)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    secondary:
      "bg-punk-pink text-white shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--shadow-color)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    white:
      "bg-white text-punk-blue shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--shadow-color)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    outline:
      "bg-transparent border-2 border-white text-white hover:bg-white/10 active:bg-white/20",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    const isExternal = href.startsWith("http");
    
    if (isExternal) {
      return (
        <a
          href={href}
          className={combinedClassName}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
