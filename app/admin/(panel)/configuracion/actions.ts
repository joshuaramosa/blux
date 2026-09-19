"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateBusinessSettings(formData: FormData) {
  const supabase = await createClient();

  const business_name = (formData.get("business_name") as string)?.trim() || "BLUX Sabor de Casa";
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const yape_number = (formData.get("yape_number") as string)?.trim() || null;
  const yape_holder = (formData.get("yape_holder") as string)?.trim() || null;
  const delivery_fee = parseFloat(formData.get("delivery_fee") as string) || 0;
  const open_time = (formData.get("open_time") as string)?.trim() || "17:30";
  const close_time = (formData.get("close_time") as string)?.trim() || "22:00";
  const is_open = formData.get("is_open") === "true";
  const logo_url = (formData.get("logo_url") as string)?.trim() || null;
  const qr_url = (formData.get("qr_url") as string)?.trim() || null;

  const { error } = await supabase
    .from("business_settings")
    .update({
      business_name,
      whatsapp,
      yape_number,
      yape_holder,
      delivery_fee,
      open_time,
      close_time,
      is_open,
      logo_url,
      qr_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/carta");
  revalidatePath("/checkout");
  return { success: true };
}

export async function uploadBusinessAsset(formData: FormData) {
  const file = formData.get("file") as File;
  const prefix = (formData.get("prefix") as string) || "asset";

  if (!file || file.size === 0) {
    return { error: "No se seleccionó ningún archivo." };
  }

  const adminClient = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${prefix}_${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await adminClient.storage
    .from("business")
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) {
    return { error: error.message };
  }

  const { data: publicUrlData } = adminClient.storage
    .from("business")
    .getPublicUrl(fileName);

  return { url: publicUrlData.publicUrl };
}
