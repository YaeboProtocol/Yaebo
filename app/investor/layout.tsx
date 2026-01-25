"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ChevronRight, CircleDollarSign, Home, LayoutDashboard, Settings, ShoppingCart } from "lucide-react";

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/">
                <div className="flex items-center space-x-2">
                  <CircleDollarSign className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">STD Protocol</span>
                </div>
              </Link>
            </div>
            
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className={`mr-3 flex-shrink-0 ${isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-gray-500"}`}>
                      {item.icon}
                    </div>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Investor Account</p>
                <p className="text-xs text-gray-500">Connected with Wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="flex md:hidden items-center justify-between p-4 bg-white border-b w-full">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <CircleDollarSign className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">STD Protocol</span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          {pathname.includes("/investor/marketplace") && (
            <Card className="p-2 bg-gray-100">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </Card>
          )}
          {pathname.includes("/investor/portfolio") && (
            <Card className="p-2 bg-gray-100">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </Card>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1">
          {/* Breadcrumb (only on desktop) */}
          <div className="hidden md:flex items-center space-x-2 py-4 px-6 bg-white border-b">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <Link href="/investor" className="text-sm text-gray-500 hover:text-gray-700">
              Investor
            </Link>
            {pathname.includes("/marketplace") && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Marketplace</span>
              </>
            )}
            {pathname.includes("/portfolio") && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Portfolio</span>
              </>
            )}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
} 