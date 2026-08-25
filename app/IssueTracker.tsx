"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { addIssue, updateStatus } from "./actions";

const 유형목록 = ["가격변동", "납기지연", "품질문제", "계약변경", "기타"];
const 상태목록 = ["신규", "진행중", "완료"];

export type Issue = {
  id: number;
  거래처: string;
  국가: string;
  유형: string;
  내용: string;
  상태: string;
  created_at: string;
};

type Props = {
  user: { name: string; email: string };
  issues: Issue[];
};

const 유형색: Record<string, { bg: string; color: string }> = {
  "가격변동": { bg: "#E6F1FB", color: "#0C447C" },
  "납기지연": { bg: "#FAEEDA", color: "#633806" },
  "품질문제": { bg: "#FCEBEB", color: "#791F1F" },
  "계약변경": { bg: "#EEEDFE", color: "#3C3489" },
  "기타": { bg: "#F1EFE8", color: "#444441" },
};

const 상태색: Record<string, { bg: string; color: string }> = {
  "신규": { bg: "#E6F1FB", color: "#0C447C" },
  "진행중": { bg: "#FAEEDA", color: "#633806" },
  "완료": { bg: "#EAF3DE", color: "#27500A" },
};

export default function IssueTracker({ user, issues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [거래처, set거래처] = useState("");
  const [국가, set국가] = useState("");
  const [유형, set유형] = useState(유형목록[0]);
  const [내용, set내용] = useState("");
  const [필터, set필터] = useState("전체");
  const [등록오류, set등록오류] = useState("");

  const 이슈추가 = () => {
    if (!거래처 || !내용) return set등록오류("거래처와 내용을 입력해주세요.");
    set등록오류("");
    startTransition(async () => {
      try {
        await addIssue({ 거래처, 국가, 유형, 내용 });
        set거래처("");
        set국가("");
        set내용("");
      } catch (e) {
        set등록오류(e instanceof Error ? e.message : "등록에 실패했어요.");
      }
    });
  };

  const 상태변경 = (id: number, 새상태: string) => {
    startTransition(() => {
      updateStatus(id, 새상태);
    });
  };

  const 엑셀다운로드 = () => {
    const 데이터 = issues.map((i) => ({
      거래처: i.거래처,
      국가: i.국가,
      유형: i.유형,
      내용: i.내용,
      상태: i.상태,
      날짜: i.created_at,
    }));
    const ws = XLSX.utils.json_to_sheet(데이터);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "이슈목록");
    XLSX.writeFile(wb, "이슈목록.xlsx");
  };

  const 필터된목록 = 필터 === "전체" ? issues : issues.filter((i) => i.유형 === 필터 || i.상태 === 필터);
  const 진행수 = issues.filter((i) => i.상태 === "진행중").length;
  const 완료수 = issues.filter((i) => i.상태 === "완료").length;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🌐 해외 거래처 이슈 트래커</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "14px", color: "#555" }}>👤 {user.name || user.email}</span>
          <a
            href="/auth/logout"
            style={{ padding: "4px 12px", border: "1px solid #ccc", borderRadius: "4px", background: "white", color: "#333", cursor: "pointer", fontSize: "13px", textDecoration: "none" }}
          >
            로그아웃
          </a>
        </div>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "전체 이슈", value: issues.length, color: "#333" },
          { label: "진행중", value: 진행수, color: "#b87000" },
          { label: "완료", value: 완료수, color: "#2d7a2d" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 이슈 등록 */}
      <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>이슈 등록</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input placeholder="거래처명" value={거래처} onChange={(e) => set거래처(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
          <input placeholder="국가" value={국가} onChange={(e) => set국가(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
        </div>
        <select value={유형} onChange={(e) => set유형(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", width: "100%", marginBottom: "0.5rem" }}>
          {유형목록.map((u) => <option key={u}>{u}</option>)}
        </select>
        <textarea placeholder="이슈 내용" value={내용} onChange={(e) => set내용(e.target.value)} rows={3}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", width: "100%", marginBottom: "0.5rem", boxSizing: "border-box" }} />
        {등록오류 && <p style={{ color: "red", fontSize: "12px", marginBottom: "0.5rem" }}>{등록오류}</p>}
        <button onClick={이슈추가} disabled={isPending}
          style={{ padding: "0.5rem 1.5rem", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: isPending ? "default" : "pointer", opacity: isPending ? 0.7 : 1 }}>
          등록
        </button>
      </div>

      {/* 필터 + 엑셀 다운로드 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["전체", ...유형목록, ...상태목록].map((f) => (
            <button key={f} onClick={() => set필터(f)}
              style={{ padding: "4px 12px", borderRadius: "20px", border: "1px solid #ccc",
                background: 필터 === f ? "#0070f3" : "white", color: 필터 === f ? "white" : "#333", cursor: "pointer", fontSize: "13px" }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={엑셀다운로드}
          style={{ padding: "6px 16px", background: "#217346", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>
          📥 엑셀 다운로드
        </button>
      </div>

      {/* 이슈 목록 */}
      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>이슈 목록 ({필터된목록.length}건)</h2>
      {필터된목록.length === 0 && <p style={{ color: "#999" }}>이슈가 없어요.</p>}
      {필터된목록.map((이슈) => (
        <div key={이슈.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <strong>{이슈.거래처}</strong>
              <span style={{ fontSize: "12px", color: "#888" }}>{이슈.국가}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>{이슈.created_at}</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 유형색[이슈.유형]?.bg, color: 유형색[이슈.유형]?.color }}>{이슈.유형}</span>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 상태색[이슈.상태]?.bg, color: 상태색[이슈.상태]?.color }}>{이슈.상태}</span>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#555" }}>{이슈.내용}</p>
          <select value={이슈.상태} onChange={(e) => 상태변경(이슈.id, e.target.value)} disabled={isPending}
            style={{ padding: "0.25rem", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }}>
            {상태목록.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </main>
  );
}
