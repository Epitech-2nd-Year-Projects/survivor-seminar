"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/api/contracts/users";

type Role = "admin" | "manager" | "member" | "viewer";

const isRole = (v: string): v is Role =>
  v === "admin" || v === "manager" || v === "member" || v === "viewer";

type SubmitPayload = {
  id: number;
  name: string;
  email: string;
  role: Role;
  imageFile: File | null;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: User | null;
  onSubmit: (values: SubmitPayload) => void | Promise<void>;
  description?: string;
};

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export default function EditDialogUser({
  open,
  onOpenChange,
  user,
  onSubmit,
  description = "Edit the user's data",
}: Props) {
  const [role, setRole] = React.useState<Role | undefined>(undefined);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    setRole(undefined);
    setSelectedFile(null);
    setFilePreviewUrl(undefined);
  }, [user?.id]);

  React.useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.currentTarget.files?.[0] ?? null;

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(undefined);
    }

    if (file) {
      if (!file.type.startsWith("image/")) {
        e.currentTarget.value = "";
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
    }
  };

  const previewUrl = filePreviewUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!user) return;

            const fd = new FormData(e.currentTarget);
            const nameInput = getFDString(fd, "name").trim();
            const emailInput = getFDString(fd, "email").trim();

            const userRoleSafe: Role = isRole(user.role) ? user.role : "member";
            const finalRole: Role = role ?? userRoleSafe;

            const finalName = nameInput || user.name;
            const finalEmail = emailInput || user.email;

            const playload: SubmitPayload = {
              id: user.id,
              name: finalName,
              email: finalEmail,
              role: finalRole,
              imageFile: selectedFile,
            };

            void onSubmit(playload);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue=""
              placeholder={user?.name ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue=""
              placeholder={user?.email ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(isRole(v) ? v : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={user?.role ?? "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="manager">manager</SelectItem>
                <SelectItem value="member">member</SelectItem>
                <SelectItem value="viewer">viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label>Profile picture</Label>

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt={user?.name ?? "avatar"} />
                ) : null}
                <AvatarFallback>
                  {(user?.name ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-xs">
                {previewUrl ? "Preview" : "No picture chosen"}
              </span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_file">Upload an image (PNG/JPG/SVG)</Label>
              <Input
                id="image_file"
                name="image_file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <span className="text-muted-foreground text-xs">
                  Selected: {selectedFile.name} (
                  {Math.round(selectedFile.size / 1024)} kB)
                </span>
              ) : null}
            </div>
          </div>

          <DialogFooter className="mt-1 gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
