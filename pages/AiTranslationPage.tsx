import React from 'react';
import DocumentTranslation from '../components/DocumentTranslation.tsx';
import { Language, translations } from '../translations.ts';

interface AiTranslationPageProps {
  lang: Language;
}

const AiTranslationPage: React.FC<AiTranslationPageProps> = ({ lang }) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <DocumentTranslation lang={lang} />
      </div>
    </div>
  );
};

export default AiTranslationPage;
