import React from 'react';
import Link from 'next/link';
import ConnectWallet from '@/components/connect-wallet';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          STD Protocol
        </Link>
        
        <div className="flex items-center">
          <nav className="mr-6">
            <ul className="flex gap-6">
              <li>
                <Link href="/manufacturer" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  Manufacturer
                </Link>
              </li>
              <li>
                <Link href="/diligence" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  Diligence
                </Link>
              </li>
              <li>
                <Link href="/dao" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  DAO
                </Link>
              </li>
              <li>
                <Link href="/investor" className="hover:text-primary-foreground/80 transition-colors font-medium">
                  Investor
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="relative">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 