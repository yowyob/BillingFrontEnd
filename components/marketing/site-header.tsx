'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false);

  const navigation = [
    { name: 'Fonctionnalités', href: '/features' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'Développeurs', href: '/developers' },
    { name: 'Documentation', href: '/docs' },
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="KSM Logo" className="w-9 h-9 object-contain" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-gray-900">Billing</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">by KSM</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors px-2"
            >
              Connexion
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm px-5 py-2">
              <Link href="/try-out" className="flex items-center gap-1.5">
                Essayer <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-4 pb-3">
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/try-out"
                className="block px-3 py-2 mt-2 rounded-md text-base font-medium text-white bg-blue-600 text-center"
                onClick={() => setIsOpen(false)}
              >
                Essayer
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
