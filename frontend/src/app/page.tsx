import AuthLayout from "./components/AuthLayout";

export default function Home() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-4 text-center">To Do App</h1>
      <p className="text-center text-sm text-gray-400">
        Welcome! Login or Sign up to manage your tasks.
      </p>
    </AuthLayout>
  );
}
