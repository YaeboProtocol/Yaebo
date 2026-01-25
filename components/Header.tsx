import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold">STD Protocol</Link>
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link href="/manufacturer" className="hover:text-primary-foreground/80">
                Manufacturer
              </Link>
            </li>
            <li>
              <Link href="/diligence" className="hover:text-primary-foreground/80">
                Diligence
              </Link>
            </li>
            <li>
              <Link href="/dao" className="hover:text-primary-foreground/80">
                DAO
              </Link>
            </li>
            <li>
              <Link href="/investor" className="hover:text-primary-foreground/80">
                Investor
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 