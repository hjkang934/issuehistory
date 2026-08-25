import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { q } from "@/lib/db";
import IssueTracker, { type Issue } from "./IssueTracker";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  const issues = await q<Issue>("SELECT * FROM issues ORDER BY id DESC");

  return <IssueTracker user={user} issues={issues} />;
}
