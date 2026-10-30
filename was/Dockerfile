# WebLogic 14.1.2 on Ubuntu 22.04
# installer/ 폴더에 Oracle에서 받은 WebLogic Generic 설치 파일(.jar 또는 .zip)을 넣고 빌드한다.
# 이 단계들은 AWS EC2(Ubuntu)에 직접 설치할 때도 같은 순서로 재사용한다.
FROM ubuntu:22.04

ENV ORACLE_HOME=/u01/oracle/wls \
    DOMAIN_HOME=/u01/oracle/user_projects/domains/base_domain \
    JAVA_HOME=/usr/lib/jvm/jdk-17 \
    PATH=/usr/lib/jvm/jdk-17/bin:$PATH \
    DEBIAN_FRONTEND=noninteractive

# 1) Oracle JDK 17 + 설치에 필요한 도구
#    WebLogic 설치 프로그램은 OpenJDK를 거부하므로 Oracle JDK를 사용
#    (17.0.12 = NFTC 무료 라이선스로 배포된 JDK 17 마지막 버전, ARM/x86 자동 선택)
ARG TARGETARCH
ARG JDK_VERSION=17.0.12
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl unzip \
 && rm -rf /var/lib/apt/lists/* \
 && case "$TARGETARCH" in arm64) JDK_ARCH=aarch64 ;; *) JDK_ARCH=x64 ;; esac \
 && mkdir -p "$JAVA_HOME" \
 && curl -fsSL "https://download.oracle.com/java/17/archive/jdk-${JDK_VERSION}_linux-${JDK_ARCH}_bin.tar.gz" \
    | tar -xz -C "$JAVA_HOME" --strip-components=1 \
 && java -version

# 2) WebLogic 전용 계정 (설치 프로그램은 root 실행을 거부함)
RUN groupadd oracle \
 && useradd -m -g oracle -s /bin/bash oracle \
 && mkdir -p /u01/oracle/properties /u01/oracle/scripts "$DOMAIN_HOME/autodeploy" \
 && chown -R oracle:oracle /u01

COPY --chown=oracle:oracle install.rsp oraInst.loc /tmp/

USER oracle

# 3) silent 설치 (Ubuntu는 공식 인증 OS가 아니라 사전 점검을 건너뜀)
#    설치 파일은 빌드 중에만 연결(bind mount)해서 이미지에 남기지 않음
RUN --mount=type=bind,source=installer,target=/tmp/installer \
    mkdir -p /tmp/wls-pkg && cd /tmp/wls-pkg \
 && if ls /tmp/installer/*.zip >/dev/null 2>&1; then unzip -q /tmp/installer/*.zip; fi \
 && JAR="$(ls /tmp/wls-pkg/*.jar /tmp/installer/*.jar 2>/dev/null | head -1)" \
 && if [ -z "$JAR" ]; then echo "installer/ 폴더에 WebLogic 설치 파일(.jar/.zip)이 없습니다" >&2; exit 1; fi \
 && java -jar "$JAR" -silent -ignoreSysPrereqs \
      -responseFile /tmp/install.rsp -invPtrLoc /tmp/oraInst.loc \
 && rm -rf /tmp/wls-pkg /tmp/OraInstall*

COPY --chown=oracle:oracle --chmod=755 create-domain.py start.sh /u01/oracle/scripts/

EXPOSE 7001
WORKDIR /u01/oracle

# 4) 컨테이너 시작 시 도메인이 없으면 생성 후 기동
CMD ["/u01/oracle/scripts/start.sh"]
