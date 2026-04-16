"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import AddScheduleModal from "./AddScheduleModal";

export default function AddScheduleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[20px] bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
      >
        <IconPlus size={16} />
        일정 추가
      </button>
      <AddScheduleModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
