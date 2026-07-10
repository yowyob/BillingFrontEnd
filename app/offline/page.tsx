'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-background p-8 text-center">
      <div className="p-4 bg-orange-100 rounded-full mb-6">
        <WifiOff size={48} className="text-orange-600" />
      </div>
      <h1 className="text-2xl font-black text-secondary mb-2">Vous êtes hors ligne</h1>
      <p className="text-gray-500 max-w-md mb-8">
        L&apos;application reste utilisable. Vos modifications seront synchronisées
        automatiquement au retour de la connexion.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 bg-secondary-mid text-white px-6 py-3 rounded-xl font-bold text-sm"
      >
        <RefreshCw size={16} />
        Réessayer
      </button>
    </div>
  );
}
