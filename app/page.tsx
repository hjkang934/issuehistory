"use client";
import { useState } from "react";

const ISSUE_TYPES = ["전체", "가격변동", "납기지연", "품질문제", "계약변경", "기타"];
const STATUS_LIST = ["신규", "진행중", "완료"];
const COMPANIES = ["전체", "CFOFC", "Chaoqian", "Fibercan", "FLC", "Grandway", "GST", "Huamai", "Langreat", "Neofibo", "ORC"];

type Issue = {
  id: number;
  company: string;
  direction: string;
  lotNo: string;
  product: string;
  defect: string;
  compensation: string;
  result: string;
  type: string;
  status: string;
  date: string;
};

const INITIAL_DATA: Issue[] = [
  { id: 1, date: "2025-09-02", company: "CFOFC", direction: "수입", lotNo: "25-4", product: "다심케이블(8C)", defect: "0.9mm 버퍼가 너무 헐렁해 탈피가 비정상적으로 잘 이뤄짐", compensation: "대체품 무상 제공 요청", result: "보상물량 총 1km 무상으로 다음 발주시 제공 예정 (리마인드 필요)", type: "품질문제", status: "완료" },
  { id: 2, date: "2025-01-23", company: "Chaoqian", direction: "수입", lotNo: "24-8", product: "돔함체", defect: "외관, 조립 및 기능 불량 (Burr, 첨부품 누락, 접지바 볼트 헛돔, 가스켓 이탈 등)", compensation: "재작업 및 전수검사비용 청구", result: "해당 비용 차감 후 물품 대금 정산(완료)", type: "품질문제", status: "완료" },
  { id: 3, date: "2025-03-06", company: "Fibercan", direction: "수입", lotNo: "25-1, 3", product: "LC D-Clip", defect: "치수 불량 (결합, 조립성 문제 없음)", compensation: "도면 공차 수정 (개발팀 컨펌 완료)", result: "해당 제품 추후 발주 진행 시 리마인드 예정", type: "품질문제", status: "완료" },
  { id: 4, date: "2025-02-26", company: "Fibercan", direction: "수입", lotNo: "25-4", product: "SOC Body, Boot(투명)", defect: "치수 불량 및 외관 불량 (과성형)", compensation: "내용 전달 및 개선 요청", result: "사출조건 조정하여 개선 완료", type: "품질문제", status: "완료" },
  { id: 5, date: "2025-03-25", company: "Fibercan", direction: "수입", lotNo: "24-10-2", product: "광파워미터(FPM-600, FLM-620)", defect: "포장 불량 (라벨 오염 등)", compensation: "내용 전달 및 개선 요청", result: "추후 발주건부터 개선될 예정 (리마인드 예정)", type: "품질문제", status: "완료" },
  { id: 6, date: "2025-04-02", company: "Fibercan", direction: "수입", lotNo: "24-11-2, 25-5, 6", product: "커넥터 하우징", defect: "사출불량(Burr)", compensation: "내용 전달 및 개선 요청", result: "금형 수리 후 개선 완료", type: "품질문제", status: "완료" },
  { id: 7, date: "2025-04-02", company: "Fibercan", direction: "수입", lotNo: "24-11-2, 25-5, 6", product: "열수축 튜브(노랑)", defect: "색상 상이", compensation: "내용 전달 및 개선 요청", result: "추후 발주건부터 개선될 예정 (리마인드 예정)", type: "품질문제", status: "완료" },
  { id: 8, date: "2025-05-15", company: "Fibercan", direction: "수입", lotNo: "24-10-3, 25-7-1, 8", product: "FAOC Body(57mm)", defect: "FAOC Body 치수 불량 및 미성형", compensation: "개선 요청 및 전량 반품 후 대체품 입고 요청", result: "관련 CEO 별도 보고 완료", type: "품질문제", status: "완료" },
  { id: 9, date: "2025-05-15", company: "Fibercan", direction: "수입", lotNo: "24-10-3, 25-7-1, 8", product: "광파워미터(FPM-600)", defect: "제품 불량(액정 불량) 및 외관 불량(본드흔 등)", compensation: "외관 불량: 개선 요청 / 제품 불량: 대체품 무상 제공 요청", result: "대체품 추후 광파워미터 발주 진행시 같이 입고될 예정 (리마인드 예정)", type: "품질문제", status: "완료" },
  { id: 10, date: "2025-05-15", company: "Fibercan", direction: "수입", lotNo: "24-10-3, 25-7-1, 8", product: "Dust Cap(PC)", defect: "제품 외관 불량(Burr)", compensation: "내용 전달 및 개선 요청", result: "차기 입고분부터 개선된 제품 입고될 예정", type: "품질문제", status: "완료" },
  { id: 11, date: "2025-03-04", company: "FLC", direction: "수입", lotNo: "25-1-2", product: "OJC(LC type)", defect: "조립시 자재 혼입으로 인한 Dust Cap 형상 상이 (일부품목 Dust cap 기존 투명 -> 흰색으로 변경)", compensation: "내용 전달 및 이전과 동일한 제품 사용 요청", result: "개선 요청 완료", type: "품질문제", status: "완료" },
  { id: 12, date: "2025-03-25", company: "FLC", direction: "수입", lotNo: "25-2-1", product: "피그테일(SC/PC)", defect: "포장 불량(지퍼백 및 받침용 판 사이즈 상이)", compensation: "업체 내용 전달 및 개선 요청", result: "이후 발주건부터 피그테일 포장 사진 전달받아 공유", type: "품질문제", status: "완료" },
  { id: 13, date: "2025-04-23", company: "FLC", direction: "수입", lotNo: "25-2-2", product: "피그테일(SC/PC)", defect: "커넥터 오염 및 정렬 불량", compensation: "전량 반품, 재작업후 정상품 제공 요청", result: "재작업 후 정상품 입고 완료(2025/06/10)", type: "품질문제", status: "완료" },
  { id: 14, date: "2025-06-05", company: "FLC", direction: "수입", lotNo: "25-3", product: "피그테일(SC/PC)", defect: "커넥터 정렬 불량 및 포장 불량", compensation: "업체 내용 전달 및 개선 요청", result: "추후 발주건 피그테일 포장 사진 전달받아 공유 예정", type: "품질문제", status: "완료" },
  { id: 15, date: "2025-06-05", company: "FLC", direction: "수입", lotNo: "25-3", product: "OJC", defect: "일부 제품 성적서 오입", compensation: "업체 내용 전달 및 개선 요청", result: "개선 요청 완료", type: "품질문제", status: "완료" },
  { id: 16, date: "2025-07-16", company: "FLC", direction: "수입", lotNo: "25-4", product: "OJC(SC TYPE)", defect: "케이블 마킹 누락", compensation: "업체 내용 전달 및 개선 요청", result: "개선 요청 완료", type: "품질문제", status: "완료" },
  { id: 17, date: "2025-07-16", company: "FLC", direction: "수입", lotNo: "25-4", product: "OJC(LC type)", defect: "인장성능 부적합으로 인한 외피 이탈", compensation: "대체품 무상 제공 요청", result: "대체품 무상 입고 완료(2025/08/26)했으나 재불량 확인, 대체품 추가 발송 예정(09/29 입고 예상)", type: "품질문제", status: "완료" },
  { id: 18, date: "2025-09-09", company: "FLC", direction: "수입", lotNo: "25-5", product: "OJC(LC type)", defect: "인장성능 부적합으로 인한 외피 이탈", compensation: "대체품 무상 제공 요청", result: "대체품 추석 이후 입고 예상", type: "품질문제", status: "완료" },
  { id: 19, date: "2025-02-04", company: "Grandway", direction: "수입", lotNo: "25-1", product: "초소형 파워미터(FHP-12-B)", defect: "액정창 내 이물유입 및 버튼음 불량", compensation: "내용 전달 및 대체품 무상 제공 요청", result: "대체품 추후 광파워미터 발주 진행시 같이 입고될 예정 (리마인드 예정)", type: "품질문제", status: "완료" },
  { id: 20, date: "2025-02-04", company: "Grandway", direction: "수입", lotNo: "25-1", product: "광코아 절단기(DC-20)", defect: "박스 라벨 불량(Grandway 오부착)", compensation: "내용 전달 및 개선 요청", result: "정상라벨 인쇄후 입고품 재작업 완료(2025/02/21)", type: "품질문제", status: "완료" },
  { id: 21, date: "2025-04-25", company: "Grandway", direction: "수입", lotNo: "25-2", product: "광코아 절단기(DC-20)", defect: "제품 스티커 불량(Grandway 오부착)", compensation: "내용 전달 및 개선 요청", result: "정상라벨 전달받아 입고품 재작업 완료(2025/07/29)", type: "품질문제", status: "완료" },
  { id: 22, date: "2025-04-10", company: "GST", direction: "수입", lotNo: "25-1", product: "아답터(SC/PC DP TYPE)", defect: "라벨 스티커 이중 부착", compensation: "정상 라벨 스티커 부착한 트레이 무상 제공 요청", result: "대체품 무상 입고 완료(2025/05/26)", type: "품질문제", status: "완료" },
  { id: 23, date: "2025-04-10", company: "GST", direction: "수입", lotNo: "25-1", product: "아답터(SC/PC DP TYPE)", defect: "아답터 취부대 사출 불량", compensation: "DP 아답터 대체품 무상 제공 요청", result: "대체품 무상 입고 완료(2025/05/26)", type: "품질문제", status: "완료" },
  { id: 24, date: "2024-09-26", company: "Huamai", direction: "수입", lotNo: "24-8", product: "Drop cable(3.0mm)", defect: "이물질 오염", compensation: "대체품 무상 제공 요청", result: "대체품 무상 입고 완료(2025/04/03)", type: "품질문제", status: "완료" },
  { id: 25, date: "2025-03-14", company: "Huamai", direction: "수입", lotNo: "25-1, 2", product: "인입광케이블 T/B_FIG8_2C", defect: "케이블 외피 재질 불량", compensation: "제품 개선 및 대체품 무상 제공 요청", result: "대체품 무상 입고 완료(2025/05/28)", type: "품질문제", status: "완료" },
  { id: 26, date: "2025-08-07", company: "Huamai", direction: "수입", lotNo: "25-3-2, 6", product: "IDC 보호기", defect: "실크인쇄 미적용(KT 로고 등) 및 소박스 시안(KC 인증 마크) 미적용", compensation: "시안 재전달 및 수정 요청", result: "Huamai 측 수정 진행 중", type: "품질문제", status: "완료" },
  { id: 27, date: "2025-03-18", company: "Langreat", direction: "수입", lotNo: "24-1", product: "심선접속자", defect: "포장 박스 불량(도면 대비 치수 불일치(인서트 탭))", compensation: "내용 전달 및 개선 요청", result: "업체측 개선 완료", type: "품질문제", status: "완료" },
  { id: 28, date: "2025-04-02", company: "Neofibo", direction: "수입", lotNo: "25-1, 2", product: "LC/APC 연마지그", defect: "지그 하우징 변형", compensation: "수리용 부품 무상 제공 요청", result: "추후 발주건에 무상 제공 예정 (리마인드 필요)", type: "품질문제", status: "완료" },
  { id: 29, date: "2024-12-24", company: "ORC", direction: "수입", lotNo: "24-3-6, 4-5, 5-1", product: "스플리터(RNM-12)", defect: "PDL 불량 및 어댑터 슬리브 파손", compensation: "전수검사비용 청구 및 불량 대체품 공급 요청", result: "물품 대금 정산시 해당 비용 차감(완료), 불량 대체품 추후 동일제품 발주시 추가 입고 예정", type: "품질문제", status: "완료" },
];

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>(INITIAL_DATA);
  const [company, setCompany] = useState("");
  const [direction, setDirection] = useState("수입");
  const [lotNo, setLotNo] = useState("");
  const [product, setProduct] = useState("");
  const [defect, setDefect] = useState("");
  const [compensation, setCompensation] = useState("");
  const [result, setResult] = useState("");
  const [type, setType] = useState("품질문제");
  const [search, setSearch] = useState("");
  const [filterDirection, setFilterDirection] = useState("전체");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterCompany, setFilterCompany] = useState("전체");
  const [filterType, setFilterType] = useState("전체");
  const [sortBy, setSortBy] = useState("date");

  const addIssue = () => {
    if (!company || !defect) return alert("거래처와 불량증상을 입력해주세요.");
    const newIssue: Issue = {
      id: Date.now(), company, direction, lotNo, product, defect, compensation, result, type,
      status: "신규",
      date: new Date().toLocaleDateString("ko-KR"),
    };
    setIssues([newIssue, ...issues]);
    setCompany(""); setLotNo(""); setProduct(""); setDefect(""); setCompensation(""); setResult("");
  };

  const changeStatus = (id: number, newStatus: string) => {
    setIssues(issues.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
  };

  const filtered = issues
    .filter((i) => filterDirection === "전체" || i.direction === filterDirection)
    .filter((i) => filterStatus === "전체" || i.status === filterStatus)
    .filter((i) => filterCompany === "전체" || i.company === filterCompany)
    .filter((i) => filterType === "전체" || i.type === filterType)
    .filter((i) => search === "" || i.company.includes(search) || i.product.includes(search) || i.defect.includes(search))
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "company") return a.company.localeCompare(b.company);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return 0;
    });

  const importCount = issues.filter((i) => i.direction === "수입").length;
  const exportCount = issues.filter((i) => i.direction === "수출").length;
  const doneCount = issues.filter((i) => i.status === "완료").length;
  const inProgressCount = issues.filter((i) => i.status === "진행중").length;

  const statusStyle = (s: string) => {
    if (s === "완료") return { background: "#e6f9ed", color: "#1a7f3c" };
    if (s === "진행중") return { background: "#fff7e0", color: "#b07d00" };
    return { background: "#f0f0f0", color: "#555" };
  };

  const sel = { padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #ddd", fontSize: "0.85rem", background: "white", cursor: "pointer" };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>🌐 해외 거래처 이슈 트래커</h1>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "전체", count: issues.length, color: "#555" },
          { label: "수입", count: importCount, color: "#0070f3" },
          { label: "수출", count: exportCount, color: "#e67e22" },
          { label: "완료", count: doneCount, color: "#1a7f3c" },
          { label: "진행중", count: inProgressCount, color: "#b07d00" },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ flex: 1, minWidth: "80px", padding: "0.75rem", borderRadius: "8px", textAlign: "center", background: "#f5f5f5", border: `2px solid ${color}` }}>
            <div style={{ fontSize: "0.8rem", color: color, fontWeight: "bold", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{count}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>필터:</span>
          <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)} style={sel}>
            <option value="전체">수입/수출 전체</option>
            <option value="수입">수입</option>
            <option value="수출">수출</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={sel}>
            <option value="전체">진행상태 전체</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} style={sel}>
            {COMPANIES.map((c) => <option key={c} value={c}>{c === "전체" ? "업체명 전체" : c}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={sel}>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t === "전체" ? "이슈유형 전체" : t}</option>)}
          </select>
          <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: "bold" }}>정렬:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sel}>
            <option value="date">날짜순</option>
            <option value="company">업체명순</option>
            <option value="status">진행상태순</option>
            <option value="type">이슈유형순</option>
          </select>
          <button onClick={() => { setFilterDirection("전체"); setFilterStatus("전체"); setFilterCompany("전체"); setFilterType("전체"); setSearch(""); setSortBy("date"); }}
            style={{ ...sel, background: "#eee" }}>초기화</button>
        </div>
      </div>
      <input placeholder="거래처, 제품군, 불량증상으로 검색" value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "1.5rem", boxSizing: "border-box" }} />
      <details style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>+ 새 이슈 등록</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input placeholder="거래처명" value={company} onChange={(e) => setCompany(e.target.value)} style={{ flex: 2, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input placeholder="입고차수" value={lotNo} onChange={(e) => setLotNo(e.target.value)} style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["수입", "수출"].map((d) => (
              <button key={d} onClick={() => setDirection(d)} style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", cursor: "pointer", border: "1px solid #ccc", background: direction === d ? (d === "수입" ? "#0070f3" : "#e67e22") : "white", color: direction === d ? "white" : "#333", fontWeight: direction === d ? "bold" : "normal" }}>{d}</button>
            ))}
          </div>
          <input placeholder="제품군" value={product} onChange={(e) => setProduct(e.target.value)} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
          <textarea placeholder="불량증상" value={defect} onChange={(e) => setDefect(e.target.value)} rows={2} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
          <textarea placeholder="보상방안/요청사항" value={compensation} onChange={(e) => setCompensation(e.target.value)} rows={2} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
          <textarea placeholder="처리결과" value={result} onChange={(e) => setResult(e.target.value)} rows={2} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}>
            {["가격변동", "납기지연", "품질문제", "계약변경", "기타"].map((u) => <option key={u}>{u}</option>)}
          </select>
          <button onClick={addIssue} style={{ padding: "0.6rem", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>등록</button>
        </div>
      </details>
      <h2 style={{ marginBottom: "1rem" }}>이슈 목록 ({filtered.length}건)</h2>
      {filtered.length === 0 && <p style={{ color: "#999" }}>해당하는 이슈가 없어요.</p>}
      {filtered.map((issue) => (
        <div key={issue.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <strong>{issue.company}</strong>
              {issue.lotNo && <span style={{ color: "#888", fontSize: "0.85rem" }}>{issue.lotNo}</span>}
              <span style={{ background: issue.direction === "수입" ? "#e0f0ff" : "#fde8d0", color: issue.direction === "수입" ? "#0070f3" : "#e67e22", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>{issue.direction}</span>
              <span style={{ background: "#f0f0f0", color: "#555", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>{issue.type}</span>
            </div>
            <span style={{ color: "#999", fontSize: "0.85rem" }}>{issue.date}</span>
          </div>
          {issue.product && <div style={{ fontSize: "0.9rem", fontWeight: "500", marginBottom: "0.4rem" }}>📦 {issue.product}</div>}
          <div style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>⚠️ {issue.defect}</div>
          {issue.compensation && <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" }}>📋 {issue.compensation}</div>}
          {issue.result && <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>✅ {issue.result}</div>}
          <select value={issue.status} onChange={(e) => changeStatus(issue.id, e.target.value)} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #ccc", ...statusStyle(issue.status) }}>
            {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </main>
  );
}
