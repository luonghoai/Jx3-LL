import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize Vietnamese text for better search functionality
 * Removes diacritics and converts to lowercase for flexible matching
 */
export function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đ]/g, 'd') // Replace đ with d
    .replace(/[Đ]/g, 'd') // Replace Đ with d
}

/**
 * Check if text matches search query with Vietnamese text normalization
 */
export function matchesVietnameseSearch(text: string, searchQuery: string): boolean {
  const normalizedText = normalizeVietnameseText(text)
  const normalizedQuery = normalizeVietnameseText(searchQuery)
  return normalizedText.includes(normalizedQuery)
} 