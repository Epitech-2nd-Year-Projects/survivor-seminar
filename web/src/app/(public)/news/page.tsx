"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useNewsList } from "@/lib/api/services/news/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function useUrlState() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const get = (k: string) => sp.get(k) ?? undefined;
  const set = (next: Record<string, string | undefined>) => {
    const n = new URLSearchParams(Array.from(sp.entries()));
    for (const [k, v] of Object.entries(next)) {
      if (!v) n.delete(k);
      else n.set(k, v);
    }
    router.replace(`${pathname}?${n.toString()}`);
  };

  return {
    page: Number(get("page") ?? "1"),
    perPage: Number(get("per_page") ?? "20"),
    set,
  };
}

export default function NewsPage() {
  const router = useRouter();
  const { page, perPage } = useUrlState();

  const { data, isLoading, isError, error } = useNewsList({
    page,
    perPage,
  });

  const listNews = data?.data ?? [];

  if (isError) {
    console.log(error);
    return <div>Error: {userMessageFromError(error)}</div>;
  }

  const showSkeletons = isLoading && !data;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showSkeletons
          ? Array.from({ length: perPage }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-5 w-3/4" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-1/2" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-5/6" />
                </CardContent>
              </Card>
            ))
          : listNews.map((news) => (
              <Card
                key={news.id}
                className="focus:ring-primary transform cursor-pointer transition duration-200 ease-out hover:scale-105 hover:shadow-lg focus:scale-105 focus:ring-2 focus:outline-none"
                onClick={() => router.push(`/news/${news.id}`)}
              >
                <CardHeader>
                  <CardTitle>{news.title}</CardTitle>
                  <CardDescription className="flex gap-1">
                    {
                      <Badge variant="secondary">
                        {news.location ?? "No address provided"}
                      </Badge>
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {news.description ?? "No description provided."}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
