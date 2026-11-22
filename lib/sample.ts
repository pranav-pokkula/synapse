import { createHash } from "node:crypto";
import { analyze, indexFile } from "./analysis";
const sources: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "fieldnotes",
      private: true,
      dependencies: {
        next: "16",
        react: "19",
        zod: "4",
        "@supabase/supabase-js": "2",
      },
    },
    null,
    2,
  ),
  "app/page.tsx": `import { NoteComposer } from '../components/note-composer';
import { listNotes } from '../lib/notes';

export default async function HomePage() {
  const notes = await listNotes();
  return <main><h1>Fieldnotes</h1><NoteComposer />
    {notes.map(note => <article key={note.id}>{note.body}</article>)}
  </main>;
}`,
  "components/note-composer.tsx": `'use client';
import { useState } from 'react';

export function NoteComposer() {
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  async function save() {
    const response = await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });
    setMessage(response.ok ? 'Note saved' : 'Could not save your note');
  }
  return <section><textarea aria-label="Note" value={body}
    onChange={event => setBody(event.target.value)} />
    <button onClick={save}>Save note</button><p role="status">{message}</p>
  </section>;
}`,
  "app/api/notes/route.ts": `import { noteSchema } from '../../../lib/validation';
import { getDatabase } from '../../../lib/database';

export async function POST(request: Request) {
  const db = await getDatabase();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
  const parsed = noteSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: 'Invalid note' }, { status: 400 });
  const { data, error } = await db.from('notes')
    .insert({ body: parsed.data.body, user_id: user.id }).select('id').single();
  if (error) return Response.json({ error: 'Save failed' }, { status: 503 });
  return Response.json(data, { status: 201 });
}`,
  "lib/validation.ts": `import { z } from 'zod';
export const noteSchema = z.object({
  body: z.string().trim().min(1).max(2000)
});`,
  "lib/database.ts": `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getDatabase() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      cookies: { getAll: () => store.getAll(), setAll: values => {
        values.forEach(({ name, value, options }) => store.set(name, value, options));
      }}
    });
}`,
  "lib/notes.ts": `import { getDatabase } from './database';
export async function listNotes() {
  const db = await getDatabase();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return [];
  const { data, error } = await db.from('notes').select('id, body')
    .eq('user_id', user.id).limit(20);
  if (error) throw new Error('Notes unavailable');
  return data ?? [];
}`,
  "db/schema.sql": `create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  body text not null check (length(body) <= 2000)
);
alter table notes enable row level security;
create policy own_notes on notes to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);`,
  "tests/validation.test.ts": `import { expect, test } from 'vitest';
import { noteSchema } from '../lib/validation';
test('empty notes are rejected', () => {
  expect(noteSchema.safeParse({ body: '' }).success).toBe(false);
});`,
};
// A content hash identifies this embedded teaching fixture. It is NOT a GitHub commit.
const hash = createHash("sha1").update(JSON.stringify(sources)).digest("hex");
export function sampleSnapshot() {
  return analyze({
    id: "sample",
    owner: "synapse-demo",
    repo: "fieldnotes",
    branch: "teaching-fixture",
    sha: hash,
    description:
      "A small note-taking app. Follow a note from the interface through validation and into storage.",
    files: Object.entries(sources).map(([path, content]) =>
      indexFile(path, content, hash),
    ),
    coverage: {
      total: Object.keys(sources).length,
      eligible: Object.keys(sources).length,
      indexed: Object.keys(sources).length,
      partial: false,
      skipped: [],
    },
    createdAt: "2026-11-22T12:00:00.000Z",
    sample: true,
  });
}
