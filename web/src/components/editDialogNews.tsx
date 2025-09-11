"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { UpdateNewsBody } from "@/lib/api/services/news/client";
import type { News } from "@/lib/api/contracts/news";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  news: News | null;
  onSubmit: (id: number, body: UpdateNewsBody) => void | Promise<void>;
  description?: string;
};

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export default function EditDialogNews({
  open,
  onOpenChange,
  news,
  onSubmit,
  description = "Edit the news data",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[min(100vw-1rem,720px)] flex-col overflow-hidden rounded-2xl p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-[720px]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">Edit News</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="edit-news-form"
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!news) return;

              const fd = new FormData(e.currentTarget);
              const title = getFDString(fd, "title").trim();
              const newsDate = getFDString(fd, "news_date").trim();
              const location = getFDString(fd, "location").trim();
              const category = getFDString(fd, "category").trim();
              const startupIdStr = getFDString(fd, "startup_id").trim();
              const descriptionInput = getFDString(fd, "description").trim();
              const imageUrl = getFDString(fd, "image_url").trim();

              const body: UpdateNewsBody = {} as UpdateNewsBody;

              if (title && title !== (news.title ?? "")) body.title = title;
              if (newsDate && newsDate !== (news.newsData ?? ""))
                body.news_date = newsDate;
              if (location && location !== (news.location ?? ""))
                body.location = location;
              if (category && category !== (news.category ?? ""))
                body.category = category;
              if (startupIdStr.length > 0) {
                const startupId = Number(startupIdStr);
                if (!Number.isNaN(startupId) && startupId !== news.startupId) {
                  body.startup_id = startupId;
                }
              }
              if (
                descriptionInput &&
                descriptionInput !== (news.description ?? "")
              )
                body.description = descriptionInput;
              if (imageUrl && imageUrl !== (news.imageUrl ?? ""))
                body.image_url = imageUrl;

              if (Object.keys(body).length === 0) return; // rien à envoyer
              await onSubmit(news.id, body);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={news?.title ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="news_date">News date</Label>
                <Input
                  id="news_date"
                  name="news_date"
                  type="date"
                  placeholder={news?.newsData ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder={news?.location ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder={news?.category ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startup_id">Startup ID</Label>
                <Input
                  id="startup_id"
                  name="startup_id"
                  type="number"
                  inputMode="numeric"
                  placeholder={
                    typeof news?.startupId === "number"
                      ? String(news.startupId)
                      : ""
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder={news?.imageUrl ?? "https://..."}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={news?.description ?? ""}
                className="min-h-[110px] resize-none"
              />
            </div>
          </form>
        </div>

        <DialogFooter className="gap-2 border-t px-4 py-3 sm:px-6 sm:py-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="edit-news-form"
            className="w-full sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
