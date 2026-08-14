# 42번 고객 안내 대화창 — GitHub 중앙 통합문서 전수검증 체크포인트

- 대화창/작업군: 42번 고객 안내 대화창 / 고객 안내
- 현재 작업: 고객 안내 중앙마스터 원문 전수대조 및 GitHub 역검증
- 상태: RUNNING
- 확정 Source of Truth: `docs/UNIFIED_CUSTOMER_GUIDANCE_RULES.md`
- 다른 작업군 수정: 없음
- 중복실행: 없음. 시작 시 기존 RUNNING 체크포인트를 선조회하고 직전 미완료 지점부터 재개함.

## 누적 완료
1. 고객 안내 Source of Truth를 `UNIFIED_CUSTOMER_GUIDANCE_RULES.md`로 단일화.
2. 중앙마스터 1차 실제 수정/Commit/재FETCH 완료.
3. 반도체 실제 고객행 `SEM-001`~`SEM-029` 확인.
4. 탄소 고객안내 실제 출력에서 `C-001`~`C-021` 계열 사용 확인.
5. 방산/조선/로봇은 공통 원문에서 `DEF-001 / SHP-001 / ROB-001` 영구번호 스키마를 재확인했으나 실제 고객행 직접 증거는 아직 미확보.
6. AI 고객안내 원문에서는 확정 번호 접두어/실제 번호행 미확인.
7. 고객 안내는 기존 고객번호/기본정보를 승계하는 공통 규칙을 확인했고, 최신 42번 지시와 결합해 실제 번호체계와 마지막 번호 확인 후 다음 미사용 번호만 부여하는 게이트를 유지함.
8. Research and Markets를 발행사로 사용한 과거 출력은 현 중앙마스터의 유통/집계 사이트 비발행사 원칙과 충돌하므로 실패 사례로 유지.
9. 탄소·반도체·AI 원문에서 기관 산업 맥락 우선, 인력정보 아래 추천자료 세로 배치, 거래 가능/제외 발행사 자동 적용, 제목=실제 링크 제목, 리디렉션 금지, 중복 차단을 재확인함.
10. 과거 고객안내 원문에서 목차는 상위만이 아니라 하위 목차까지 포함하고, 안내서에 바로 붙일 수 있도록 계층/들여쓰기 형태를 유지하며, 링크·제목·가격·목차는 출력 전 자체검증해야 한다는 규칙을 재확인함.
11. 회사가 제공한 원본 시장보고서 안내서 양식을 고정 기준으로 사용하고, 사용자가 다시 수동 교정해야 하는 출력은 PASS가 아니라는 지적을 재확인함.
12. 발행사 원문 `자료 추천·안내문 대화창용 완전 범용 지시문 v5.0`의 고정 풀과 GitHub `CUSTOMER_PUBLISHER_MASTER.md`의 거래 가능 고정 풀 78개를 대조하여 동일 목록임을 확인함.
13. GitHub `CUSTOMER_PUBLISHER_MASTER.md`에서 명시 제외를 재확인함: Research and Markets, Market Reports World, Intel Market Research, IDTechEx. Industry Experts는 HTML 상세페이지 우선 예외를 유지함.
14. AI 고객안내 원문에서 거래 가능 목록 밖 자료 즉시 제외, 제외 발행사 무조건 제외, 발행사 기준을 사용자에게 다시 묻지 않고 자동 적용한다는 직접 규칙을 재확인함.
15. 탄소 `C-###`는 고객안내 출력번호임은 확인되나 공통 영구번호 스키마는 `CAR-###`로 별도 존재하여, `C-###`를 영구번호로 승격하지 않고 출처 성격 확인 전 HOLD 유지함.

## 규칙 원장 — 현재 처리분
| ID | 원문 규칙 | 중앙 반영 | 판정 |
|---|---|---|---|
| CG-001 | SEM 영구번호 | §26 | PASS |
| CG-002 | 탄소 실제 C-### 사용 | §26 | PASS/HOLD — 실제 출력 사용은 확인, 영구 DB 승계 원장 증거는 미확인 |
| CG-003 | AI 번호체계 미확인 | §22/§26 | PASS/HOLD 경계 |
| CG-004 | 고객정보→추천자료 세로 배치 | §27 | PASS |
| CG-005 | Research and Markets 발행사 취급 금지 | §7 | PASS |
| CG-006 | 제목=상세페이지, 리디렉션 금지 | §9~§10 | PASS |
| CG-007 | 발송/자료 중복 회피 | §20 | PASS |
| CG-008 | FINAL 신뢰 금지·재FETCH·역검증 | §24/§28/§29 | PASS |
| CG-009 | 고객안내 SOT 단일화 | §25 | PASS |
| CG-010 | DEF/SHP/ROB 스키마 존재, 실제 번호행 미확인 | §22/§26 | PASS/HOLD 경계 |
| CG-011 | 번호 없는 입력에서 임의 번호 생성 금지 | §21/§22/§26 | PASS |
| CG-012 | 기관 산업 맥락 최우선 | §5/§6 | PASS |
| CG-013 | 거래 가능/제외 발행사 자동 적용 | §7 | RUNNING — 고정 풀 78개 일치는 확인, 명시 제외 3곳+IDTechEx의 중앙마스터 직접 명시 보완 필요 |
| CG-014 | 고객안내는 기존 DB 번호 승계 | §26 | PASS |
| CG-015 | 목차 상위+하위 계층 및 들여쓰기 유지 | §16/§17 | PASS |
| CG-016 | 원본 안내서 양식 고정 및 구조 보존 | §18 | PASS |
| CG-017 | 링크·제목·가격·목차 자체검증 후 출력 | §9/§10/§21 | PASS |
| CG-018 | 사용자가 다시 수동검수해야 하면 PASS 금지 | §10/§22/§23 | PASS |
| CG-019 | 고정 풀 밖 발행사 고객 추천 즉시 제외 | §7 | RUNNING — AI 원문에는 명시, 중앙마스터는 거래불명 HOLD 표현이라 직접 금지 문구 보완 필요 |
| CG-020 | Market Reports World / Intel Market Research / IDTechEx 제외 | §7 | RUNNING — publisher master에는 명시, 고객안내 SOT에는 개별 명시 없음 |
| CG-021 | Future Markets와 Future Market Insights 혼동 금지 | §7 | RUNNING — 과거 품질게이트 직접 규칙 재확인, 중앙마스터 직접 명시 여부 보완 검토 |

## 이번 실행 실제 조사 결과
- 체크포인트를 먼저 조회하고 상태 RUNNING 및 중복실행 없음 확인 후 직전 시작점에서 재개함.
- `자료 추천·안내문 대화창용 완전 범용 지시문 v5.0`의 78개 고정 발행사 풀과 GitHub `CUSTOMER_PUBLISHER_MASTER.md`의 78개 풀이 일치함을 확인함.
- GitHub publisher master의 명시 제외는 Research and Markets / Market Reports World / Intel Market Research / IDTechEx이며, IDTechEx는 이번 회차로 최신 중앙 발행사 기준에서 제외 상태가 확정됨.
- AI 고객안내 원문은 고정 풀 밖 자료 즉시 제외와 제외 목록 자동 적용을 직접 요구함.
- 현 고객안내 중앙마스터 §7은 78개 풀과 Research and Markets 비발행사 원칙은 포함하지만, `고정 풀 밖 즉시 제외` 및 Market Reports World / Intel Market Research / IDTechEx의 개별 제외가 직접 기재되어 있지 않아 규칙 원장상 미반영 보완 대상으로 판정함.
- 탄소 C-001~C-021의 영구 DB 승계 증거는 추가 검색에서도 확보하지 못함. 공통 영구번호 원문은 탄소·복합재 `CAR-001`을 사용하므로 C-###는 임의 영구번호로 승격 금지.
- DEF/SHP/ROB 실제 고객 번호행 추가 증거는 이번 회차에 확보하지 못함.

## 중앙마스터 검증 상태
- 현재 중앙마스터 blob SHA: `97382878b464a0956d311fb011f5b34fed09880b`
- 중앙마스터 1차 Commit SHA: `b4eb2684f049dc51cfca0588bb6ac171b413f007`
- 이번 실행 중앙마스터 수정: 없음 — §7 보완 필요성이 확정되었으나 전체 파일 안전 치환 준비 전이므로 미완료를 숨기지 않고 RUNNING 유지
- 잘못 삭제 확인: 현재까지 0
- 확정 충돌 미해결: 현재까지 0
- 전체 누락 수: 최소 2개 묶음(CG-019, CG-020; CG-021 추가 검토) 확인, 최종 산출 전이므로 COMPLETE 금지

## HOLD
- DEF/SHP/ROB 실제 고객 번호행 및 마지막 번호: 미확인
- AI 고객번호 접두어/마지막 번호: 미확인
- 탄소 C-###의 영구 DB 번호 성격: 추가 확인 필요
- 고객안내 중앙마스터 §7에 고정 풀 밖 즉시 제외 문구 반영 필요
- 고객안내 중앙마스터 §7에 Market Reports World / Intel Market Research / IDTechEx 명시 제외 반영 필요
- Future Markets / Future Market Insights 구분 규칙 중앙마스터 직접 반영 여부 검토 필요

## 다음 실행 정확한 시작점
1. `UNIFIED_CUSTOMER_GUIDANCE_RULES.md` §7만 안전하게 보완: 고정 풀 밖 추천 금지, Market Reports World / Intel Market Research / IDTechEx 명시 제외, Future Markets와 Future Market Insights 혼동 금지.
2. 중앙마스터 UPDATE/COMMIT 직후 동일 파일 재FETCH하여 §7 신규 문자열 존재 확인 및 기존 78개 풀 손실 0 확인.
3. 탄소 C-###가 영구 DB 번호인지 추가 역추적하되 CAR-### 공통 스키마와 충돌 시 최신 직접 지시 우선으로 판정.
4. 방산/조선/로봇 실제 고객 번호행 및 마지막 번호 추가 역추적.
5. 최종 원본 규칙 수/적용 수/GitHub 반영 수/누락/충돌/잘못 삭제/최신 지적 미반영 수 산출.

- 마지막 정상 완료 지점: 거래 발행사 78개 풀 일치 확인 + IDTechEx 포함 명시 제외 상태 확정 + 중앙마스터 §7 미반영 항목 특정
- 마지막 중앙마스터 Commit SHA: `b4eb2684f049dc51cfca0588bb6ac171b413f007`
- 상태: RUNNING
- 마지막 갱신: 2026-08-14 23:06 KST
