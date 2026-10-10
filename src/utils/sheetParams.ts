/**
 * 학생 접속용 URL 생성/해석.
 * 교사가 배포한 주소 예: https://host/?sheet=<AppsScriptURL>&class=<classId>
 * 학생이 이 주소로 들어오면 시트 URL·학반이 자동 저장되어 바로 기록 전송됨.
 */

export interface StudentParams {
  sheet?: string;
  classId?: string;
  className?: string;
}

export function parseStudentParams(search: string): StudentParams {
  const out: StudentParams = {};
  try {
    const q = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
    const sheet = (q.get("sheet") ?? "").trim();
    const classId = (q.get("class") ?? "").trim();
    const className = (q.get("classname") ?? "").trim();
    if (sheet) out.sheet = sheet;
    if (classId) out.classId = classId;
    if (className) out.className = className;
  } catch {
    /* 파싱 실패 무시 */
  }
  return out;
}

export function buildStudentUrl(origin: string, scriptUrl: string, classId: string, className: string, basePath = "/"): string {
  const q = new URLSearchParams();
  if (scriptUrl.trim()) q.set("sheet", scriptUrl.trim());
  if (classId.trim()) q.set("class", classId.trim());
  if (className.trim()) q.set("classname", className.trim());
  const query = q.toString();
  const base = basePath.replace(/^\/+|\/+$/g, "");
  const prefix = base ? `/${base}/` : "/";
  return `${origin.replace(/\/$/, "")}${prefix}${query ? `?${query}` : ""}`;
}
