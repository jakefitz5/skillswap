import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "teacher") {
    redirect("/dashboard/teacher");
  } else {
    redirect("/dashboard/student");
  }
}
