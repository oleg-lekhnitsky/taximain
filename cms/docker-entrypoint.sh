#!/bin/sh
set -eu
# The entire public directory persists, so Strapi can rename uploads for backups.
mkdir -p /app/public/uploads
exec npm start
