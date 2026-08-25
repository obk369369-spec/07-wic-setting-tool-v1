# 42번 고객 안내 — 2026-08-24 Work 인계

## 현재 대화의 운영원칙
- 현재 42번 대화창은 최소 수정의 `소형 관찰자`로 운용한다.
- FAIL/HOLD를 감지하면 사용자의 다음 `개선해` 지시를 기다리지 않고 `원인 감지 → 마스터 확인/보강 → expected 수정 → 게이트 수정/재연결 → 실제 출력 회귀검증 → PASS/HOLD/FAIL → 한 번에 보고`까지 연속 실행한다.
- 동일 규칙이 이미 마스터에 있으면 규칙을 중복 추가하지 않고 expected·게이트·출력 경로 중 실제 고장 지점을 최소 수정한다.
- 한 단계 수정 후 멈추지 않고, 같은 범위의 연쇄검증에서 새 FAIL이 나오면 자동으로 계속 수정한다.
- 보고는 항목별로 `원인 / 마스터 / expected / 게이트 / 실제 출력 재검증 / 최종상태`를 구분한다.

## 2026-08-24 Work가 반드시 먼저 읽을 순서
1. `docs/UNIFIED_CUSTOMER_GUIDANCE_RULES.md`
2. `docs/CHAT_42_CUSTOMER_GUIDANCE_WORK_PROGRESS.md`
3. 이 파일 `docs/CHAT_42_WORK_20260824_HANDOFF.md`
4. `fixtures/customer_guidance_actual_kmg_expected.json`
5. `fixtures/customer_guidance_actual_kmg_output.txt`
6. `scripts/customer_guidance_output_gate.js`
7. 전역 `obk369369-spec/20-operational-manual-viewer/WIC_GLOBAL_OPERATING_RULES.md`
8. 전역 feedback pipeline의 pending/state/evidence 및 최신 observer status

## 24일 Work 핵심 목표
`반복 FAIL 자동감지 → 관련 기준본/게이트 동시수정 → 회귀테스트 → PASS 전 출력 금지`를 실제 엔진 흐름으로 묶어, 사용자가 같은 자질구레한 오류를 반복 지적하는 사후 검수 작업을 줄인다.

## 일일 피드백 누락방지 목표
- 모든 현재·미래 업무 대화창의 지속 적용 피드백을 이벤트 단위로 구조화한다.
- 각 이벤트는 `업무군/대화창 → 중앙마스터 대상 → 체크포인트 → expected/기준본 → 게이트 → 실제 재검증 → 처리상태`까지 추적한다.
- 처리되지 않은 피드백 이벤트가 있으면 일일 감사에서 HOLD/FAIL로 표시하고 최종 PASS를 금지한다.
- 같은 날짜의 피드백 건수와 중앙 반영 완료 건수를 대조해 `수신 건수 = 처리완료 + HOLD + 명시적 일회성 제외`가 아니면 누락으로 판정한다.
- 24일 Work에서는 자동 이벤트 수집/분류, 미처리 이벤트 감지, 일일 completeness audit, 재시작 지점을 실제 엔진 흐름으로 연결하는 것을 우선한다.
- 목표는 피드백 누락률 0%이며, 실제 측정치가 확보되기 전에는 0% 달성을 주장하지 않는다.

## 현재 확인된 실제 결함
- 중앙마스터에는 3종·TOC 끝까지·번호 복사·추적 URL 금지·공식 전체 타이틀 등의 규칙이 있지만, 김명곤 expected가 일부 구버전/손상 상태여서 마스터와 게이트가 잘못된 expected를 기준으로 PASS할 위험이 있었다.
- 김명곤 추천 2 Technavio 공식 상세페이지 상단 타이틀은 긴 전체 제목이며, 공개 TOC는 `16.10 List of abbreviations`까지 실제 확인된다.
- Technavio 상세페이지 기준 발행일은 `Jan 2026`, 페이지는 `283 Pages`다.
- 김명곤 추천 1 BCC 고객용 발행사 표기는 사용자 직접 지시에 따라 `BCC Research`로 고정한다. 공식 페이지 내부 `Publisher: BCC Publishing` 표기와 브랜드명 차이는 24일 Work에서 필드 의미를 분리해 재발 방지한다.
- BCC 추천 1 하위목차는 현재 실제 상세페이지에서 확인된 공개 TOC만 사용한다.
- `?utm_source=chatgpt.com` 등 추적 파라미터는 고객 출력에서 제거한다.
- `보고서 정보:` 라벨과 번역 내용은 서로 다른 줄로 출력한다.
- 추천자료 1·2만 있는 부분 결과는 출력 금지하고 정확히 3종이어야 한다.

## 2026-08-22 김명곤 실제 회귀 결과
- 중앙마스터 §42 `사용자 추가 지적 0회 목표·소형 관찰자 연속교정` 반영 Commit: `1684232bf7a69aec814b7b276afe14caf97c4a76`.
- 손상/구버전 expected를 정상 JSON 3종 구조로 복구: Commit `9b530b819b70748a5794a182677497a9b526114f`.
- 출력게이트에 required TOC 최소 줄수·필수 시작/중간/마지막 항목 검사 추가: Commit `dea075f356ce7bb66e9258b3cc4f8783903944a7`.
- 김명곤 actual 출력 3종을 공식 타이틀/날짜/페이지/가격/링크/목차/보고서정보 형식에 맞게 교정: Commit `3a06c3e562ac246336311f929fcfdb5140e85ad2`.
- GitHub 원격 read-back 후 동일 내용으로 Node 게이트 실제 실행 결과: `PASS`, errors `[]`, holds `[]`.
- Technavio 목차는 `16.10 List of abbreviations`까지 존재하고 추천자료 3까지 연속 출력됨.
- 현재 김명곤 회귀 상태: `PASS` — 다음 동일 오류가 사용자에게 다시 발견되면 소형 관찰자 FAIL로 판정하고 자동 원인추적한다.

## 종합 방식
중요 피드백을 모든 대화 원문에 의존해 기억하는 방식으로 운영하지 않는다. 현재 대화에서 확정된 중요한 피드백·실패사례·수정상태를 위 지속 파일과 actual/expected/gate 증거에 구조화해 저장하고, 24일 Work가 위 순서대로 실제 파일을 읽어 종합한다. 필요할 때만 과거 대화 원문을 추가 검색해 누락을 보충한다.
