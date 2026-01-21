import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../translations.ts';

interface ClientDashboardPageProps {
  lang: Language;
}

type Profile = {
  name: string;
  email: string;
  address: string;
  phone: string;
};

type AuditEntry = {
  id: string;
  type: 'profile' | 'upload';
  summary: string;
  timestamp: string;
};

type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  category: 'identity' | 'accounting';
  timestamp: string;
  url: string;
  isImage: boolean;
  docKind: 'passport' | 'driver_license' | 'bank_statement' | 'compliance' | 'expenses' | 'other';
  note: string;
};

const defaultProfile: Profile = {
  name: 'Client Name',
  email: 'client@example.com',
  address: 'Vauxhall, London',
  phone: '+44 0000 000000',
};

const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({ lang: _lang }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onboardingProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem('pls_signup_profile');
      return stored ? (JSON.parse(stored) as Profile) : null;
    } catch {
      return null;
    }
  }, []);

  const portalEmail = useMemo(() => {
    try {
      return localStorage.getItem('pls_portal_email') || (location.state as any)?.email || '';
    } catch {
      return '';
    }
  }, [location.state]);

  const initialProfile = onboardingProfile || {
    ...defaultProfile,
    email: portalEmail || defaultProfile.email,
  };

  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [saving, setSaving] = useState(false);
  const [identityKind, setIdentityKind] = useState<UploadedDoc['docKind']>('passport');
  const [identityNote, setIdentityNote] = useState('');
  const [accountingKind, setAccountingKind] = useState<UploadedDoc['docKind']>('bank_statement');
  const [accountingNote, setAccountingNote] = useState('');
  const objectUrlsRef = useRef<string[]>([]);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<UploadedDoc | null>(null);

  const logChange = (summary: string, type: AuditEntry['type']) => {
    setAudit((prev) => [
      { id: crypto.randomUUID(), summary, type, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  };

  const persistClient = (nextDocs: UploadedDoc[], nextAudit: AuditEntry[]) => {
    try {
      const key = 'pls_clients';
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      const record = {
        profile,
        docs: nextDocs,
        audit: nextAudit,
        updatedAt: new Date().toISOString(),
      };
      parsed[portalEmail] = record;
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch (err) {
      console.error('Persist client failed', err);
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const diffs: string[] = [];
    (['name', 'email', 'address', 'phone'] as (keyof Profile)[]).forEach((key) => {
      if (profile[key] !== draft[key]) {
        diffs.push(`${key} changed`);
      }
    });
    setProfile(draft);
    if (diffs.length > 0) {
      logChange(`Profile updated: ${diffs.join(', ')}`, 'profile');
    }
    persistClient(docs, audit);
    setSaving(true);
    setTimeout(() => setSaving(false), 700);
  };

  const handleUpload = (
    category: UploadedDoc['category'],
    fileList: FileList | null,
    docKind: UploadedDoc['docKind'],
    note: string
  ) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    const entry: UploadedDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      category,
      timestamp: new Date().toISOString(),
      url,
      isImage: file.type.startsWith('image/'),
      docKind,
      note,
    };
    setDocs((prev) => {
      let next = [...prev];
      if (category === 'identity') {
        next = next.filter((d) => !(d.category === 'identity' && d.docKind === docKind));
      }
      next = [entry, ...next];
      const desc = category === 'identity' ? 'Identity Vault' : 'Accounting Folder';
      logChange(`Uploaded ${file.name} to ${desc} (${docKind})`, 'upload');
      persistClient(next, audit);
      return next;
    });
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const identityDocs = docs.filter((d) => d.category === 'identity');
  const accountingDocs = docs.filter((d) => d.category === 'accounting');

  React.useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const triggerReplace = (doc: UploadedDoc) => {
    setReplaceTarget(doc);
    replaceInputRef.current?.click();
  };

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replaceTarget) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    const updated: UploadedDoc = {
      ...replaceTarget,
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      timestamp: new Date().toISOString(),
      url,
      isImage: file.type.startsWith('image/'),
    };
    setDocs((prev) => {
      const next = prev.map((d) => (d.id === replaceTarget.id ? updated : d));
      logChange(`Replaced ${replaceTarget.name} with ${file.name}`, 'upload');
      persistClient(next, audit);
      return next;
    });
    setReplaceTarget(null);
    e.target.value = '';
  };

  if (!portalEmail) {
    return (
      <div className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Portal access required</h1>
          <p className="text-slate-600">Please sign in or create an account to view your client workspace.</p>
          <div className="flex gap-3 justify-center">
            <button
              className="px-6 py-3 bg-slate-900 text-amber-500 font-bold rounded-xl shadow hover:bg-slate-800"
              onClick={() => navigate('/')}
            >
              Go to sign in
            </button>
            <Link
              to="/signup"
              className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow hover:bg-amber-600"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <input
          type="file"
          ref={replaceInputRef}
          className="hidden"
          onChange={handleReplace}
        />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-[0.25em]">
              Client Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 font-serif italic">Your secure workspace</h1>
            <p className="text-slate-600 mt-3 max-w-2xl">
              Manage your profile, upload identity and accounting documents, and view a full audit trail of changes.
            </p>
            <div className="text-sm text-slate-500 mt-2">Signed in as {portalEmail}</div>
          </div>
          <div className="bg-white border border-amber-100 text-amber-700 px-4 py-3 rounded-xl text-sm font-bold">
            Audit logging enabled
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Profile details</h2>
            <form className="space-y-5" onSubmit={saveProfile}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Address</label>
                  <input
                    type="text"
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Telephone</label>
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 text-amber-500 font-bold rounded-xl shadow hover:bg-slate-800 transition-all"
                >
                  Save changes
                </button>
                {saving && <span className="text-slate-500 text-sm self-center">Saved.</span>}
              </div>
            </form>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Audit history</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {audit.length === 0 && (
                <div className="text-sm text-slate-400">No changes recorded yet.</div>
              )}
              {audit.map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="text-xs font-bold text-slate-700">{entry.summary}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">Identity vault</h3>
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold"
                  value={identityKind}
                  onChange={(e) => setIdentityKind(e.target.value as UploadedDoc['docKind'])}
                >
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver Licence</option>
                </select>
                <label className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold cursor-pointer border border-amber-100">
                  Upload ID
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleUpload('identity', e.target.files, identityKind, identityNote)}
                  />
                </label>
              </div>
            </div>
            <div className="grid md:grid-cols-[2fr_1fr] gap-3 mb-3">
              <p className="text-sm text-slate-500">Add passport or driver licence files. Stored securely with a change record.</p>
              <input
                type="text"
                value={identityNote}
                onChange={(e) => setIdentityNote(e.target.value)}
                placeholder="Note (e.g., Front, Expiry 2028)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {identityDocs.length === 0 && <div className="text-sm text-slate-400">No identity documents uploaded.</div>}
              {identityDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2 hover:border-amber-200 hover:bg-amber-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
                      {doc.isImage ? (
                        <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase">File</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 underline truncate">{doc.name}</div>
                      <div className="text-[11px] text-amber-700 uppercase tracking-[0.2em]">{doc.docKind}</div>
                      <div className="text-[11px] text-slate-500 truncate">{doc.note || 'No note added'}</div>
                      <div className="text-[11px] text-slate-400 truncate">{formatSize(doc.size)} • {new Date(doc.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-600 font-bold uppercase tracking-[0.2em]">
                    ID
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        triggerReplace(doc);
                      }}
                      className="text-amber-700 hover:text-amber-800 underline"
                    >
                      Replace
                    </button>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">Accounting folder</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                  value={accountingKind}
                  onChange={(e) => setAccountingKind(e.target.value as UploadedDoc['docKind'])}
                >
                  <option value="bank_statement">Bank statement</option>
                  <option value="compliance">Compliance documents</option>
                  <option value="expenses">Expenses</option>
                  <option value="other">Other</option>
                </select>
                <label className="px-3 py-2 bg-slate-900 text-amber-500 rounded-lg text-sm font-semibold cursor-pointer border border-slate-800">
                  Upload document
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUpload('accounting', e.target.files, accountingKind, accountingNote)}
                  />
                </label>
              </div>
            </div>
            <div className="grid md:grid-cols-[2fr_1fr] gap-3 mb-3">
              <p className="text-sm text-slate-500">Store working papers, tax packs, or evidence. Organised and logged.</p>
              <input
                type="text"
                value={accountingNote}
                onChange={(e) => setAccountingNote(e.target.value)}
                placeholder="Note (e.g., Jan 2025 VAT)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {accountingDocs.length === 0 && <div className="text-sm text-slate-400">No accounting documents uploaded.</div>}
              {accountingDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2 hover:border-slate-300 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
                      {doc.isImage ? (
                        <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase">File</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 underline truncate">{doc.name}</div>
                      <div className="text-[11px] text-slate-700 uppercase tracking-[0.2em]">{doc.docKind}</div>
                      <div className="text-[11px] text-slate-500 truncate">{doc.note || 'No note added'}</div>
                      <div className="text-[11px] text-slate-400 truncate">{formatSize(doc.size)} • {new Date(doc.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                    Folder
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        triggerReplace(doc);
                      }}
                      className="text-slate-800 hover:text-slate-900 underline"
                    >
                      Replace
                    </button>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">AI tools</h3>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Client access only</div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/ai/legal"
              className="p-4 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/40 transition-colors shadow-sm"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">Legal</div>
              <div className="mt-2 font-bold text-slate-900">AI Legal Guidance</div>
              <div className="text-xs text-slate-500 mt-1">Grounded legal context for UK/PT.</div>
            </Link>
            <Link
              to="/ai/translation"
              className="p-4 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/40 transition-colors shadow-sm"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">Linguistics</div>
              <div className="mt-2 font-bold text-slate-900">Document Translation</div>
              <div className="text-xs text-slate-500 mt-1">Certified-style EN↔PT translation.</div>
            </Link>
            <Link
              to="/ai/analysis"
              className="p-4 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/40 transition-colors shadow-sm"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">Imaging</div>
              <div className="mt-2 font-bold text-slate-900">Image Analysis</div>
              <div className="text-xs text-slate-500 mt-1">Upload evidence for structured insight.</div>
            </Link>
            <Link
              to="/ai/chat"
              className="p-4 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/40 transition-colors shadow-sm"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">Concierge</div>
              <div className="mt-2 font-bold text-slate-900">NoVo AI Chat</div>
              <div className="text-xs text-slate-500 mt-1">Route requests and get quick answers.</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
