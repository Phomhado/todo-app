type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-white">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6">
        {children}
      </div>
    </main>
  );
}
