export function WorkflowIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="28" cy="48" r="10"
        fill="#86EFAC"
        stroke="#000"
        strokeWidth="2.5"
      />
      <circle cx="68" cy="28" r="10"
        fill="#86EFAC"
        stroke="#000"
        strokeWidth="2.5"
      />
      <circle cx="68" cy="68" r="10"
        fill="#86EFAC"
        stroke="#000"
        strokeWidth="2.5"
      />
      <line x1="38" y1="48" x2="58" y2="28"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="38" y1="48" x2="58" y2="68"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
