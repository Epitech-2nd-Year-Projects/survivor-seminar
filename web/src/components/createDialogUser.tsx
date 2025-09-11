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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { CreateUserBody } from "@/lib/api/services/users/client";
import { UserRole } from "@/lib/api/contracts/users";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (body: CreateUserBody) => void | Promise<void>;
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

const ALL_USER_ROLES = Object.values(UserRole) as readonly UserRole[];
const isUserRole = (v: string): v is UserRole =>
  (ALL_USER_ROLES as readonly string[]).includes(v);

export default function CreateDialogUser({
  open,
  onOpenChange,
  onSubmit,
  description = "Create a new user",
}: Props) {
  const [role, setRole] = React.useState<UserRole | undefined>(undefined);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = React.useState<string>();
  const [pwError, setPwError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setRole(undefined);
      setSelectedFile(null);
      setPwError(null);
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-6"
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault();

            const fd = new FormData(e.currentTarget);
            const nameInput = getFDString(fd, "name").trim();
            const emailInput = getFDString(fd, "email").trim();
            const pwd = getFDString(fd, "password");
            const pwdConfirm = getFDString(fd, "password_confirm");

            if (!nameInput || !emailInput || !pwd || !pwdConfirm) {
              setPwError("Name, email and password are required.");
              return;
            }
            if (pwd !== pwdConfirm) {
              setPwError("Passwords do not match.");
              return;
            }
            if (!role) {
              setPwError("Please select a role.");
              return;
            }
            setPwError(null);

            const body: CreateUserBody = {
              name: nameInput,
              email: emailInput,
              password: pwd,
              role,
            } as CreateUserBody;

            if (selectedFile) {
              const base64 = await fileToBase64(selectedFile);
              body.image = base64;
            }

            await onSubmit(body);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(isUserRole(v) ? v : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ALL_USER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password_confirm">Confirm password</Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              required
            />
            {pwError ? (
              <p className="text-destructive text-sm">{pwError}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label>Profile picture</Label>

            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="avatar" />
                ) : null}
                <AvatarFallback>U</AvatarFallback>
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
