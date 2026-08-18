# WIC 고객 안내 대화창 통합 공통마스터 — VERIFIED FINAL LOCK

## 0. 완료 판정 잠금
이 문서는 모든 분야 고객 안내·추천자료·메일 문안·중간안내서·최종안내서의 유일한 공통마스터다.

- `FINAL`, `LOCK`, `통합 완료`는 문구가 아니라 검증 상태를 뜻한다.
- 과거 관련 규칙 수집 → 항목별 대조 → 본문 반영 → GitHub 재조회 → 누락 0 확인이 끝나기 전에는 완료라고 표시하지 않는다.
- 사용자가 한 번 지적한 실패 유형은 즉시 이 문서에 흡수하고 같은 오류를 다시 사용자에게 확인시키지 않는다.
- 새 규칙은 별도 고객 안내 규칙문서를 만들지 않고 이 문서에만 통합한다.
- 최신 사용자 직접 지시가 항상 최우선이다.

## 1. 규칙 우선순위
1. 사용자의 가장 최근 직접 지시·제외·허용 조건
2. 이 `UNIFIED_CUSTOMER_GUIDANCE_RULES.md`
3. 공통 고객 DB·발송이력·거래 발행사 데이터
4. 과거 분야별 지시문·대화기록·구버전 문서

## 2. 역할 경계
### 이메일 수집/검증
- 고객 발굴
- 기관/부서/이름/직책/이메일 검증
- 고객 DB 구축
- 발송표 정렬

### 고객 안내 통합
- 검증 고객의 실제 업무축 판단
- 과거 문의·견적·구매·회신 이력 확인
- 추천자료 선정
- 메일 제목·이메일 주소·필요 문안 작성
- 중간안내서/최종안내서 데이터 작성
- 발송용 최종 출력

이미 검증된 고객 이메일·이름·직책을 임의 추정·수정하지 않는다.
고객 안내는 신규 인력 탐색이나 신규 이메일 추정을 수행하지 않는다.

## 3. 고객 필드
공통 기본 필드는 다음 순서를 기준으로 한다.
- 고객번호/등록번호
- 기관
- 부서
- 이름
- 직책
- 담당업무
- 연구/사업 키워드
- 이메일
- 전화
- 검증결과
- 과거 문의/견적/구매/회신 이력
- 추가 메모

고객번호는 고객→추천자료→안내서→발송이력까지 유지한다.
입력값이 비어 있으면 추정하지 않고 공란 또는 HOLD로 둔다.

## 4. 시작점·중복·발송이력
- 고객번호 + 이름 + 이메일을 기본 중복키로 사용한다.
- 이미 발송한 고객과 보고서는 중복 차단한다.
- 사용자가 특정 고객부터 다시 작업하라고 하면 그 고객부터 시작하고 임의로 다음 고객으로 건너뛰지 않는다.
- 이전 대화창의 마지막 실제 작업지점이 지정되면 그 지점을 최우선 시작점으로 사용한다.
- 같은 고객에게 이미 제시한 동일 자료는 재추천하지 않는다.

## 5. 고객 판단 순서
1. 기관 실제 산업·사업 맥락
2. 기관의 현재 프로젝트·사업축
3. 고객 회사/기관 최신 사업·제품·연구·투자·조직 방향
4. 부서 기능
5. 실제 담당업무
6. 연구/사업 키워드
7. 과거 실제 문의·견적·구매·회신
8. 사용자 원문·추가 메모

### 금지
- 부서명 한 단어만 보고 일반 교육·관리·소프트웨어 보고서 추천
- 산업 일반론만으로 추천
- 일방 발송 이력을 실제 관심 이력보다 우선
- 고객 업무와 넓게만 겹치는 자료 추천

과거 실제 문의·구매·견적·회신은 일방 안내보다 우선한다.

### 5-A. 고객 방향 카드 / 제외축 정밀 필터 — 필수 내부 게이트
추천자료를 찾기 전에 고객마다 내부적으로 다음 6축을 고정한다.
1. 기관 산업축
2. 부서 기능축
3. 실제 담당업무축
4. 현재 연구·사업축
5. 향후 관심 방향축
6. 제외축

각 고객 카드에는 다음을 분리해 기록한다.
- 반드시 포함되어야 할 산업·기술 키워드
- 제외해야 할 비관련 산업·기술 키워드
- 담당업무에서 직접 연결되는 보고서 주제
- 담당업무와 연결되면 안 되는 보고서 주제

후보 보고서는 제목만 보지 않고 해당 상세페이지의 소개문, 목차, 핵심 세그먼트, 적용산업까지 고객 방향 카드와 대조한다.
선별은 `기관 산업 → 부서 기능 → 담당업무 → 세부 키워드 → 제외 키워드` 순서의 screen-out 필터로 수행한다.
- 제외 키워드나 연결 금지 주제에 걸리면 제목이 비슷해도 후보에서 제거한다.
- 포함 키워드가 약하고 넓은 산업 일반론만 겹치면 PASS하지 않는다.
- 제외축은 §5의 기존 판단 순서와 §6~§10의 검증을 대체하지 않고 추가 정밀 필터로 적용한다.

## 6. 추천자료 기본 3종
1. 핵심 맞춤 자료
2. 같은 기술/산업축의 유사 확장 자료
3. 기관 맥락에 직접 연결되는 안전 공통 자료

- 검증 가능한 후보를 다시 탐색해 3종 구성을 우선하되, 직접성·거래 발행사·상세페이지 검증 조건을 충족하지 못하면 억지로 채우지 않고 고객 작업을 HOLD한다.
- 같은 고객 안에서 동일·유사 보고서 중복 금지.
- 여러 고객에게 동일한 3종 세트 반복 금지.
- 가능한 범위에서 서로 다른 거래 발행사 사용.

## 7. 거래 발행사 공통 풀
기본 거래·사용 풀:
alliedmarketresearch.com, QY Research, Markets and Markets, BCC Research, Research in China, Technavio, Future Markets, RNCOS, Transparency Market Research, GlobalData, INKWOOD Research, Accuray Research, GlobalInfo Research, KBV Research, Coherent Market Insights, Grand View Research, Kuick Research, Prismane Consulting, Mordor Intelligence, Lucintel, Prof Research, AnalystView Market Insights, Bizwit Research & Consulting, Blueweave Consulting, Vantage Market Research, DataM Intelligence, Zion Market Research, Koncept Analytics, LP Information, Market Monitor Global, WishTree Insight, 99Strategy, Maia Research, The Insight Partners, Hny Research, MultiMarket Insight, Introspective Market Research, Stratview Research, 360iResearch, P&S Intelligence, Stats Market Research, Data Bridge Market Research, Fortune Business Insights, Reports And Data, Rethink Technology Research, Azoth Analytics, Global Market Insights, Orion Market Research, Global Industry Analysts, Next Move Strategy Consulting, Persistence Market Research, Stratistics MRC, Verified Market Research, Cognitive Market Research, Credence Research, ReAnIn Research, IndustryARC, Market Research Future, BIS Research, SkyQuest Technology, MIReports, LogisticsIQ, M14 Intelligence, Wharry Sharpe Research, Straits Research, Asia Pacific InfoServ, Reports and Insights, InsightAce Analytic, VPA Research, n-tech Research, Evolve Business Intelligence, Zhar Research, Industry Experts, market.us, Cervicorn Consulting, Acumen Research, MarkNtel Advisors, UnivDatos Market Insights.

### 운용
- 최신 사용자 제외 지시 우선.
- 위 고정 거래·사용 풀 밖의 발행사 자료는 고객 추천용 PASS로 사용하지 않고 즉시 제외한다. 사용자가 별도로 거래 가능하다고 확정한 경우에만 풀 갱신 후 사용한다.
- 명시 제외 발행사/유통사는 `Research and Markets`, `Market Reports World`, `Intel Market Research`, `IDTechEx`이며 고객 추천용으로 사용하지 않는다.
- `Research and Markets` 등 단순 유통/집계 사이트는 발행사로 취급하지 않는다.
- `Future Markets`와 `Future Market Insights`는 서로 다른 명칭이므로 혼동하거나 대체하지 않는다. 고정 풀에 있는 `Future Markets`만 해당 이름 그대로 적용하며, `Future Market Insights`를 자동 포함하지 않는다.
- 특정 2~3개 발행사 편중 금지.
- 가능한 경우 고객 1명당 3개 자료를 서로 다른 발행사로 분산.
- 거래 여부 불명은 HOLD가 아니라 고객 추천 후보에서 제외하고, 별도 거래확인 대상으로만 남긴다.
- Industry Experts는 PDF brochure/article 링크가 아니라 보고서 HTML 상세페이지를 우선한다.

## 8. 선택 우선순위
1. 고객 직접성
2. 실제 상세페이지 검증
3. 최신 발행일
4. 발행사 분산
5. 재사용·중복 위험

최신이라는 이유만으로 직접성이 약한 자료를 올리지 않는다.
- 기본 추천 자료유형은 해외 시장보고서를 우선한다.
- 공학도서·기술도서는 고객이 도서를 직접 요청했거나, 동일 주제의 검증 가능한 해외 시장보고서가 없고 기초원리·설계·공정 등 기술심화 자료가 고객 목적에 더 직접적인 경우에만 보조 후보로 사용한다.
- 국내 보고서는 사용자가 국내 자료를 명시적으로 요청한 경우에만 별도 분리하며, 일반 고객 안내 추천에서는 우선 후보로 사용하지 않는다.

## 9. 보고서 상세페이지 원문 전용 규칙 — 최상위 잠금
고객 안내용 보고서 데이터는 **해당 발행사의 실제 보고서 상세페이지에 현재 표시된 내용만** 사용한다.

허용:
- 실제 영문 제목
- 공식 한글 제목이 페이지에 있는 경우 그 제목
- 발행사
- 페이지 수
- 정가/라이선스 가격
- 발행일
- PDF 표시
- 같은 상세페이지의 Overview / Highlights / Segmentation / Table of Contents 등 공개 내용

금지:
- 검색결과 요약으로 값 확정
- 모델 지식으로 보충
- 다른 리셀러/사이트 값 혼합
- 임의 한글 번역을 공식 제목처럼 표시
- 임의 가격·페이지·발행일·목차 생성
- 보고서 페이지에 없는 설명을 보고서 내용처럼 표시
- 다른 보고서 목차 사용

페이지에 없는 값은 공란 또는 `확인 필요`로 둔다.

### 공급가격
공급가격은 발행사 페이지 원문 값이 아니라 내부 계산값이다. 사용자가 공급가격 계산을 명시적으로 요구하거나 별도 내부 가격규칙을 호출한 경우에만 계산한다. 그 외에는 공란/확인 필요.

## 10. 보고서 검증 게이트
각 자료마다 다음을 통과해야 한다.
- 실제 발행사 상세페이지 존재
- 출력 영문 제목 = 상세페이지 제목
- 발행사 일치
- 링크 정상
- 다른 보고서로 리디렉션되지 않음
- 발행일/페이지/가격은 페이지 표시값만 사용
- 공개 콘텐츠/목차는 같은 보고서 페이지에서 확인

하나라도 불명확하면 PASS 금지.

## 11. CUSTOMER_LINK_SANITIZE_GATE
고객에게 보이는 URL은 발행사 원문 상세페이지의 순수 URL이어야 한다.

제거/금지:
utm_source, utm_medium, utm_campaign, utm_term, utm_content, fbclid, gclid, mc_cid, mc_eid, _ga, _gl, chatgpt.com 관련 문자열, 검색엔진/리디렉션 중간 URL.

`?utm_source=chatgpt.com` 등 검색 흔적이 고객용 출력에 남으면 FAIL.

## 12. 고객별 최종 출력 시작 순서 — 절대 고정
실제 고객 작업 결과는 반드시 다음 두 줄로 시작한다.

`메일 제목: [해외시장자료 안내] {기관} {이름}님`
`이메일 주소: {검증된 실제 이메일}`

- 사용자가 다른 제목 형식을 직접 지정하면 최신 지시 적용.
- 이메일 추정 금지.

## 13. 안내서 직접 붙여넣기 순서 — 절대 고정
추천자료 1 → 2 → 3 순으로 아래 블록 반복.

### 추천자료 N
1. 영문 제목
2. 한글 제목
3. 도서정보 전체 형식
4. 자세한 내용의 링크
5. 중간안내서용 공식 공개 콘텐츠 또는 최종안내서용 실제 목차

### 도서정보 원본 형식
`◇ 발행사: {발행사} ({페이지} Pages)    ◇ 정가: {정가}`
`◇ 발행일: {발행일} -PDF-    ◆ 공급가격: {공급가격}`

- `◇`, `◆`, `-PDF-`, 통화기호 등 원본 기호 유지.
- 상세페이지에 없는 값 임의 생성 금지.
- 사용자가 데이터만 원하면 새 표 대신 위 순서의 순수 텍스트 블록 제공.

## 14. 한글 제목
- 상세페이지에 공식 한글 제목이 있으면 그대로 사용.
- 공식 한글 제목이 없고 사용자가 `페이지에 있는 내용만`을 요구하면 임의 번역 금지.
- 별도 번역 요청이 있을 때만 `참고 번역`으로 분리.

## 15. 중간안내서
- 예비 고객용.
- 실제 월드산업정보센터 원본 양식 사용.
- 목차는 넣지 않는다.
- 상세페이지의 Overview, Key Highlights, Market Segmentation, 적용분야, 주요 기업, 시장전망 등 실제 공개 콘텐츠만 사용.
