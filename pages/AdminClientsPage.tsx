import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type ClientRecord = {
  profile: { name: string; email: string; address: string; phone: string };
  updatedAt: string;
  docs?: { category: string }[];
};

const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Record<string, ClientRecord>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pls_clients');
      setClients(raw ? JSON.parse(raw) : {});
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  }, []);

  const entries = Object.entries(clients) as [string, ClientRecord][];

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-[0.25em]">
              Admin
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">Client directory</h1>
            <p className="text-slate-600 text-sm mt-1">Select a client to view profile and documents.</p>
          </div>
        </div>

        {entries.length === 0 && <div className="text-slate-500">No clients captured yet.</div>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(([email, record]) => (
            <Link
              key={email}
              to={`/admin/clients/${encodeURIComponent(email)}`}
              className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-amber-200 hover:bg-amber-50/40 transition-colors"
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{email}</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{record.profile.name || 'Unnamed client'}</div>
              <div className="text-sm text-slate-500 mt-1">{record.profile.address}</div>
              <div className="text-[11px] text-slate-400 mt-2">Updated {new Date(record.updatedAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminClientsPage;
