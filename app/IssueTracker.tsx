"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { addIssue, updateStatus, deleteIssue, addIssuesBulk, type NewIssue } from "./actions";

const 유형목록 = ["가격변동", "납기지연", "품질문제", "계약변경", "기타"];
const 상태목록 = ["신규", "진행중", "완료"];
const 구분목록 = ["수입", "수출"];

export type Issue = {
  id: number;
  거래처: string;
  입고차수: string | null;
  구분: string;
  유형: string;
  제품군: string | null;
  불량증상: string | null;
  보상방안: string | null;
  처리결과: string | null;
  상태: string;
  발생일: string | null;
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

const 구분색: Record<string, { bg: string; color: string; border: string }> = {
  "수입": { bg: "#E6F1FB", color: "#0C447C", border: "#2f6fed" },
  "수출": { bg: "#FDEEDC", color: "#8a4b06", border: "#e08a3c" },
};

const inputStyle = { padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" as const };
const selectStyle = { padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" };

export default function IssueTracker({ user, issues }: Props) {
  const [isPending, startTransition] = useTransition();

  // 등록 폼
  const [폼열림, set폼열림] = useState(true);
  const [거래처, set거래처] = useState("");
  const [입고차수, set입고차수] = useState("");
  const [구분, set구분] = useState(구분목록[0]);
  const [제품군, set제품군] = useState("");
  const [불량증상, set불량증상] = useState("");
  const [보상방안, set보상방안] = useState("");
  const [처리결과, set처리결과] = useState("");
  const [유형, set유형] = useState(유형목록[0]);
  const [발생일, set발생일] = useState(() => new Date().toISOString().slice(0, 10));
  const [등록오류, set등록오류] = useState("");
  const [업로드메시지, set업로드메시지] = useState("");
  const [업로드오류, set업로드오류] = useState("");

  // 필터·검색·정렬
  const [구분필터, set구분필터] = useState("전체");
  const [상태필터, set상태필터] = useState("전체");
  const [업체필터, set업체필터] = useState("전체");
  const [유형필터, set유형필터] = useState("전체");
  const [정렬, set정렬] = useState("최신순");
  const [검색어, set검색어] = useState("");

  const 폼초기화 = () => {
    set거래처("");
    set입고차수("");
    set구분(구분목록[0]);
    set제품군("");
    set불량증상("");
    set보상방안("");
    set처리결과("");
    set유형(유형목록[0]);
    set발생일(new Date().toISOString().slice(0, 10));
  };

  const 이슈추가 = () => {
    if (!거래처.trim() || !불량증상.trim()) return set등록오류("거래처와 불량증상을 입력해주세요.");
    set등록오류("");
    startTransition(async () => {
      try {
        await addIssue({ 거래처, 입고차수, 구분, 유형, 제품군, 불량증상, 보상방안, 처리결과, 발생일 });
        폼초기화();
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

  const 이슈삭제 = (id: number) => {
    if (!window.confirm("이 이슈를 삭제할까요? 되돌릴 수 없습니다.")) return;
    startTransition(() => {
      deleteIssue(id);
    });
  };

  const 셀날짜문자열 = (v: unknown): string => {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === "string") return v.trim();
    return "";
  };

  const 엑셀업로드 = (file: File) => {
    set업로드메시지("");
    set업로드오류("");
    startTransition(async () => {
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array", cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        const 이슈들: NewIssue[] = rows.map((row) => {
          const 유형값 = String(row["유형"] ?? "").trim();
          const 구분값 = String(row["구분"] ?? "").trim();
          return {
            거래처: String(row["거래처"] ?? "").trim(),
            입고차수: String(row["입고차수"] ?? "").trim(),
            구분: 구분목록.includes(구분값) ? 구분값 : 구분목록[0],
            유형: 유형목록.includes(유형값) ? 유형값 : 유형목록[유형목록.length - 1],
            제품군: String(row["제품군"] ?? "").trim(),
            불량증상: String(row["불량증상"] ?? "").trim(),
            보상방안: String(row["보상방안"] ?? "").trim(),
            처리결과: String(row["처리결과"] ?? "").trim(),
            발생일: 셀날짜문자열(row["발생일"]),
          };
        });

        const 등록수 = await addIssuesBulk(이슈들);
        set업로드메시지(`${등록수}건 등록완료`);
      } catch (e) {
        set업로드오류(e instanceof Error ? e.message : "엑셀 업로드에 실패했어요.");
      }
    });
  };

  const 엑셀다운로드 = () => {
    const 데이터 = issues.map((i) => ({
      거래처: i.거래처,
      입고차수: i.입고차수 || "",
      구분: i.구분,
      유형: i.유형,
      제품군: i.제품군 || "",
      불량증상: i.불량증상 || "",
      보상방안: i.보상방안 || "",
      처리결과: i.처리결과 || "",
      상태: i.상태,
      발생일: i.발생일 || "",
      등록일: i.created_at,
    }));
    const ws = XLSX.utils.json_to_sheet(데이터);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "이슈목록");
    XLSX.writeFile(wb, "이슈목록.xlsx");
  };

  const 초기화 = () => {
    set구분필터("전체");
    set상태필터("전체");
    set업체필터("전체");
    set유형필터("전체");
    set정렬("최신순");
    set검색어("");
  };

  const 업체목록 = Array.from(new Set(issues.map((i) => i.거래처))).sort();

  const 검색어소문자 = 검색어.trim().toLowerCase();
  const 필터된목록 = issues
    .filter((i) => 구분필터 === "전체" || i.구분 === 구분필터)
    .filter((i) => 상태필터 === "전체" || i.상태 === 상태필터)
    .filter((i) => 업체필터 === "전체" || i.거래처 === 업체필터)
    .filter((i) => 유형필터 === "전체" || i.유형 === 유형필터)
    .filter((i) =>
      !검색어소문자 ||
      i.거래처.toLowerCase().includes(검색어소문자) ||
      (i.제품군 || "").toLowerCase().includes(검색어소문자) ||
      (i.불량증상 || "").toLowerCase().includes(검색어소문자)
    )
    .sort((a, b) => (정렬 === "오래된순" ? a.id - b.id : b.id - a.id));

  const 수입수 = issues.filter((i) => i.구분 === "수입").length;
  const 수출수 = issues.filter((i) => i.구분 === "수출").length;
  const 완료수 = issues.filter((i) => i.상태 === "완료").length;
  const 진행중수 = issues.filter((i) => i.상태 === "진행중").length;

  const 요약카드 = [
    { key: "전체", label: "전체", value: issues.length, color: "#333", border: "#ddd",
      active: 구분필터 === "전체" && 상태필터 === "전체",
      onClick: () => { set구분필터("전체"); set상태필터("전체"); } },
    { key: "수입", label: "수입", value: 수입수, color: "#0C447C", border: "#2f6fed",
      active: 구분필터 === "수입",
      onClick: () => set구분필터(구분필터 === "수입" ? "전체" : "수입") },
    { key: "수출", label: "수출", value: 수출수, color: "#8a4b06", border: "#e08a3c",
      active: 구분필터 === "수출",
      onClick: () => set구분필터(구분필터 === "수출" ? "전체" : "수출") },
    { key: "완료", label: "완료", value: 완료수, color: "#2d7a2d", border: "#4caf50",
      active: 상태필터 === "완료",
      onClick: () => set상태필터(상태필터 === "완료" ? "전체" : "완료") },
    { key: "진행중", label: "진행중", value: 진행중수, color: "#b87000", border: "#e0a83c",
      active: 상태필터 === "진행중",
      onClick: () => set상태필터(상태필터 === "진행중" ? "전체" : "진행중") },
  ];

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "960px", margin: "0 auto" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {요약카드.map(({ key, label, value, color, border, active, onClick }) => (
          <button key={key} onClick={onClick}
            style={{ background: active ? "#f5f9ff" : "white", borderRadius: "8px", padding: "0.75rem",
              textAlign: "center", border: `2px solid ${active ? border : "#eee"}`, cursor: "pointer" }}>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: "22px", fontWeight: "bold", margin: 0, color }}>{value}</p>
          </button>
        ))}
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "13px", color: "#666" }}>필터:</span>
        <select value={구분필터} onChange={(e) => set구분필터(e.target.value)} style={selectStyle}>
          <option value="전체">수입/수출 전체</option>
          {구분목록.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={상태필터} onChange={(e) => set상태필터(e.target.value)} style={selectStyle}>
          <option value="전체">진행상태 전체</option>
          {상태목록.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={업체필터} onChange={(e) => set업체필터(e.target.value)} style={selectStyle}>
          <option value="전체">업체명 전체</option>
          {업체목록.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select value={유형필터} onChange={(e) => set유형필터(e.target.value)} style={selectStyle}>
          <option value="전체">이슈유형 전체</option>
          {유형목록.map((u) => <option key={u}>{u}</option>)}
        </select>
        <span style={{ fontSize: "13px", color: "#666", marginLeft: "0.5rem" }}>정렬:</span>
        <select value={정렬} onChange={(e) => set정렬(e.target.value)} style={selectStyle}>
          <option value="최신순">날짜순</option>
          <option value="오래된순">오래된순</option>
        </select>
        <button onClick={초기화}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "4px", border: "1px solid #ccc", background: "white", color: "#333", cursor: "pointer", fontSize: "13px" }}>
          초기화
        </button>
      </div>

      {/* 검색 */}
      <input placeholder="거래처, 제품군, 불량증상으로 검색" value={검색어} onChange={(e) => set검색어(e.target.value)}
        style={{ ...inputStyle, marginBottom: "1.5rem" }} />

      {/* 이슈 등록 */}
      <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <button onClick={() => set폼열림((v) => !v)}
          style={{ width: "100%", textAlign: "left", padding: "0.5rem", background: "white", border: "1px solid #333",
            borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
          {폼열림 ? "▼" : "▶"} + 새 이슈 등록
        </button>

        {폼열림 && (
          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input placeholder="거래처명" value={거래처} onChange={(e) => set거래처(e.target.value)} style={inputStyle} />
              <input placeholder="입고차수" value={입고차수} onChange={(e) => set입고차수(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {구분목록.map((g) => (
                <button key={g} type="button" onClick={() => set구분(g)}
                  style={{ padding: "0.6rem", borderRadius: "4px", border: 구분 === g ? "none" : "1px solid #ccc",
                    background: 구분 === g ? "#0070f3" : "white", color: 구분 === g ? "white" : "#333",
                    cursor: "pointer", fontWeight: 600 }}>
                  {g}
                </button>
              ))}
            </div>

            <input placeholder="제품군" value={제품군} onChange={(e) => set제품군(e.target.value)}
              style={{ ...inputStyle, marginBottom: "0.5rem" }} />
            <textarea placeholder="불량증상" value={불량증상} onChange={(e) => set불량증상(e.target.value)} rows={3}
              style={{ ...inputStyle, marginBottom: "0.5rem" }} />
            <textarea placeholder="보상방안/요청사항" value={보상방안} onChange={(e) => set보상방안(e.target.value)} rows={2}
              style={{ ...inputStyle, marginBottom: "0.5rem" }} />
            <textarea placeholder="처리결과" value={처리결과} onChange={(e) => set처리결과(e.target.value)} rows={2}
              style={{ ...inputStyle, marginBottom: "0.5rem" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <select value={유형} onChange={(e) => set유형(e.target.value)} style={selectStyle}>
                {유형목록.map((u) => <option key={u}>{u}</option>)}
              </select>
              <input type="date" value={발생일} onChange={(e) => set발생일(e.target.value)} style={inputStyle} />
            </div>

            {등록오류 && <p style={{ color: "red", fontSize: "12px", marginBottom: "0.5rem" }}>{등록오류}</p>}
            <button onClick={이슈추가} disabled={isPending}
              style={{ width: "100%", padding: "0.6rem 1.5rem", background: "#0070f3", color: "white", border: "none",
                borderRadius: "4px", cursor: isPending ? "default" : "pointer", opacity: isPending ? 0.7 : 1, fontWeight: 600 }}>
              등록
            </button>
          </div>
        )}
      </div>

      {/* 엑셀 업로드/다운로드 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <label style={{ padding: "6px 16px", background: "#0f6e4f", color: "white", border: "none", borderRadius: "4px",
          cursor: isPending ? "default" : "pointer", fontSize: "13px", opacity: isPending ? 0.7 : 1 }}>
          📤 엑셀 업로드
          <input type="file" accept=".xlsx,.xls" disabled={isPending} style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) 엑셀업로드(file);
              e.target.value = "";
            }} />
        </label>
        <button onClick={엑셀다운로드}
          style={{ padding: "6px 16px", background: "#217346", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>
          📥 엑셀 다운로드
        </button>
      </div>
      {업로드메시지 && <p style={{ color: "#0f6e4f", fontSize: "13px", marginBottom: "1rem", textAlign: "right" }}>{업로드메시지}</p>}
      {업로드오류 && <p style={{ color: "red", fontSize: "13px", marginBottom: "1rem", textAlign: "right" }}>{업로드오류}</p>}

      {/* 이슈 목록 */}
      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>이슈 목록 ({필터된목록.length}건)</h2>
      {필터된목록.length === 0 && <p style={{ color: "#999" }}>이슈가 없어요.</p>}
      {필터된목록.map((이슈) => (
        <div key={이슈.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <strong>{이슈.거래처}</strong>
              {이슈.입고차수 && <span style={{ fontSize: "12px", color: "#888" }}>{이슈.입고차수}차</span>}
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>{이슈.발생일 || "-"} 발생 · {이슈.created_at} 등록</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 구분색[이슈.구분]?.bg, color: 구분색[이슈.구분]?.color }}>{이슈.구분}</span>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 유형색[이슈.유형]?.bg, color: 유형색[이슈.유형]?.color }}>{이슈.유형}</span>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 상태색[이슈.상태]?.bg, color: 상태색[이슈.상태]?.color }}>{이슈.상태}</span>
            {이슈.제품군 && <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px", background: "#f1f1f1", color: "#555" }}>{이슈.제품군}</span>}
          </div>
          <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#333" }}><strong>불량증상</strong> {이슈.불량증상}</p>
          {이슈.보상방안 && <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#555" }}><strong>보상방안/요청사항</strong> {이슈.보상방안}</p>}
          {이슈.처리결과 && <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#555" }}><strong>처리결과</strong> {이슈.처리결과}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <select value={이슈.상태} onChange={(e) => 상태변경(이슈.id, e.target.value)} disabled={isPending}
              style={{ padding: "0.25rem", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }}>
              {상태목록.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => 이슈삭제(이슈.id)} disabled={isPending}
              style={{ padding: "0.25rem 0.75rem", background: "white", color: "#c0392b", border: "1px solid #e0b4b4", borderRadius: "4px", cursor: isPending ? "default" : "pointer", fontSize: "13px" }}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}
