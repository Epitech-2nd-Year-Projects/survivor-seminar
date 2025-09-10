import Link from "next/link";
import { getStartupServer } from "@/lib/api/services/startups/server";
import MyStartupProfile from "@/components/profile/my-startup-profile";
import { Button } from "@/components/ui/button";

export default async function MyProfilePage() {
  const myStartup = await getStartupServer(1, 0);

  if (!myStartup) {
    return (
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <h1 className="mb-2 text-2xl font-semibold">My Profile</h1>
        <p className="text-muted-foreground mb-6">
          You don’t have a startup yet.
        </p>
        <Link href="/projects/new">
          <Button>Create my startup</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto p-4 sm:p-6">
      <MyStartupProfile startupId={myStartup.id} />
    </main>
  );
}
