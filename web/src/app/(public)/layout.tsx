import { LandingNavbar } from "@/components/landing-navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <LandingNavbar />
      {children}
    </div>
  );
}
