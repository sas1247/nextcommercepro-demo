export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Cookie Settings</h1>
      <p className="mt-2 text-sm text-black/60">
        Manage your cookie preferences.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">Cookie categories</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          • Essential — required for site functionality (cart, authentication, security).
• Preferences — remember your choices.
• Analytics — help us understand usage to improve the product.
• Marketing — personalization and campaign measurement (only if accepted).
        </p>
        <h2 className="text-base font-semibold text-black">How to change preferences</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          You can update preferences at any time using the cookie module (banner/popup) or in your browser settings. Disabling essential cookies may affect site functionality.
        </p>
        <h2 className="text-base font-semibold text-black">More info</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          For full details, see the Cookie Policy page.
        </p>
      </div>
    </div>
  );
}
