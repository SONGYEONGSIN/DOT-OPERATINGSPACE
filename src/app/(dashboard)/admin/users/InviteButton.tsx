"use client";

import { useState } from "react";
import { IconUserPlus } from "@tabler/icons-react";
import InviteUserModal from "./InviteUserModal";

export default function InviteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-[14px] text-sm font-bold active:scale-95 transition-transform"
      >
        <IconUserPlus size={16} />
        사용자 초대
      </button>
      <InviteUserModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
