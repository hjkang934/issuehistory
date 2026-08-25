"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";

export type NewIssue = {
  거래처: string;
  입고차수: string;
  구분: string;
  유형: string;
  제품군: string;
  불량증상: string;
  보상방안: string;
  처리결과: string;
  발생일: string;
};

// Next.js 문서(data-security 가이드) 권고: proxy matcher 변경에 안전하도록
// 서버 함수 진입부에서도 인증을 다시 확인한다.
async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user;
}

function 유효성검사(input: NewIssue) {
  return input.거래처.trim() !== "" && input.불량증상.trim() !== "";
}

export async function addIssue(input: NewIssue) {
  await requireSessionUser();
  if (!유효성검사(input)) {
    throw new Error("거래처와 불량증상을 입력해주세요.");
  }
  await run(
    `INSERT INTO issues (거래처, 입고차수, 구분, 유형, 제품군, 불량증상, 보상방안, 처리결과, 발생일)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [input.거래처, input.입고차수 || null, input.구분, input.유형, input.제품군 || null,
     input.불량증상, input.보상방안 || null, input.처리결과 || null, input.발생일 || null]
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

export async function addIssuesBulk(items: NewIssue[]) {
  await requireSessionUser();
  const valid = items.filter(유효성검사);
  if (valid.length === 0) {
    throw new Error("등록할 수 있는 행이 없어요. (거래처·불량증상은 필수)");
  }
  for (const item of valid) {
    await run(
      `INSERT INTO issues (거래처, 입고차수, 구분, 유형, 제품군, 불량증상, 보상방안, 처리결과, 발생일)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [item.거래처, item.입고차수 || null, item.구분, item.유형, item.제품군 || null,
       item.불량증상, item.보상방안 || null, item.처리결과 || null, item.발생일 || null]
    );
  }
  revalidatePath("/");
  return valid.length;
}
