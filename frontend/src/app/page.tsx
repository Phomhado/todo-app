import AuthLayout from "./components/AuthLayout";
import Link from "next/link";

export default function Home() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-4 text-center">To Do App</h1>
      <p className="text-center text-sm text-gray-400">
        Welcome! Login or Sign up to manage your tasks.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link href="/login" className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white">Log in</Link>
        <Link href="/signup" className="rounded-md border border-gray-600 px-4 py-2 font-semibold text-white">Sign up</Link>
      </div>
    </AuthLayout>
  );
}
