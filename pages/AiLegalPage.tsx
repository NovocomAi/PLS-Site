import React from 'react';
import AILegalAdvice from '../components/AILegalAdvice.tsx';
import { Language, translations } from '../translations.ts';

interface AiLegalPageProps {
  lang: Language;
}

const AiLegalPage: React.FC<AiLegalPageProps> = ({ lang }) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <AILegalAdvice lang={lang} />
      </div>
    </div>
  );
};

export default AiLegalPage;
