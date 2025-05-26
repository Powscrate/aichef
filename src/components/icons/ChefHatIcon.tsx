// src/components/icons/ChefHatIcon.tsx
import type { SVGProps } from 'react';

export function ChefHatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24" // Adjusted viewBox to provide more space for detail
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
 // Added a title for accessibility

    >

      <title>Chef Hat</title>
      {/* Main hat shape - More detailed curve for a realistic look */}
      <path d="M4 18c0-4.41 3.59-8 8-8s8 3.59 8 8v2H4v-2zM10 10v-6h4v6M8 18v2h8v-2c0-2.21-1.79-4-4-4s-4 1.79-4 4z" />
      {/* Simple lines for texture or folds */}
      <path d="M6 18s1-2 2-2 2 2 4 2 2-2 4-2 2 2 2 2" opacity=".5"/>
    </svg>
  );
}
