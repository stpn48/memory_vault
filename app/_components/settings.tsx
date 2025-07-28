"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CircleUserRound, Cog } from "lucide-react";
import { useState } from "react";
import { SettingsTab } from "./settings-tab";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function Settings({ open, setOpen }: Props) {
  const [currentTab, setCurrentTab] = useState(1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[65%] gap-0 p-0 flex flex-col w-full md:w-[600px] !max-w-screen">
        <DialogHeader className="p-4">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <section className="flex md:flex-row flex-col flex-1 border-t">
          <section className="md:w-[180px] gap-1 w-full border-b md:border-r md:h-full flex md:flex-col p-2">
            <SettingsTabButton
              tabNumber={1}
              text="General"
              icon={<Cog className="size-4" />}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
            <SettingsTabButton
              text="Account"
              icon={<CircleUserRound className="size-4" />}
              tabNumber={2}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          </section>

          <SettingsTab currentTab={currentTab} />
        </section>
      </DialogContent>
    </Dialog>
  );
}

function SettingsTabButton({
  tabNumber,
  setCurrentTab,
  currentTab,
  icon,
  text,
}: {
  tabNumber: number;
  currentTab: number;
  setCurrentTab: (tabNumber: number) => void;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <button
      className={cn(
        "hover:bg-secondary active:bg-foreground/10 flex items-center gap-2 transition-all rounded-sm cursor-pointer p-2",
        {
          "bg-secondary outline": currentTab === tabNumber,
        },
      )}
      onClick={() => setCurrentTab(tabNumber)}
    >
      {icon}
      {text}
    </button>
  );
}
