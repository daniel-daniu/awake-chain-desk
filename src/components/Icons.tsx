import type { SVGProps } from 'react'

type IconName =
  | 'home'
  | 'chain'
  | 'products'
  | 'helix'
  | 'learn'
  | 'wallet'
  | 'menu'
  | 'close'
  | 'arrow'
  | 'external'
  | 'alert'
  | 'copy'
  | 'check'
  | 'refresh'
  | 'news'
  | 'clock'
  | 'info'
  | 'shield'
  | 'globe'
  | 'search'

const paths: Record<IconName, string[]> = {
  home: ['M3 11.5 12 4l9 7.5', 'M5.5 10.5V20h13v-9.5', 'M9.5 20v-5.5h5V20'],
  chain: ['M5 4h5v5H5z', 'M14 15h5v5h-5z', 'M10 6.5h4a4 4 0 0 1 4 4v4.5', 'M7.5 9v4a3.5 3.5 0 0 0 3.5 3.5h3'],
  products: ['M4 5h6v6H4z', 'M14 5h6v6h-6z', 'M4 15h6v4H4z', 'M14 15h6v4h-6z'],
  helix: ['M12 3c3 3 3 6 0 9s-3 6 0 9', 'M12 3c-3 3-3 6 0 9s3 6 0 9', 'M7 7h10M7 17h10'],
  learn: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z', 'M8 7h8M8 11h7'],
  wallet: ['M3 7.5h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-9Z', 'M3 7.5V6a2 2 0 0 1 2-2h12', 'M15 13h6'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  close: ['M6 6l12 12M18 6 6 18'],
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  external: ['M14 4h6v6', 'M20 4 10 14', 'M18 13v6H5V6h6'],
  alert: ['M12 3 2.8 20h18.4L12 3Z', 'M12 9v5M12 17.5v.2'],
  copy: ['M8 8h11v12H8z', 'M5 16H3V4h11v2'],
  check: ['m5 12 4 4L19 6'],
  refresh: ['M20 7v5h-5', 'M4 17v-5h5', 'M6.1 8a7 7 0 0 1 11.5-1L20 12', 'M4 12l2.4 5a7 7 0 0 0 11.5-1'],
  news: ['M4 5h13v14H4z', 'M7 8h7M7 12h7M7 16h4', 'M17 8h3v9a2 2 0 0 1-2 2h-1'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v6M12 7.5v.2'],
  shield: ['M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z', 'm8.5 12 2.3 2.3 4.7-5'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3.5 12h17M12 3c3 3.2 3 14.8 0 18', 'M12 3c-3 3.2-3 14.8 0 18'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.2-4.2'],
}

export function Icon({
  name,
  size = 18,
  ...props
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}
