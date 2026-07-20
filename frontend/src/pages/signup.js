import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/shared/Navbar';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();

  return (
    <>
      <Head><title>Create your account — AI Skin Intelligence</title></Head>
      <Navbar role="guest" />
      <main className="mx-auto flex max-w-md flex-col px-6 py-20">
        <p className="eyebrow">Get started</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-800">Create your account</h1>
        <div className="card mt-8 p-6">
          <SignupForm onSuccess={() => router.push('/assessment')} />
        </div>
        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account? <Link href="/login" className="font-semibold text-ink-700">Log in</Link>
        </p>
      </main>
    </>
  );
}
