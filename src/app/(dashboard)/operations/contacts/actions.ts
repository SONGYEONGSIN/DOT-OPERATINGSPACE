"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ContactResult {
  success?: boolean;
  error?: string;
  count?: number;
}

export async function addContact(
  universityName: string,
  category: string,
  department: string,
  role: string,
  personName: string,
  phone: string,
  email: string,
): Promise<ContactResult> {
  if (!universityName.trim() || !personName.trim()) {
    return { error: "대학명과 담당자명을 입력해주세요." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("university_contacts").insert({
    university_name: universityName.trim(),
    category,
    department: department.trim() || null,
    role: role.trim() || null,
    person_name: personName.trim(),
    phone: phone.trim() || null,
    email: email.trim() || null,
  });

  if (error) return { error: "등록에 실패했습니다." };

  revalidatePath("/operations/contacts");
  return { success: true };
}

export async function importContacts(
  contacts: {
    university_name: string;
    category: string;
    department: string;
    role: string;
    person_name: string;
    phone: string;
    email: string;
  }[],
): Promise<ContactResult> {
  if (contacts.length === 0) return { error: "업로드할 데이터가 없습니다." };

  const supabase = createClient();
  const { error } = await supabase.from("university_contacts").insert(contacts);

  if (error) return { error: "업로드에 실패했습니다." };

  revalidatePath("/operations/contacts");
  return { success: true, count: contacts.length };
}

export async function deleteContact(id: number): Promise<ContactResult> {
  const supabase = createClient();
  const { error } = await supabase.from("university_contacts").delete().eq("id", id);

  if (error) return { error: "삭제에 실패했습니다." };

  revalidatePath("/operations/contacts");
  return { success: true };
}
