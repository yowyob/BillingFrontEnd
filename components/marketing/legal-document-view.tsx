import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import { legalDocumentList } from '@/lib/legal-documents';

interface LegalDocumentViewProps {
  slug: 'terms' | 'privacy' | 'cookies';
}

export function LegalDocumentView({ slug }: LegalDocumentViewProps) {
  const doc = legalDocumentList.find((d) => d.slug === slug);

  if (!doc) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Document non trouvé</h1>
        <Link href="/legal" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux documents légaux
        </Link>
      </div>
    );
  }

  // Basic custom markdown parser to convert ## into headings and paragraphs
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('##')) {
        return (
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">
            {trimmed.replace('##', '').trim()}
          </h2>
        );
      }
      if (trimmed) {
        return (
          <p key={index} className="text-gray-600 leading-relaxed mb-4">
            {trimmed}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <section className="bg-gray-50 py-12 pb-20 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux documents légaux
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Scale className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Document Légal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            {doc.title}
          </h1>
          <p className="text-gray-500 text-sm mb-8 pb-8 border-b border-gray-200">
            {doc.description}
          </p>

          <div className="prose max-w-none">
            {renderContent(doc.content)}
          </div>
        </div>
      </div>
    </section>
  );
}
