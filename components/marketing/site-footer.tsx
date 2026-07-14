import React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  const productLinks = [
    { name: 'Fonctionnalités', href: '/features' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Aide & FAQ', href: '/help' },
  ];

  const devLinks = [
    { name: 'Portail Développeurs', href: '/developers' },
  ];

  const companyLinks = [
    { name: 'À propos', href: '/about' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Presse', href: '/press' },
    { name: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Mentions légales', href: '/legal' },
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'Conditions d\'utilisation', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
  ];

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Produit</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Développeurs</h3>
            <ul className="space-y-2">
              {devLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Légal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="KSM Logo" className="w-8 h-8 object-contain" />
            <span className="text-sm font-bold text-gray-400">
              Billing <span className="text-xs text-gray-500 font-normal">by KSM</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} KSM. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
