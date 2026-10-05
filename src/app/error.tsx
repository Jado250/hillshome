"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-4xl font-semibold">Something went wrong</h1>
      <p className="mt-3">We could not load this page. Try again in a moment.</p>
      <button onClick={reset} className="btn-navy mt-6">Try again</button>
    </div>
  );
}
