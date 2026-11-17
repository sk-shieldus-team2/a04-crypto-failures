WebLogic 12.2.1.4.0 Generic 설치 파일(fmw_12.2.1.4.0_wls.jar 또는 zip)이 들어가는 폴더입니다.

진입 CVE: CVE-2023-21839 (T3/IIOP 역직렬화 RCE). 영향 버전 12.2.1.3.0 / 12.2.1.4.0 / 14.1.1.0.0.
(기존 12.2.1.2.0 + CVE-2017-10271 WS-AT 경로는 헤더 검증으로 재현 불가 → 전환.
 12.2.1.3.0은 OTN에 없고 eDelivery는 export 심사로 지연되어, 둘 다 취약한 12.2.1.4.0을 사용.)

- 다운로드(OTN, oracle.com 로그인 필요):
  https://www.oracle.com/middleware/technologies/weblogic-server-installers-downloads.html
  → 맨 아래 "WebLogic Server 12.2.1.4" → Generic (약 885MB)
- zip 그대로 넣어도 되고, 압축 푼 .jar만 넣어도 됩니다.
- Dockerfile이 installer/*.jar, *.zip 을 자동으로 찾으므로 파일명은 상관없습니다.
- 팀 외부(다른 팀, GitHub 등)로는 공유하지 마세요.
