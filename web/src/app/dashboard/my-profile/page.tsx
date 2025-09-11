import "server-only";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MyStartupProfile from "@/components/profile/my-startup-profile";

import { getUserMeServer } from "@/lib/api/services/users/server";
import { getFounderServer } from "@/lib/api/services/founders/server";
import { getStartupServer } from "@/lib/api/services/startups/server";

export default async function MyProfilePage() {
  const user = await getUserMeServer();

  if (!user.founderId) {
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

  const founder = await getFounderServer(user.founderId);
  const startup = await getStartupServer(founder.startupId);

  if (!startup) {
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
      <MyStartupProfile startupId={startup.id} />
    </main>
  );
}
