#!/bin/sh
# docker-entrypoint.sh
#
# Substitutes __BACKEND_URL__ placeholder in nginx config with the
# BACKEND_URL environment variable, then starts nginx.
#
# Usage:
#   docker run -e BACKEND_URL=http://backend-server:8080 ...

set -e

# Default backend URL if not provided (host:port only, no protocol)
BACKEND_URL="${BACKEND_URL:-10.0.4.102:31852}"

# Strip any http:// or https:// prefix if user accidentally included it
# (nginx.conf adds http:// itself via the __BACKEND_URL__ placeholder)
BACKEND_URL="${BACKEND_URL#http://}"
BACKEND_URL="${BACKEND_URL#https://}"

# Substitute __BACKEND_URL__ in nginx config template
sed "s#__BACKEND_URL__#${BACKEND_URL}#g" \
  /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Start nginx
exec "$@"
