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

exec "$DOMAIN_HOME/bin/startWebLogic.sh"
