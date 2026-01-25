"use client";

import { useEffect } from "react";
import { initMockData } from "@/lib/mock-service";

export function ClientInit() {
  useEffect(() => {
    // Initialize mock data on the client side
    initMockData();
  }, []);

  return null;
} 