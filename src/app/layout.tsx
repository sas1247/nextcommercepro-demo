import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextCommerce Pro",
  description: "NextCommerce Pro demo store.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
