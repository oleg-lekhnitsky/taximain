"use client";
import { useSiteContent } from "./ContentProvider";
export function useCopy() {
  return useSiteContent().copy;
}
