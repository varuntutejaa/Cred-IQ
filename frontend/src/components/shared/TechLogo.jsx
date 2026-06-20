const LOGOS = {
  Python: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M11.9 2C7.1 2 7.4 4.1 7.4 4.1L7.4 6.3H12V7H4.8S2 6.7 2 11.6s2.5 4.7 2.5 4.7h1.5v-2.3s-.1-2.5 2.5-2.5h4.3s2.4.04 2.4-2.3V4.4S15.6 2 11.9 2zM9.7 3.6c.4 0 .8.4.8.8s-.4.8-.8.8-.8-.4-.8-.8.4-.8.8-.8z" fill="#4B8BBE"/>
      <path d="M12.1 22c4.8 0 4.5-2.1 4.5-2.1l-.01-2.2H12V17H19.2s2.8.3 2.8-4.6-2.5-4.7-2.5-4.7H18v2.3s.1 2.5-2.5 2.5h-4.3s-2.4-.04-2.4 2.3v3.8S8.4 22 12.1 22zm2.2-1.6c-.4 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.4.8-.8.8z" fill="#FFD43B"/>
    </svg>
  ),
  React: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.1" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(120 12 12)"/>
    </svg>
  ),
  JavaScript: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
      <path d="M6.5 17.5c.4.7 1 1.2 1.9 1.2.9 0 1.4-.4 1.4-1.1 0-.7-.5-1-1.5-1.4l-.5-.2c-1.5-.6-2.4-1.4-2.4-3 0-1.5 1.1-2.6 2.9-2.6 1.2 0 2.1.4 2.8 1.5l-1.5 1c-.3-.6-.7-.8-1.3-.8-.6 0-1 .4-1 .8 0 .6.4.8 1.3 1.2l.5.2c1.8.8 2.7 1.5 2.7 3.2 0 1.8-1.4 2.8-3.3 2.8-1.8 0-3-.9-3.6-2.2l1.6-.9zM15 17.4c.3.6.6.9 1.2.9.6 0 .9-.2.9-.9v-5.9h2v5.9c0 2-1.2 2.9-2.9 2.9-1.5 0-2.4-.8-2.9-1.7l1.7-1.2z" fill="#333"/>
    </svg>
  ),
  TypeScript: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="3" fill="#3178C6"/>
      <path d="M13.2 13.5H15v.8c0 .5.4.8.9.8s.8-.3.8-.7c0-.5-.4-.7-1.2-1l-.4-.2c-1.2-.5-2-.1-2 1.5 0 1.5.7 2.2 2.1 2.2 1.3 0 2.1-.7 2.1-1.9v-.6h-1.8v-.6h3.5v4.2h-1.5v-.5c-.4.4-1 .6-1.7.6-1.7 0-2.7-1-2.7-2.8 0-1.7.9-2.8 2.7-2.8.8 0 1.4.2 1.8.6v-.4h-4V11h4v1.5h-1.4zM7 11H4V9.5h8.5V11h-3v7.5H7V11z" fill="white"/>
    </svg>
  ),
  MongoDB: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C9.7 2 8 4.5 8 7.5c0 2.4 1 4.4 2.5 5.5l.3 7.5c0 .3.5.5.7.5h1c.2 0 .7-.2.7-.5l.3-7.5C14.9 11.9 16 9.9 16 7.5 16 4.5 14.3 2 12 2z" fill="#10AA50"/>
      <path d="M12 2C14.3 2 16 4.5 16 7.5c0 2.4-1.1 4.4-2.5 5.5l-.3 7.5c0 .3-.5.5-.7.5v-19z" fill="#12924F"/>
    </svg>
  ),
  AWS: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 14.2c-1.6.8-2.6 1.8-2.6 2.8 0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3c0-1-.9-2-2.5-2.7" stroke="#FF9900" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M6.6 9.5L5 8.2l2-1.2 1.3 1.1M17.4 9.5l1.6-1.3-2-1.2-1.3 1.1M12 5.5v2.8M12 14.5v2M8.5 11l-2 .5.5 2M15.5 11l2 .5-.5 2M10 9.5l2 1.3 2-1.3-2-1.3z" stroke="#FF9900" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Docker: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13 8h2v2h-2V8zM10 8h2v2h-2V8zM7 8h2v2H7V8zM10 5h2v2h-2V5zM13 5h2v2h-2V5z" fill="#2496ED"/>
      <path d="M21.8 12c-.3-1.8-1.5-2.3-2.5-2.3-.2 0-.4 0-.6.1-.5-1.7-2-2.8-3.7-2.8v2h-2V7H10v2H7v2h-.3C4.1 11 3 12.3 3 14c0 2.3 1.8 4 4 4h12c2.2 0 3.2-1.5 3-3.5" fill="#2496ED"/>
    </svg>
  ),
  'Node.js': ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#339933" opacity="0.15" stroke="#339933" strokeWidth="1"/>
      <path d="M12 4l7 3.9v7.8l-7 3.9-7-3.9V7.9L12 4z" stroke="#339933" strokeWidth="1.2" fill="none"/>
      <path d="M12 8v8M9 9.5l3 1.7 3-1.7M9 14.5l3-1.7 3 1.7" stroke="#339933" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Flask: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6v7l4 9H5l4-9V3z" stroke="#888" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <path d="M7 16h10M8.5 13h7" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="9" y="3" width="6" height="1.5" rx="0.5" fill="#888"/>
    </svg>
  ),
  Vue: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 4h3.5L12 17l6.5-13H22L12 21 2 4z" fill="#42B883"/>
      <path d="M6.5 4h3L12 9.5 14.5 4h3L12 14 6.5 4z" fill="#35495E"/>
    </svg>
  ),
  Java: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 17s-1.5.9 1 1.2c2.9.3 4.4.3 7.6-.3 0 0 .9.5 2 1C14.5 21.5 4 19.9 9 17zM8 14.5s-1.6 1.2 1 1.5c2.5.3 4.5.3 7.9-.4 0 0 .6.6 1.6.9C13 18.6 3.5 16.4 8 14.5z" fill="#5382A1"/>
      <path d="M14 10.8c1.5 1.7-.4 3.2-.4 3.2s3.7-1.9 2-4.2c-1.5-2.2-2.7-3.3 3.7-7C19.3 2.8 10.8 4.7 14 10.8z" fill="#E76F00"/>
      <path d="M20 19.3s1.1.9-1.2 1.6c-4.4 1.3-18.3.4-15.7-.5 1-.4 2-.5 2-.5s-2.5-.8-5.7.7c-1.8.8 4 2.2 13 1.2 5.9-.7 8.6-2.5 7.6-2.5z" fill="#5382A1"/>
    </svg>
  ),
  Kubernetes: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 4.5v9L12 22l-8-6.5V6.5L12 2z" fill="#326CE5" opacity="0.15"/>
      <path d="M12 2l8 4.5v9L12 22l-8-6.5V6.5L12 2z" stroke="#326CE5" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="2.5" fill="#326CE5"/>
      <path d="M12 5v4M12 15v4M5 8.5l3.5 2M15.5 13.5l3.5 2M5 15.5l3.5-2M15.5 10.5l3.5-2" stroke="#326CE5" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Terraform: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9.5 3.5v6L15 12.5V6.5L9.5 3.5z" fill="#7B42BC"/>
      <path d="M15.5 6.5v6L21 9.5v-6L15.5 6.5z" fill="#7B42BC" opacity="0.7"/>
      <path d="M3 9.5v6l5.5 3V12.5L3 9.5z" fill="#7B42BC" opacity="0.9"/>
      <path d="M9.5 14.5v6L15 17.5v-6L9.5 14.5z" fill="#7B42BC" opacity="0.8"/>
    </svg>
  ),
  'HTML/CSS': ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 2l1.6 18L12 22l6.4-2L20 2H4z" fill="#E44D26"/>
      <path d="M12 3.5v17l5.3-1.5 1.4-15.5H12z" fill="#F16529"/>
      <path d="M8.5 9h7.5l-.3 3.5-3.7 1-3.7-1L8.1 10H15l.2-2H8.7L8.5 9z" fill="white"/>
    </svg>
  ),
  'Next.js': ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#000"/>
      <path d="M9.5 7.5h1.5v6.2l5-6.2H18L12.7 15l-1.7 2H9.5V7.5z" fill="white"/>
      <path d="M13.5 14.5l1.2-1.5L17.5 17h-1.8L13.5 14.5z" fill="white"/>
    </svg>
  ),
  PostgreSQL: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="7" rx="7" ry="4" stroke="#336791" strokeWidth="1.5" fill="none"/>
      <path d="M5 7v10c0 2.2 3.1 4 7 4s7-1.8 7-4V7" stroke="#336791" strokeWidth="1.5" fill="none"/>
      <path d="M5 12c0 2.2 3.1 4 7 4s7-1.8 7-4" stroke="#336791" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
  GraphQL: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8.7 5v10L12 22l-8.7-5V7L12 2z" fill="none"/>
      <path d="M4 7.5L12 3l8 4.5M4 7.5v9L12 21M4 7.5l8 4.5m8-4.5v9L12 21m0 0l-8-4.5M20 7.5l-8 4.5m0 0V21" stroke="#E10098" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="12" cy="3" r="1.5" fill="#E10098"/>
      <circle cx="12" cy="21" r="1.5" fill="#E10098"/>
      <circle cx="4" cy="7.5" r="1.5" fill="#E10098"/>
      <circle cx="20" cy="7.5" r="1.5" fill="#E10098"/>
      <circle cx="4" cy="16.5" r="1.5" fill="#E10098"/>
      <circle cx="20" cy="16.5" r="1.5" fill="#E10098"/>
    </svg>
  ),
  Redis: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 16.5l9 4.5 9-4.5M3 12l9 4.5L21 12M3 7.5L12 3l9 4.5-9 4.5L3 7.5z" stroke="#DC382D" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Go: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <text x="2" y="16" fontSize="14" fontWeight="bold" fill="#00ADD8" fontFamily="monospace">Go</text>
    </svg>
  ),
  Rust: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#CE4A00" strokeWidth="1.5" fill="none"/>
      <path d="M12 5v4m0 6v4M5 12h4m6 0h4M7.1 7.1l2.8 2.8m4.2 4.2l2.8 2.8M7.1 16.9l2.8-2.8m4.2-4.2l2.8-2.8" stroke="#CE4A00" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="#CE4A00"/>
    </svg>
  ),
  Firebase: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5.3 17.5L7.5 5l4.5 4L15.5 3l4.2 14.5-7.2 4-7-4z" fill="#FFA000" stroke="#F57C00" strokeWidth="0.5"/>
      <path d="M12 7l3.5 4.5-7.2 6L12 7z" fill="#FFCA28"/>
    </svg>
  ),
  'Spring Boot': ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 12c0-4.4-3.6-8-8-8-3.1 0-5.8 1.8-7.1 4.4" stroke="#6DB33F" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M4 12c0 4.4 3.6 8 8 8 3.1 0 5.8-1.8 7.1-4.4" stroke="#6DB33F" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="12" r="3.5" fill="#6DB33F"/>
      <circle cx="12" cy="12" r="1.5" fill="white"/>
    </svg>
  ),
  Dart: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 9L9 4h7l5 5v7l-5 5H9L4 16V9z" fill="#00B4AB" opacity="0.15" stroke="#00B4AB" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8 12h8M12 8v8" stroke="#00B4AB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Flutter: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3.5 14L12 5.5l3 3-8.5 8.5-3-3z" fill="#54C5F8"/>
      <path d="M12 5.5l7.5 7.5-3 3L9 9l3-3.5z" fill="#01579B"/>
      <path d="M9 16.5l3-3 3 3-3 3-3-3z" fill="#29B6F6"/>
    </svg>
  ),
  WebAssembly: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#654FF0" opacity="0.15" stroke="#654FF0" strokeWidth="1.3"/>
      <text x="3.5" y="16" fontSize="8.5" fontWeight="bold" fill="#654FF0" fontFamily="monospace">Wa</text>
    </svg>
  ),
  gRPC: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="2.5" fill="#244C5A"/>
      <circle cx="19" cy="12" r="2.5" fill="#244C5A"/>
      <circle cx="12" cy="6" r="2.5" fill="#244C5A"/>
      <circle cx="12" cy="18" r="2.5" fill="#244C5A"/>
      <path d="M7.2 12H16.8M12 8.2V15.8M6.7 10.3l4.6-2.6M12.7 16.3l4.6-2.6M6.7 13.7l4.6 2.6M12.7 7.7l4.6 2.6" stroke="#244C5A" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
}

const FALLBACK = ({ size, name }) => {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="12" y="16" fontSize="9" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontWeight="bold" fontFamily="monospace">{initials}</text>
    </svg>
  )
}

export default function TechLogo({ name, size = 20 }) {
  const Logo = LOGOS[name]
  if (!Logo) return <FALLBACK size={size} name={name} />
  return <Logo size={size} />
}
