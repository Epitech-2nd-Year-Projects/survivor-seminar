"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNews } from "@/lib/fetchers";
import { capitalize } from "@/lib/utils";
import type { News } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ListRestartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Projects() {
  const router = useRouter();

  const {
    data: news = [],
    isLoading,
    isError,
    error,
  } = useQuery<News[], Error>({
    queryKey: ["news"],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined,
  );

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(
        news.map((n) => n.category).filter((m): m is string => m != null),
      ),
    ).sort();
  }, [news]);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          news
            .map((n) => n.location?.split(",").pop()?.trim())
            .filter((c): c is string => !!c),
        ),
      ).sort(),
    [news],
  );

  const visibleNews = useMemo(
    () =>
      news.filter((e) => {
        const city = e.location?.split(",").pop()?.trim();
        return (
          (!selectedCategory || e.category === selectedCategory) &&
          (!selectedLocation || city === selectedLocation)
        );
      }),
    [news, selectedCategory, selectedLocation],
  );

  const resetFilters = () => {
    setSelectedCategory(undefined);
    setSelectedLocation(undefined);
  };

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select
          disabled={isLoading}
          value={selectedCategory ?? ""}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              {categoryOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {capitalize(m)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          disabled={isLoading}
          value={selectedLocation ?? ""}
          onValueChange={setSelectedLocation}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>City</SelectLabel>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          disabled={isLoading}
          variant="secondary"
          size="icon"
          className="size-8"
          onClick={resetFilters}
        >
          <ListRestartIcon />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
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
          : visibleNews.map((news) => (
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
