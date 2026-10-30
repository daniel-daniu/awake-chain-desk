import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = ({ size = 18, ...props }: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)

export const IconChain = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <path d="M10 6.5h4a3 3 0 0 1 3 3v4" />
  </svg>
)

export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

export const IconChart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </svg>
)

export const IconWallet = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="13" rx="3" />
    <path d="M3 10h18" />
    <circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export const IconExternal = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)

export const IconCopy = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
)

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
)

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconArrow = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5 22 20H2z" />
    <path d="M12 9.5v5" />
    <circle cx="12" cy="17.4" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 20 6v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6z" />
    <path d="m8.5 12 2.4 2.4L16 9.5" />
  </svg>
)

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const IconCoins = (p: IconProps) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="6.5" rx="8" ry="3" />
    <path d="M4 6.5v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
    <path d="M4 11.5v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
  </svg>
)

export const IconLayers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 9 5-9 5-9-5z" />
    <path d="m3 13 9 5 9-5" />
    <path d="m3 17.5 9 5 9-5" />
  </svg>
)

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

export const IconBolt = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </svg>
)

export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
  </svg>
)

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

export const LogoMark = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="15" fill="#0B6E75" />
    <circle cx="32" cy="32" r="14" fill="none" stroke="#F7FAFA" strokeWidth="3" />
    <path d="M32 14v36" stroke="#F7FAFA" strokeWidth="3" strokeLinecap="round" />
    <path d="M18 32h28" stroke="#F7FAFA" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="32" r="4.5" fill="#F7FAFA" />
  </svg>
)
