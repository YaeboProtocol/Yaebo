'use client';

import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return <div className="w-full">{children}</div>;
  }

  return <main className="flex-grow container mx-auto p-4">{children}</main>;
}

