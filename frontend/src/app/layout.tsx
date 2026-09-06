import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisEnterprise Copilot | Kshitij 2026 NLP Challenge",
  description: "Autonomous Agentic Enterprise Assistant for Digital Workplace Productivity (IIT Kharagpur & HCLTech)",
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
