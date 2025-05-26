// src/components/icons/ChefHatIcon.tsx
import type { SVGProps } from 'react';

export function ChefHatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19.5 12.5c0-2.5-1.42-4.7-3.5-5.72V3.5C16 2.67 15.33 2 14.5 2h-5C8.67 2 8 2.67 8 3.5v3.28c-2.08 1.02-3.5 3.22-3.5 5.72C4.5 17 8 17 12 17s7.5 0 7.5-4.5z" />
      <path d="M8.5 8.5c0-1.42.5-2.78 1.39-3.82" />
      <path d="M14.11 4.68C15 5.72 15.5 7.08 15.5 8.5" />
      <path d="M12 17v5" />
      <path d="M9 22h6" />
    </svg>
  );
}
