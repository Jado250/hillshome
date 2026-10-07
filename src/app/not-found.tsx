import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">Page not found</h1>
      <p className="mt-3">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-navy mt-6">Go to home</Link>
    </div>
  );
}
