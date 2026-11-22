"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="empty-state">
      <h1>Let’s reconnect.</h1>
      <p>
        This view could not load. Your saved learning data is still available.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <a className="text-link" href="/learn">
        Open the learning studio
      </a>
    </main>
  );
}
