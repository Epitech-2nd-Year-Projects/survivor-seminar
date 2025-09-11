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

import type { UpdateEventBody } from "@/lib/api/services/events/client";
import type { Event } from "@/lib/api/contracts/events";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  event: Event | null;
  onSubmit: (id: number, body: UpdateEventBody) => void | Promise<void>;
  description?: string;
};

const formatDateFR = (date?: string | Date | null) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
        new Date(date),
      )
    : "—";

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export default function EditDialogEvent({
  open,
  onOpenChange,
  event,
  onSubmit,
  description = "Edit the event data",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[min(100vw-1rem,720px)] flex-col overflow-hidden rounded-2xl p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-[720px]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">Edit Event</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="edit-event-form"
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!event) return;

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

              const body: UpdateEventBody = {} as UpdateEventBody;

              if (name && name !== (event.name ?? "")) body.name = name;
              if (
                descriptionInput &&
                descriptionInput !== (event.description ?? "")
              )
                body.description = descriptionInput;
              if (eventType && eventType !== (event.eventType ?? ""))
                body.event_type = eventType;
              if (location && location !== (event.location ?? ""))
                body.location = location;
              if (target && target !== (event.targetAudience ?? ""))
                body.target_audience = target;
              if (startDate && startDate !== (event.startDate ?? ""))
                body.start_date = startDate;
              if (endDate && endDate !== (event.endDate ?? ""))
                body.end_date = endDate;
              if (capacityStr.length > 0) {
                const capacity = Number(capacityStr);
                if (!Number.isNaN(capacity) && capacity !== event.capacity) {
                  body.capacity = capacity;
                }
              }
              if (imageUrl && imageUrl !== (event.imageUrl ?? ""))
                body.image_url = imageUrl;

              if (Object.keys(body).length === 0) return;
              await onSubmit(event.id, body);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder={event?.name ?? ""} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event_type">Event type</Label>
                <Input
                  id="event_type"
                  name="event_type"
                  placeholder={event?.eventType ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder={event?.location ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target_audience">Target audience</Label>
                <Input
                  id="target_audience"
                  name="target_audience"
                  placeholder={event?.targetAudience ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  placeholder={formatDateFR(event?.startDate) ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  placeholder={formatDateFR(event?.endDate) ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  inputMode="numeric"
                  placeholder={
                    typeof event?.capacity === "number"
                      ? String(event.capacity)
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
                  placeholder={event?.imageUrl ?? "https://..."}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={event?.description ?? ""}
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
            form="edit-event-form"
            className="w-full sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
