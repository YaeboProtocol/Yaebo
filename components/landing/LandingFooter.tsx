'use client';

import React from 'react';
import Link from 'next/link';
import { Github, FileText, BookOpen, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Explore Assets', href: '/investor' },
    { label: 'For Manufacturers', href: '/manufacturer' },
    { label: 'Diligence Dashboard', href: '/diligence' },
    { label: 'DAO Governance', href: '/dao' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Whitepaper', href: '/whitepaper', icon: <FileText className="h-4 w-4" /> },
    { label: 'GitHub', href: 'https://github.com', icon: <Github className="h-4 w-4" /> },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Compliance', href: '/compliance' },
  ],
};

const socialLinks = [
  { icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <Linkedin className="h-5 w-5" />, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: <Github className="h-5 w-5" />, href: 'https://github.com', label: 'GitHub' },
  { icon: <Mail className="h-5 w-5" />, href: 'mailto:contact@tachyonx.com', label: 'Email' },
];

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-primary/10 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              TachyonX
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tokenizing real-world assets for institutional investors. 
              Bringing traditional finance on-chain.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TachyonX. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Regulatory compliance verified. Licensed and audited.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

