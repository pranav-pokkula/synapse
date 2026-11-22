import Link from 'next/link';
export default function NotFound(){return <main className="empty-state"><h1>A connection we couldn’t find.</h1><p>This page does not exist. Your learning journey is one step away.</p><Link className="button primary" href="/learn">Return to the studio</Link></main>;}
