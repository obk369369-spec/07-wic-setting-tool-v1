# WIC CUSTOMER RULE SOURCE

모든 이메일 수집 대화창, 모든 고객 안내 대화창, 7번 고객 컨택 판단, 1번 고객 자동화 안내서의 고객업무 공통 규칙은 아래 중앙 고객업무 마스터를 우선 사용한다.

- 중앙 고객업무 마스터: `obk369369-spec/20-operational-manual-viewer/CUSTOMER_WORKFLOW_MASTER.md`
- 상위 단일 운영원본: `obk369369-spec/20-operational-manual-viewer/WIC_GLOBAL_OPERATING_RULES.md`

운영 원칙:
- 공통 규칙을 개별 대화창/저장소에 복제하지 않는다.
- 산업별 대화창은 산업 고유 키워드·예외만 중앙 마스터의 산업별 예외 레지스트리에 추가한다.
- 고객장부 기존 고객의 재연락 판단은 중앙 마스터의 7번 규칙을 사용한다.
- GitHub 문서를 실제로 읽지 않은 상태에서 적용 완료라고 보고하지 않는다.
