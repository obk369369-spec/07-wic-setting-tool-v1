# WIC CUSTOMER RULE SOURCE

모든 이메일 수집 대화창, 모든 고객 안내 대화창, 7번 고객 컨택 판단, 1번 고객 자동화 안내서의 고객업무 공통 규칙은 아래 중앙 고객업무 마스터를 우선 사용한다.

- 중앙 고객업무 마스터: `obk369369-spec/20-operational-manual-viewer/CUSTOMER_WORKFLOW_MASTER.md`
- 범용 이메일 수집·검증·유선연락·발송정렬 실행규칙: `obk369369-spec/20-operational-manual-viewer/EMAIL_COLLECTION_COMMON_RULES.md`
- 중앙 거래 발행사 고정 풀: `obk369369-spec/20-operational-manual-viewer/CUSTOMER_PUBLISHER_MASTER.md`
- 중앙 고객업무 피드백 수집함: `obk369369-spec/20-operational-manual-viewer/CUSTOMER_RULE_FEEDBACK_INBOX.md`
- 상위 단일 운영원본: `obk369369-spec/20-operational-manual-viewer/WIC_GLOBAL_OPERATING_RULES.md`

운영 원칙:
- 공통 규칙을 산업별 대화창/저장소에 복제하지 않는다.
- 이메일 수집 작업은 반드시 `CUSTOMER_WORKFLOW_MASTER.md`와 `EMAIL_COLLECTION_COMMON_RULES.md`를 함께 읽고 적용한다.
- 이메일 수집 결과를 고객 안내 대화창으로 넘기기 전, `EMAIL_COLLECTION_COMMON_RULES.md`의 중복검사와 유선연락→안내서 발송용 회피정렬 검사를 반드시 통과한다.
- 동일 기관 최소 3행, 동일 부서 최소 4행, 동일 도메인 기본 최소 5행 간격 및 동일 도메인 재사용 전 다른 도메인 최소 2개 삽입을 강제한다.
- 기관/도메인 분산 후보가 부족하면 규칙을 깨서 출력하지 않고 후보풀을 추가 수집한다.
- 산업별 대화창은 산업 고유 키워드·예외만 중앙 마스터의 산업별 예외 레지스트리에 추가한다.
- 고객장부 기존 고객의 재연락 판단은 중앙 마스터의 7번 규칙을 사용한다.
- 추천자료 작업 전 중앙 거래 발행사 고정 풀을 반드시 읽고, 고정 풀 밖 발행사는 고객 발송용 PASS로 사용하지 않는다.
- 각 대화창에서 사용자가 확정한 중요한 피드백은 중앙 피드백 수집함에 즉시 기록하고, 기존 규칙과 충돌검사 후 공통규칙 또는 분야예외로 승격한다.
- 고객용 중간안내서의 보고서 설명은 발행사 공식 페이지의 시장전망·세그먼트·적용산업·주요 내용·목차 정보를 중립적으로 요약/번역한다. 내부 추론이나 GPT식 고객 맞춤 해설 표시는 고객 발송용 블록에서 제거한다.
- GitHub 문서를 실제로 읽지 않은 상태에서 적용 완료라고 보고하지 않는다.
