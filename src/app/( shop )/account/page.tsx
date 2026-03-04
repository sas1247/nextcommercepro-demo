import AccountClient from "./AccountClient";

export default function AccountPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          My Account
        </h1>

        <AccountClient />
      </div>
    </main>
  );
}