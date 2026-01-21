import React from 'react';
import { useNavigate } from 'react-router-dom';
import NoVoChat from '../components/NoVoChat.tsx';
import { Language } from '../translations.ts';

interface AiChatPageProps {
  lang: Language;
}

const AiChatPage: React.FC<AiChatPageProps> = ({ lang }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <NoVoChat
            onClose={() => navigate(-1)}
            lang={lang}
            variant="panel"
          />
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
