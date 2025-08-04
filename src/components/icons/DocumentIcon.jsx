import React from 'react'

export const DocumentIcon = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main document body */}
      <path 
        d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" 
        fill="currentColor"
      />
      {/* Folded corner */}
      <path 
        d="M14 2V8H20" 
        fill="none" 
        stroke="rgba(255,255,255,0.3)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Document lines */}
      <rect x="7" y="11" width="10" height="1.5" rx="0.75" fill="white" />
      <rect x="7" y="14" width="10" height="1.5" rx="0.75" fill="white" />
      <rect x="7" y="17" width="7" height="1.5" rx="0.75" fill="white" />
    </svg>
  )
}