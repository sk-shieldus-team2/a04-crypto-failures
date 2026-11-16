# WebLogic 12.2.1.2.0 on Ubuntu 22.04, JDK 8 (멘토 제공)
# installer/ 에 fmw_12.2.1.2.0_wls_Disk1_1of1.(jar|zip),
# jdk/ 에 jdk1.8.0_511 폴더를 둔다.
# 이 단계들은 AWS EC2(Ubuntu)에 직접 설치할 때도 같은 순서로 재사용한다.
FROM ubuntu:22.04

ENV ORACLE_HOME=/u01/oracle/wls \
    DOMAIN_HOME=/u01/oracle/user_projects/domains/base_domain \
    JAVA_HOME=/u01/oracle/jdk8 \
    PATH=/u01/oracle/jdk8/bin:$PATH \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates unzip libaio1 \
 && rm -rf /var/lib/apt/lists/*

# WebLogic 전용 계정 (설치 프로그램은 root 실행을 거부)
RUN groupadd oracle \
 && useradd -m -g oracle -s /bin/bash oracle \
 && mkdir -p /u01/oracle/properties /u01/oracle/scripts "$DOMAIN_HOME/autodeploy" \
 && chown -R oracle:oracle /u01

# 멘토 JDK8 복사 (WebLogic 설치기는 Oracle JDK 요구 → 멘토 JDK8 사용)
COPY --chown=oracle:oracle jdk/jdk1.8.0_511/ /u01/oracle/jdk8/

COPY --chown=oracle:oracle install.rsp oraInst.loc /tmp/

USER oracle
RUN java -version

# silent 설치 (Ubuntu는 공식 인증 OS가 아니라 사전점검 건너뜀)
#   설치 파일은 빌드 중에만 bind mount 해서 이미지에 남기지 않음
RUN --mount=type=bind,source=installer,target=/tmp/installer \
    mkdir -p /tmp/wls-pkg && cd /tmp/wls-pkg \
 && if ls /tmp/installer/*.zip >/dev/null 2>&1; then unzip -q /tmp/installer/*.zip; fi \
 && JAR="$(ls /tmp/wls-pkg/*.jar /tmp/installer/*.jar 2>/dev/null | head -1)" \
 && if [ -z "$JAR" ]; then echo "installer/ 에 설치 파일(.jar/.zip)이 없습니다" >&2; exit 1; fi \
 && java -jar "$JAR" -silent -ignoreSysPrereqs \
      -responseFile /tmp/install.rsp -invPtrLoc /tmp/oraInst.loc \
 && rm -rf /tmp/wls-pkg /tmp/OraInstall*

COPY --chown=oracle:oracle --chmod=755 create-domain.py start.sh /u01/oracle/scripts/

EXPOSE 7001
WORKDIR /u01/oracle

# 컨테이너 시작 시 도메인이 없으면 생성 후 기동
CMD ["/u01/oracle/scripts/start.sh"]
