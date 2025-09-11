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

import type { CreateEventBody } from "@/lib/api/services/events/client";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (body: CreateEventBody) => void | Promise<void>;
  description?: string;
};

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export default function CreateDialogEvent({
  open,
  onOpenChange,
  onSubmit,
  description = "Create a new event",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[min(100vw-1rem,720px)] flex-col overflow-hidden rounded-2xl p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-[720px]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">
            Create Event
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="create-event-form"
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();

              const fd = new FormData(e.currentTarget);
              const name = getFDString(fd, "name").trim();
              const descriptionInput = getFDString(fd, "description").trim();
              const eventType = getFDString(fd, "event_type").trim();
              const location = getFDString(fd, "location").trim();
              const target = getFDString(fd, "target_audience").trim();
              const startDate = getFDString(fd, "start_date").trim();
              const endDate = getFDString(fd, "end_date").trim();
              const capacityStr = getFDString(fd, "capacity").trim();
              const imageUrl = getFDString(fd, "image_url").trim();

              if (!name) return;

              const body: CreateEventBody = {
                name,
              } as CreateEventBody;

              if (descriptionInput) body.description = descriptionInput;
              if (eventType) body.event_type = eventType;
              if (location) body.location = location;
              if (target) body.target_audience = target;
              if (startDate) body.start_date = startDate;
              if (endDate) body.end_date = endDate;
              if (capacityStr.length > 0) {
                const capacity = Number(capacityStr);
                if (!Number.isNaN(capacity)) body.capacity = capacity;
              }
              if (imageUrl) body.image_url = imageUrl;

              await onSubmit(body);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event_type">Event type</Label>
                <Input id="event_type" name="event_type" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target_audience">Target audience</Label>
                <Input id="target_audience" name="target_audience" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input id="start_date" name="start_date" type="date" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End date</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
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
            form="create-event-form"
            className="w-full sm:w-auto"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
