// components/EditDialogUser.tsx
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
import type { UpdateUserBody } from "@/lib/api/services/users/client";

type Role = "admin" | "manager" | "member" | "viewer";
const isRole = (v: string): v is Role =>
  v === "admin" || v === "manager" || v === "member" || v === "viewer";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: User | null;
  onSubmit: (id: number, body: UpdateUserBody) => void | Promise<void>;
  description?: string;
};

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res !== "string") {
        reject(new Error("Unexpected FileReader result (not a string)."));
        return;
      }
      const commaIdx = res.indexOf(",");
      resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(file);
  });

export default function EditDialogUser({
  open,
  onOpenChange,
  user,
  onSubmit,
  description = "Edit the user's data",
}: Props) {
  const [role, setRole] = React.useState<Role | undefined>(undefined);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = React.useState<string>();
  const [pwError, setPwError] = React.useState<string | null>(null);

  // Reset quand on change d'utilisateur
  React.useEffect(() => {
    setRole(undefined);
    setSelectedFile(null);
    setFilePreviewUrl(undefined);
    setPwError(null);
  }, [user?.id]);

  // Cleanup URL de preview
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
          onSubmit={async (e) => {
            e.preventDefault();
            if (!user) return;

            const fd = new FormData(e.currentTarget);
            const nameInput = getFDString(fd, "name").trim();
            const emailInput = getFDString(fd, "email").trim();
            const pwd = getFDString(fd, "password");
            const pwdConfirm = getFDString(fd, "password_confirm");

            // Validation password (si saisi)
            if (pwd || pwdConfirm) {
              if (pwd.length < 6) {
                setPwError("Password must be at least 6 characters.");
                return;
              }
              if (pwd !== pwdConfirm) {
                setPwError("Passwords do not match.");
                return;
              }
            } else {
              setPwError(null);
            }

            const finalRole: Role =
              role ?? (isRole(user.role) ? user.role : "member");

            // On n'envoie que les champs modifiés
            const body: UpdateUserBody = {};
            if (nameInput && nameInput !== user.name) body.name = nameInput;
            if (emailInput && emailInput !== user.email)
              body.email = emailInput;
            if (finalRole !== user.role) body.role = finalRole;
            if (pwd) body.password = pwd;

            if (selectedFile) {
              const base64 = await fileToBase64(selectedFile);
              body.image = base64; // adapte si l'API veut le base64 "pur"
            }

            await onSubmit(user.id, body);
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

          {/* Password (optionnel) */}
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password_confirm">Confirm new password</Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
            />
            {pwError ? (
              <p className="text-destructive text-sm">{pwError}</p>
            ) : null}
          </div>

          {/* Avatar upload */}
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
