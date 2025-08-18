"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="flex h-[65%] w-full !max-w-screen flex-col gap-0 p-0 md:w-[600px]">
        <DialogHeader className="p-4">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <section className="flex flex-1 flex-col border-t md:flex-row">
          <section className="flex w-full gap-1 border-b p-2 md:h-full md:w-[180px] md:flex-col md:border-r">
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
        "hover:bg-secondary active:bg-foreground/10 flex cursor-pointer items-center gap-2 rounded-sm p-2 transition-all",
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
