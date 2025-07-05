type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 bg-gray-950 rounded-2xl shadow-xl border border-gray-800">
        {children}
      </div>
    </div>
  );
}
