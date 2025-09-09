import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/ui/footer-section";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <LandingNavbar />
      {children}
      <Footer />
    </div>
  );
}
