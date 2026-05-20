"use client";
import { useState } from "react";

const 유형목록 = ["가격변동", "납기지연", "품질문제", "계약변경", "기타"];
const 상태목록 = ["신규", "진행중", "완료"];

type Issue = {
  id: number;
  거래처: string;
  국가: string;
  유형: string;
  내용: string;
  상태: string;
  날짜: string;
};

const 초기데이터: Issue[] = [
  { id:1, 거래처:"ABC Trading Co.", 국가:"미국", 유형:"가격변동", 내용:"원자재 가격 15% 인상 통보, 계약 재협상 필요", 상태:"진행중", 날짜:"2025.05.15" },
  { id:2, 거래처:"Tanaka Industries", 국가:"일본", 유형:"납기지연", 내용:"반도체 부품 수급 문제로 납기 3주 지연 예정", 상태:"신규", 날짜:"2025.05.17" },
  { id:3, 거래처:"Euro Parts GmbH", 국가:"독일", 유형:"품질문제", 내용:"입고된 부품 중 5% 불량 발견, 클레임 접수 완료", 상태:"진행중", 날짜:"2025.05.10" },
  { id:4, 거래처:"Shanghai Trade Ltd.", 국가:"중국", 유형:"계약변경", 내용:"MOQ 조건 변경 요청, 최소주문수량 500→1000개", 상태:"신규", 날짜:"2025.05.18" },
  { id:5, 거래처:"Global Supply UK", 국가:"영국", 유형:"가격변동", 내용:"환율 변동으로 인한 단가 재조정 협의 중", 상태:"완료", 날짜:"2025.05.08" },
  { id:6, 거래처:"Kim & Associates", 국가:"한국", 유형:"납기지연", 내용:"공장 설비 점검으로 인한 2주 생산 중단", 상태:"완료", 날짜:"2025.05.05" },
  { id:7, 거래처:"Mex Export S.A.", 국가:"멕시코", 유형:"기타", 내용:"통관 서류 오류로 인한 통관 지연 발생", 상태:"진행중", 날짜:"2025.05.16" },
  { id:8, 거래처:"Indo Parts Corp.", 국가:"인도", 유형:"품질문제", 내용:"스펙 미달 제품 납품, 전량 반품 처리 예정", 상태:"진행중", 날짜:"2025.05.14" },
  { id:9, 거래처:"Paris Luxe SARL", 국가:"프랑스", 유형:"계약변경", 내용:"독점 공급 계약 조건 변경 요청 수신", 상태:"완료", 날짜:"2025.05.03" },
  { id:10, 거래처:"Sydney Trade Pty.", 국가:"호주", 유형:"가격변동", 내용:"물류비 급등으로 인한 가격 인상 협의 요청", 상태:"진행중", 날짜:"2025.05.19" },
];

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

export default function Home() {
  const [이슈목록, set이슈목록] = useState<Issue[]>(초기데이터);
  const [거래처, set거래처] = useState("");
  const [국가, set국가] = useState("");
  const [유형, set유형] = useState(유형목록[0]);
  const [내용, set내용] = useState("");
  const [필터, set필터] = useState("전체");

  const 이슈추가 = () => {
    if (!거래처 || !내용) return alert("거래처와 내용을 입력해주세요.");
    const 새이슈: Issue = {
      id: Date.now(),
      거래처,
      국가,
      유형,
      내용,
      상태: "신규",
      날짜: new Date().toLocaleDateString("ko-KR"),
    };
    set이슈목록([새이슈, ...이슈목록]);
    set거래처("");
    set국가("");
    set내용("");
  };

  const 상태변경 = (id: number, 새상태: string) => {
    set이슈목록(이슈목록.map((i) => (i.id === id ? { ...i, 상태: 새상태 } : i)));
  };

  const 필터된목록 = 필터 === "전체" ? 이슈목록 : 이슈목록.filter(i => i.유형 === 필터 || i.상태 === 필터);

  const 신규수 = 이슈목록.filter(i => i.상태 === "신규").length;
  const 진행수 = 이슈목록.filter(i => i.상태 === "진행중").length;
  const 완료수 = 이슈목록.filter(i => i.상태 === "완료").length;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "860px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>🌐 해외 거래처 이슈 트래커</h1>

      {/* 요약 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "전체 이슈", value: 이슈목록.length, color: "#333" },
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
        <button onClick={이슈추가}
          style={{ padding: "0.5rem 1.5rem", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          등록
        </button>
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["전체", ...유형목록, ...상태목록].map((f) => (
          <button key={f} onClick={() => set필터(f)}
            style={{ padding: "4px 12px", borderRadius: "20px", border: "1px solid #ccc",
              background: 필터 === f ? "#0070f3" : "white", color: 필터 === f ? "white" : "#333", cursor: "pointer", fontSize: "13px" }}>
            {f}
          </button>
        ))}
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
            <span style={{ fontSize: "12px", color: "#999" }}>{이슈.날짜}</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 유형색[이슈.유형]?.bg, color: 유형색[이슈.유형]?.color }}>{이슈.유형}</span>
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
              background: 상태색[이슈.상태]?.bg, color: 상태색[이슈.상태]?.color }}>{이슈.상태}</span>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#555" }}>{이슈.내용}</p>
          <select value={이슈.상태} onChange={(e) => 상태변경(이슈.id, e.target.value)}
            style={{ padding: "0.25rem", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }}>
            {상태목록.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </main>
  );
}
