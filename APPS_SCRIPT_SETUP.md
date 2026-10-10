# 교사 설정 안내 — 구글 시트 + Apps Script

> 1회 설정 5분. 학생 기기에는 웹앱 URL만 입력하면 됩니다.

## 1. 시트 만들기

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성 (예: `안전도우미 기록`)
2. 첫 행에 열 제목 입력:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| 수신시각 | 전송시각 | 학번 | 이름 | 종류 | 실 | 점수 | 정답률 | 메모 | 학년반 |

## 2. 스크립트 붙여넣기

1. 메뉴 **확장 프로그램 → Apps Script** 열기
2. 기존 코드를 지우고 아래 붙여넣기 → 저장 (Ctrl+S)

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    d.date || "",
    d.number || "",
    d.name || "",
    d.kind === "check" ? "점검" : d.kind === "quiz" ? "퀴즈" : (d.kind || ""),
    d.room || "",
    d.score || "",
    d.rate || "",
    d.memo || "",
    d.className || "",
  ]);
  return ContentService.createTextOutput("ok");
}

// 기록 읽기 (교사용 학반 기록 보기용: ?action=read&callback=...)
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === "read") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1).map(function (r) {
      return {
        receivedAt: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ""),
        date: String(r[1] || ""),
        number: String(r[2] || ""),
        name: String(r[3] || ""),
        kind: String(r[4] || ""),
        room: String(r[5] || ""),
        score: String(r[6] || ""),
        rate: String(r[7] || ""),
        memo: String(r[8] || ""),
        className: String(r[9] || ""),
      };
    });
    const cb = String(params.callback || "callback").replace(/[^a-zA-Z0-9_$]/g, "");
    return ContentService
      .createTextOutput(cb + "(" + JSON.stringify(rows) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput("ok");
}
```

## 3. 웹앱으로 배포

1. 오른쪽 위 **배포 → 새 배포** 클릭
2. 유형 선택 (⚙️) → **웹 앱**
3. 설정:
   - 실행 주체: **나**
   - 액세스 권한이 있는 사용자: **모든 사용자** (학생 기기에서 로그인 없이 전송되게)
4. **배포** → **액세스 승인** (구글 로그인 → 고급 → 이동 → 허용)
5. 발급된 **웹 앱 URL** (`https://script.google.com/.../exec`) 복사

## 4. 학생 기기에 입력

1. 안전 도우미 앱 → **🧑‍🏫 교사용** 메뉴
2. 학번·이름 + 위 URL 입력 → **💾 저장하기**
3. **📡 연결 테스트** → 시트에 "연결 테스트" 행이 추가되면 성공!

## 5. 진행 상황 확인

- 시트에서 학번·이름·종류(점검/퀴즈)·점수로 필터/정렬
- 예: `점검` 행이 3개실 모두 있는 학생 = 수업 전 점검 완료
- 퀴즈 정답률이 낮은 장면은 다음 수업에서 복습
- 앱 교사용 5️⃣ 학반 기록 보기에서도 학반별로 바로 확인 가능

## 문제 해결

| 증상 | 확인 |
|---|---|
| 전송 실패 메시지 | URL 오타, 인터넷 연결, 배포 시 "모든 사용자" 선택 여부 |
| 403/권한 오류 | 배포 설정의 액세스 권한을 "모든 사용자"로 다시 배포 |
| 행이 안 쌓임 | 교사용 메뉴에서 **📡 연결 테스트**로 먼저 확인 |
