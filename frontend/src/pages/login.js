import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/shared/Navbar';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <>
      <Head><title>Log in — AI Skin Intelligence</title></Head>
      <Navbar role="guest" />
      <main className="mx-auto flex max-w-md flex-col px-6 py-20">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-800">Log in to your dashboard</h1>
        <div className="card mt-8 p-6">
          <LoginForm onSuccess={() => router.push('/dashboard')} />
        </div>
        <p className="mt-6 text-center text-sm text-ink-400">
          New here? <Link href="/signup" className="font-semibold text-ink-700">Create an account</Link>
        </p>
      </main>
    </>
  );
}
