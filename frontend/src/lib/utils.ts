import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HashResult, IPResult, DomainResult } from "@/lib/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to calculate detection rate
export function calculateDetectionRate(item: HashResult | IPResult | DomainResult): { rate: number; total: number } {
  const stats = item.vt_meta?.data?.attributes?.last_analysis_stats;
  
  if (!stats) return { rate: 0, total: 0 };
  
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const undetected = stats.undetected || 0;
  const harmless = stats.harmless || 0;
  
  const total = malicious + suspicious + undetected + harmless;
  const detections = malicious + suspicious;
  
  return {
    rate: detections,
    total: total
  };
};
