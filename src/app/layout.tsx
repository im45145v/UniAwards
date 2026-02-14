import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniAwards - University Yearbook Awards",
  description: "Nominate, vote, and celebrate university yearbook awards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
