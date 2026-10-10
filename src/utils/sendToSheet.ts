import type { SheetRecord } from "../types";
import { useSafetyStore } from "../stores/safetyStore";
import { classLabel } from "../types";

/**
 * 구글 Apps Script 웹앱으로 기록 전송.
 * mode: "no-cors"라 응답을 읽을 수 없으므로, 네트워크 오류만 실패로 본다.
 * 학년반(className)은 저장된 학생 학반에서 자동 첨부.
 */
export async function sendToSheet(url: string, record: SheetRecord): Promise<boolean> {
  try {
    const { classes, studentClassId, studentClassName } = useSafetyStore.getState();
    const cls = classes.find((c) => c.id === studentClassId);
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...record,
        className: record.className || studentClassName || (cls ? classLabel(cls) : ""),
        date: new Date().toISOString(),
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export interface SheetRow {
  receivedAt: string;
  date: string;
  number: string;
  name: string;
  className: string;
  kind: string;
  room: string;
  score: string;
  rate: string;
  memo: string;
}

/**
 * 시트 기록 읽어오기 (JSONP — Apps Script는 CORS 리다이렉트 때문에 fetch 직접 읽기가 안 됨).
 * Apps Script에 doGet?action=read&callback=... 처리가 필요 (APPS_SCRIPT_SETUP.md 참고).
 */
export function readFromSheet(url: string, timeoutMs = 15000): Promise<SheetRow[]> {
  return new Promise((resolve, reject) => {
    const cb = `__sheetRead${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);
    function cleanup() {
      window.clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[cb];
      script.remove();
    }
    (window as unknown as Record<string, unknown>)[cb] = (data: unknown) => {
      cleanup();
      resolve(Array.isArray(data) ? (data as SheetRow[]) : []);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("load error"));
    };
    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}action=read&callback=${cb}`;
    document.body.appendChild(script);
  });
}
