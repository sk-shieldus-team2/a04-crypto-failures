#!/bin/bash
set -e

PROPS=/u01/oracle/properties/domain.properties

# 도메인이 없을 때만 생성 (컨테이너를 새로 만들면 다시 생성됨)
if [ ! -f "$DOMAIN_HOME/config/config.xml" ]; then
  # 관리자 계정을 환경변수에서 받아 도메인 생성용 properties 파일을 만든다.
  : "${WLS_USERNAME:?WLS_USERNAME 환경변수가 필요합니다 (.env 확인)}"
  : "${WLS_PASSWORD:?WLS_PASSWORD 환경변수가 필요합니다 (.env 확인)}"
  mkdir -p "$(dirname "$PROPS")"
  printf 'username=%s\npassword=%s\n' "$WLS_USERNAME" "$WLS_PASSWORD" > "$PROPS"

  echo "[team2] WebLogic 도메인 생성 중..."
  "$ORACLE_HOME/oracle_common/common/bin/wlst.sh" /u01/oracle/scripts/create-domain.py
  if [ ! -f "$DOMAIN_HOME/config/config.xml" ]; then
    echo "[team2] 도메인 생성 실패 (위 WLST 로그 확인)" >&2
    exit 1
  fi

  # 기동 시 관리자 계정을 묻지 않도록 boot.properties 작성 (첫 기동 때 WebLogic이 암호화함)
  mkdir -p "$DOMAIN_HOME/servers/AdminServer/security"
  grep -E '^(username|password)=' "$PROPS" > "$DOMAIN_HOME/servers/AdminServer/security/boot.properties"

  # 평문 비밀번호 흔적 제거 (도메인 생성 후에는 필요 없음)
  rm -f "$PROPS"
fi

# WS-AT 엔드포인트 — 정식 배포(weblogic.Deployer). 시나리오 1 역직렬화 경로.
# autodeploy 방식은 이 환경에서 스캐너가 동작하지 않아 "좀비"로만 등록되므로,
# 서버 기동 후 백그라운드에서 정식 배포한다(config.xml에 등록 → 재기동에도 유지).
WSAT_SRC=/u01/oracle/wls/oracle_common/modules/com.oracle.webservices.wls.wsat-endpoints-impl.war
WSAT_WAR=/u01/oracle/wls-wsat.war
if [ -f "$WSAT_SRC" ]; then
  cp -f "$WSAT_SRC" "$WSAT_WAR"
  (
    . "$DOMAIN_HOME/bin/setDomainEnv.sh" >/dev/null 2>&1
    for i in $(seq 1 40); do
      sleep 6
      # 이미 배포돼 있으면(config.xml 자동복원 포함) 종료
      if java weblogic.Deployer -adminurl t3://localhost:7001 \
           -username "$WLS_USERNAME" -password "$WLS_PASSWORD" -listapps 2>/dev/null | grep -q wls-wsat; then
        break
      fi
      # 서버가 준비되면 정식 배포, 아직이면 다음 루프에서 재시도
      if java weblogic.Deployer -adminurl t3://localhost:7001 \
           -username "$WLS_USERNAME" -password "$WLS_PASSWORD" \
           -deploy -name wls-wsat -source "$WSAT_WAR" -targets AdminServer 2>/dev/null; then
        echo "[team2] WS-AT 정식 배포 완료"
        break
      fi
    done
  ) &
fi

exec "$DOMAIN_HOME/bin/startWebLogic.sh"
