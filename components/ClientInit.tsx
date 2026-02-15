"use client";

import { useEffect } from "react";
import { initMockData } from "@/lib/mock-service";

export function ClientInit() {
  useEffect(() => {
    // Handle browser extension errors (e.g., Stacks wallet extension)
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      // Suppress StacksProvider redefinition errors from browser extensions
      if (errorMessage.includes('Cannot redefine property: StacksProvider') || 
          errorMessage.includes('StacksProvider')) {
        event.preventDefault();
        return false;
      }
    };

    // Add global error handler
    window.addEventListener('error', handleError);

    // Initialize mock data on the client side
    initMockData();

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
} 