@echo off

@REM set IMAGE=hubporn.ldblao.la/mobile-division/biz-admin-prod
set IMAGE=registry.ldblao.la/mobile-dev/edlautodebit


set VERSION=%1

if defined VERSION GOTO :version_arg_exists

set VERSION=latest

:version_arg_exists

echo Building image: %IMAGE%:prod-%VERSION%

docker build -t %IMAGE%:prod-%VERSION% -f Dockerfile.prod .
docker push %IMAGE%:prod-%VERSION%