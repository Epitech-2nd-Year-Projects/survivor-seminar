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

import type { CreateNewsBody } from "@/lib/api/services/news/client";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (body: CreateNewsBody) => void | Promise<void>;
  description?: string;
};

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export default function CreateDialogNews({
  open,
  onOpenChange,
  onSubmit,
  description = "Create a news item",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[min(100vw-1rem,720px)] flex-col overflow-hidden rounded-2xl p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-[720px]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">
            Create News
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="create-news-form"
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();

              const fd = new FormData(e.currentTarget);
              const title = getFDString(fd, "title").trim();
              const newsDate = getFDString(fd, "news_date").trim();
              const location = getFDString(fd, "location").trim();
              const category = getFDString(fd, "category").trim();
              const startupIdStr = getFDString(fd, "startup_id").trim();
              const descriptionInput = getFDString(fd, "description").trim();
              const imageUrl = getFDString(fd, "image_url").trim();

              if (!title || !descriptionInput) return;

              const body: CreateNewsBody = {
                title,
                description: descriptionInput,
              } as CreateNewsBody;

              if (newsDate) body.news_date = newsDate;
              if (location) body.location = location;
              if (category) body.category = category;
              if (startupIdStr.length > 0) {
                const startupId = Number(startupIdStr);
                if (!Number.isNaN(startupId)) {
                  body.startup_id = startupId;
                }
              }
              if (imageUrl) body.image_url = imageUrl;

              await onSubmit(body);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="news_date">News date</Label>
                <Input id="news_date" name="news_date" type="date" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startup_id">Startup ID</Label>
                <Input
                  id="startup_id"
                  name="startup_id"
                  type="number"
                  inputMode="numeric"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" type="url" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                className="min-h-[110px] resize-none"
                required
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
            form="create-news-form"
            className="w-full sm:w-auto"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
