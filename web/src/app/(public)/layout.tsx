import { LandingNavbar } from "@/components/landing-navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-safe-or-6">
      <LandingNavbar />
      {children}
    </div>
  );
}
