"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { PropsWithChildren } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

type Props = {
  currentTab: number;
};

export function SettingsTab({ currentTab }: Props) {
  return (
    <section className="flex-1 p-4">
      {/* General */}
      {currentTab === 1 && <Tab1 />}
      {/* Appearance */}
      {currentTab === 2 && <Tab2 />}
      {/* Account */}
      {currentTab === 3 && <Tab3 />}
    </section>
  );
}

function Tab1() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <SettingsTabContent>
      <SettingsRow>
        <p>Theme</p>
        <Select
          defaultValue={resolvedTheme}
          value={resolvedTheme}
          onValueChange={(value) => setTheme(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
    </SettingsTabContent>
  );
}

function Tab2() {
  const { signOut } = useAuthActions();

  return (
    <SettingsTabContent>
      <SettingsRow>
        <p>Sign out</p>
        <Button variant={"destructive"} onClick={signOut}>
          Sign out
        </Button>
      </SettingsRow>
    </SettingsTabContent>
  );
}

function Tab3() {
  return <div>Tab 1</div>;
}

function SettingsTabContent({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function SettingsRow({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "flex items-center border-b pb-4 justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
