"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import React from "react";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegister } from "@/lib/api/services/auth/hooks";

function getString(form: FormData, key: string, fallback = ""): string {
  const v = form.get(key);
  return typeof v === "string" ? v : fallback;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/login";

  const { mutateAsync, isPending } = useRegister();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const form = new FormData(e.currentTarget);
    const email = getString(form, "email");
    const name = getString(form, "name");
    const password = getString(form, "password");
    const role = "investor";

    try {
      await mutateAsync({ email, password, name, role });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setErrorMsg(userMessageFromError(err));
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Hello there</h1>
                <p className="text-muted-foreground text-balance">
                  Register a new account
                </p>
              </div>

              {errorMsg && (
                <p className="text-center text-sm text-red-500">{errorMsg}</p>
              )}

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="survivor@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">Name</Label>
                <Input
                  name="name"
                  id="name"
                  type="name"
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input name="password" id="password" type="password" required />
              </div>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isPending}
              >
                Register
              </Button>
              <div className="text-center text-sm">
                Do you already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/LoginImage.png"
              alt="Image"
              width={1000}
              height={1000}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
