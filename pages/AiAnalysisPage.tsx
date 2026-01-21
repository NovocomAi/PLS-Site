import React from 'react';
import ImageAnalysis from '../components/ImageAnalysis.tsx';
import { Language, translations } from '../translations.ts';

interface AiAnalysisPageProps {
  lang: Language;
}

const AiAnalysisPage: React.FC<AiAnalysisPageProps> = ({ lang }) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <ImageAnalysis lang={lang} />
      </div>
    </div>
  );
};

export default AiAnalysisPage;
