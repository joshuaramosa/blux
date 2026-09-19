import { createClient } from "@/lib/supabase/server";
import { DeliveryBoard, type AssignedDelivery } from "@/components/delivery/delivery-board";

export const metadata = { title: "Delivery — BLUX" };
export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("delivery_assignments")
    .select(
      `*,
      orders(
        *,
        customer:customers(*),
        address:addresses(*),
        items:order_items(*)
      )`,
    )
    .eq("delivery_user_id", auth.user?.id ?? "")
    .neq("status", "ENTREGADO")
    .order("assigned_at", { ascending: true });

  return <DeliveryBoard initial={(data ?? []) as unknown as AssignedDelivery[]} />;
}
