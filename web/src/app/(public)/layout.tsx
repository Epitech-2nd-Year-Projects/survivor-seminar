import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/ui/footer-section";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col">
      <LandingNavbar />
      <main className="flex-1 p-6">{children}</main>
      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
}
