// Brand color configurations for FD and BNR

import { ColorScheme, BrandColors } from '@/lib/types';

export const BRAND_COLORS: Record<ColorScheme, BrandColors> = {
  fd: {
    primary: '#379596',
    content: '#191919',
    background: '#ffeadb'
  },
  bnr: {
    primary: '#ffd200',
    content: '#000',
    background: '#fff'
  }
} as const;

export function getBrandColors(scheme: ColorScheme): BrandColors {
  return BRAND_COLORS[scheme];
}
