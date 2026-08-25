"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";

export type NewIssue = {
  거래처: string;
  국가: string;
  유형: string;
  내용: string;
  발생일: string;
};

// Next.js 문서(data-security 가이드) 권고: proxy matcher 변경에 안전하도록
// 서버 함수 진입부에서도 인증을 다시 확인한다.
async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user;
}

export async function addIssue(input: NewIssue) {
  await requireSessionUser();
  if (!input.거래처.trim() || !input.내용.trim()) {
    throw new Error("거래처와 내용을 입력해주세요.");
  }
  await run(
    `INSERT INTO issues (거래처, 국가, 유형, 내용, 발생일) VALUES ($1, $2, $3, $4, $5)`,
    [input.거래처, input.국가, input.유형, input.내용, input.발생일 || null]
  );
  revalidatePath("/");
}

export async function updateStatus(id: number, 상태: string) {
  await requireSessionUser();
  await run(`UPDATE issues SET 상태 = $1 WHERE id = $2`, [상태, id]);
  revalidatePath("/");
}

export async function deleteIssue(id: number) {
  await requireSessionUser();
  await run(`DELETE FROM issues WHERE id = $1`, [id]);
  revalidatePath("/");
}
