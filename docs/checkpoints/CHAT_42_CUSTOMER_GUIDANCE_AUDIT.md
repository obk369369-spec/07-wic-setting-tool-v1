# 42번 고객 안내 대화창 — GitHub 중앙 통합문서 전수검증 체크포인트

- 대화창/작업군: 42번 고객 안내 대화창 / 고객 안내
- 현재 작업: 고객 안내 중앙마스터 원문 전수대조 및 GitHub 역검증
- 전체 작업범위: 고객 안내 관련 사용자 제공 대화기록·지시문·구버전 규칙·최신 지적사항·GitHub 고객안내 중앙문서·분야별 예외
- 상태: RUNNING
- 마지막 정상 완료 지점: GitHub 실제 문서 구조 확인 및 중앙마스터 체인 식별
- 확인된 GitHub 문서:
  - 07-wic-setting-tool-v1/docs/UNIFIED_CUSTOMER_GUIDANCE_RULES.md
  - 07-wic-setting-tool-v1/docs/COMMON_CUSTOMER_OUTPUT_RULES.md (LEGACY)
  - 07-wic-setting-tool-v1/docs/WIC_CUSTOMER_RULE_SOURCE.md
  - 20-operational-manual-viewer/CUSTOMER_WORKFLOW_MASTER.md
- 현재 핵심 발견:
  1. UNIFIED_CUSTOMER_GUIDANCE_RULES.md가 FINAL/LOCK로 표시되어 있으나 최신 42번 대화창 격리·체크포인트·장기작업 복구 규칙은 아직 본문에 확인되지 않음.
  2. WIC_CUSTOMER_RULE_SOURCE.md는 별도 저장소의 CUSTOMER_WORKFLOW_MASTER.md를 중앙 고객업무 마스터로 지정하고 있어 중앙 원본 관계를 재정리해야 함.
  3. CUSTOMER_WORKFLOW_MASTER.md에는 분야 고객번호(SEM/ROB/DEF/SHP/BAT/CAR)와 스팸회피 간격 규칙이 존재함.
- 완료 항목:
  - GitHub 저장소 및 대상 파일 실제 조회
  - UNIFIED_CUSTOMER_GUIDANCE_RULES.md 1차 실제 읽기
  - COMMON_CUSTOMER_OUTPUT_RULES.md 실제 읽기
  - WIC_CUSTOMER_RULE_SOURCE.md 실제 읽기
  - CUSTOMER_WORKFLOW_MASTER.md 고객안내/분야번호/회피규칙 관련 구간 실제 읽기
- 진행 중:
  - 사용자 제공 방산/반도체/탄소/조선/AI 대화기록 및 Library 로봇 규칙의 항목별 규칙 원장화
  - GitHub 중앙문서 간 충돌·누락 대조
- 미완료 항목:
  - 전체 원문 규칙 원장 확정
  - 충돌 해결
  - 중앙마스터 실제 수정
  - GitHub Commit
  - 수정 파일 재조회
  - 원문 ↔ 재조회 역대조 및 누락 0 검증
- HOLD/FAIL: 없음. 전수검증 미완료이므로 완료 판정 금지.
- 다음 실행 시작점: 분야별 원문에서 고객번호·데이터 스키마·스팸회피·추천자료·출력·링크/발행사·대화창 격리 규칙을 추출하여 GitHub 현행 조항과 1:1 대조
- 마지막 GitHub Commit SHA: 체크포인트 생성 커밋으로 갱신 예정
- 마지막 갱신시각: 2026-08-14 17:38 KST
