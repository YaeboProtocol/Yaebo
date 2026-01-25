"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { 
  ChevronRight, 
  CircleDollarSign, 
  Home, 
  LayoutDashboard, 
  Settings, 
  ShoppingCart,
  User
} from "lucide-react";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: "Marketplace",
      href: "/investor/marketplace",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: "Portfolio",
      href: "/investor/portfolio",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/investor/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar - this is part of the global layout and should be removed from here */}
      {/* We'll keep only the sidebar navigation for the investor section */}

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white hidden md:block">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <CircleDollarSign className="h-6 w-6 text-indigo-600" />
                <span className="font-bold text-lg">STD Protocol</span>
              </Link>
            </div>
            <nav className="p-4 flex-1">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  
                  return (
                    <li key={item.href}>
                      <Link 
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          isActive 
                            ? "bg-indigo-100 text-indigo-600" 
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <div className={`mr-3 ${isActive ? "text-indigo-600" : "text-gray-500"}`}>
                          {item.icon}
                        </div>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            <div className="border-t p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <CircleDollarSign className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Investor Account</p>
                  <p className="text-xs text-gray-500">Connected with Wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile header - simplified for smaller screens */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b w-full">
          <Link href="/" className="flex items-center space-x-2">
            <CircleDollarSign className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-lg">STD Protocol</span>
          </Link>
          
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-md ${isActive ? "bg-indigo-100 text-indigo-600" : "text-gray-500"}`}
                >
                  {item.icon}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-50">
          <main>
            {/* Breadcrumb (only on desktop) */}
            <div className="hidden md:flex items-center space-x-2 py-4 px-6 bg-white border-b">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Link href="/investor" className="text-sm text-gray-500 hover:text-gray-700">
                Investor
              </Link>
              {pathname.includes("/marketplace") && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Marketplace</span>
                </>
              )}
              {pathname.includes("/portfolio") && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Portfolio</span>
                </>
              )}
            </div>
            
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 