import { Pool } from "pg";

// DATABASE_URL은 컨테이너 런타임에 주입되며 Docker 이미지 빌드 시점에는 없다.
// next build가 라우트 모듈을 import 해 페이지 데이터를 수집하므로, 모듈 최상단에서
// 검사하면 빌드 자체가 깨진다 — 실제 쿼리 시점까지 지연시킨다.
let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL 미설정 (.db-credentials 참고)");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  return pool;
}

let ready: Promise<void> | null = null;
function ensureDb() {
  if (!ready) ready = initSchema();
  return ready;
}

export async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  await ensureDb();
  return (await getPool().query(sql, params)).rows;
}

export async function one<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(sql, params))[0];
}

export async function run(sql: string, params: unknown[] = []) {
  await ensureDb();
  return getPool().query(sql, params);
}

async function initSchema() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS issues (
      id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      거래처      text NOT NULL,
      국가        text DEFAULT '',
      유형        text NOT NULL,
      내용        text NOT NULL,
      상태        text NOT NULL DEFAULT '신규',
      created_at text DEFAULT to_char(now() AT TIME ZONE 'Asia/Seoul','YYYY-MM-DD HH24:MI:SS')
    );
  `);
}
