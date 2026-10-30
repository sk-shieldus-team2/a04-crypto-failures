# -*- coding: utf-8 -*-
# WLST(offline) 도메인 생성 스크립트
# - 관리자 계정: /u01/oracle/properties/domain.properties
# - 데이터소스(jdbc/team2DS): 환경변수 DB_URL, APP_USER, APP_USER_PASSWORD
import os

props = {}
for line in open('/u01/oracle/properties/domain.properties'):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        k, v = line.split('=', 1)
        props[k.strip()] = v.strip()

# wlst.sh가 ORACLE_HOME을 .../oracle_common 으로 바꿔서 넘기므로 상위 폴더로 보정
oracle_home = os.environ['ORACLE_HOME']
if os.path.basename(oracle_home) == 'oracle_common':
    oracle_home = os.path.dirname(oracle_home)
domain_home = os.environ['DOMAIN_HOME']

readTemplate(oracle_home + '/wlserver/common/templates/wls/wls.jar')

# 관리자 계정
cd('/Security/base_domain/User/weblogic')
cmo.setName(props['username'])
cmo.setPassword(props['password'])

# AdminServer: 모든 인터페이스의 7001
cd('/Servers/AdminServer')
set('ListenAddress', '')
set('ListenPort', 7001)

# Oracle 데이터소스 (웹 담당은 JNDI 이름 jdbc/team2DS 로 사용)
ds = 'team2DS'
cd('/')
create(ds, 'JDBCSystemResource')
cd('/JDBCSystemResource/' + ds + '/JdbcResource/' + ds)
create('dsParams', 'JDBCDataSourceParams')
cd('JDBCDataSourceParams/NO_NAME_0')
set('JNDIName', 'jdbc/' + ds)
set('GlobalTransactionsProtocol', 'None')

cd('/JDBCSystemResource/' + ds + '/JdbcResource/' + ds)
create('drvParams', 'JDBCDriverParams')
cd('JDBCDriverParams/NO_NAME_0')
set('DriverName', 'oracle.jdbc.OracleDriver')
set('URL', os.environ['DB_URL'])
set('PasswordEncrypted', os.environ['APP_USER_PASSWORD'])
create('dsProps', 'Properties')
cd('Properties/NO_NAME_0')
create('user', 'Property')
cd('Property/user')
cmo.setValue(os.environ['APP_USER'])

cd('/JDBCSystemResource/' + ds + '/JdbcResource/' + ds)
create('poolParams', 'JDBCConnectionPoolParams')
cd('JDBCConnectionPoolParams/NO_NAME_0')
set('TestTableName', 'SQL SELECT 1 FROM DUAL')
set('InitialCapacity', 0)   # DB가 늦게 떠도 서버 기동이 실패하지 않도록

assign('JDBCSystemResource', ds, 'Target', 'AdminServer')

# 개발 모드: autodeploy 폴더 자동 배포 사용
setOption('ServerStartMode', 'dev')
setOption('OverwriteDomain', 'true')
writeDomain(domain_home)
closeTemplate()
exit()
