# PLS Consultants - Supabase Migration Guide

## What's Been Built ⚡

### 1. Database Schema (`supabase/schema.sql`)
- **clients** - Core client profiles
- **documents** - Uploaded files with metadata
- **audit_log** - Full audit trail
- **ai_consultations** - AI interaction history
- **document_requests** - Track outstanding doc requests
- **communications** - Email/WhatsApp log
- **knowledge_base** - RAG system for accountancy AI (with vector embeddings)

### 2. TypeScript Types (`src/lib/database.types.ts`)
- Full type definitions for all tables
- Insert/Update types for type-safe operations

### 3. Supabase Client (`src/lib/supabase.ts`)
- Configured client with auth helpers
- Sign up, sign in, sign out functions
- Magic link authentication support

### 4. Client Service Layer (`src/lib/clients.ts`)
- CRUD operations for clients
- Document upload/delete with Storage
- Audit logging
- Missing document detection

---

## What You Need To Do

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose a name (e.g., "pls-consultants")
4. Select region: **London (eu-west-2)** for GDPR compliance
5. Set a strong database password (save it!)
6. Wait for project to provision (~2 minutes)

### Step 2: Get Your Keys
1. Go to **Project Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (the long one)

### Step 3: Create `.env.local`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-existing-gemini-key
```

### Step 4: Run the Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Paste contents of `supabase/schema.sql`
3. Click **Run**

### Step 5: Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Create bucket: `documents` (private)
3. Set policies:
   - Authenticated users can upload to their folder
   - Users can only read their own files

### Step 6: Enable Auth
1. Go to **Authentication → Providers**
2. Email is enabled by default
3. Optional: Enable magic links for passwordless login

### Step 7: Install Dependencies & Test
```bash
cd PLS-Site
npm install
npm run dev
```

---

## Next Steps (NovoNic Will Do)

Once you share the Supabase URL + key:

1. [ ] Update React components to use Supabase instead of localStorage
2. [ ] Implement proper auth flow (sign up, login, protected routes)
3. [ ] Connect document upload to Supabase Storage
4. [ ] Add email automation service (Resend)
5. [ ] Build the RAG system for accountancy AI
6. [ ] Add WhatsApp integration

---

## File Structure

```
PLS-Site/
├── supabase/
│   └── schema.sql          # Database schema
├── src/
│   └── lib/
│       ├── supabase.ts     # Supabase client
│       ├── database.types.ts # TypeScript types
│       └── clients.ts      # Client service layer
├── .env.example            # Environment template
└── MIGRATION-GUIDE.md      # This file
```

---

## Security Notes

- Row Level Security (RLS) is enabled
- Clients can only see their own data
- Admin operations use service role key (server-side only)
- Documents bucket is private with signed URLs

---

## Questions?

Ping NovoNic on Telegram. ⚡
