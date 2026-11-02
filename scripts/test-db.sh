#!/usr/bin/env bash
# Vérifie la migration et le seed sur un PostgreSQL local jetable (sans Supabase).
set -euo pipefail
cd "$(dirname "$0")/.."
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
DIR=.tmp-pg; PORT=54329
# PostgreSQL refuse de tourner en root : on passe par l'utilisateur « postgres » si besoin
RUN=(); if [ "$(id -u)" = 0 ]; then RUN=(runuser -u postgres --); fi
rm -rf "$DIR"; mkdir -p "$DIR"; [ ${#RUN[@]} -gt 0 ] && chown postgres "$DIR"
"${RUN[@]}" "$BIN/initdb" -D "$DIR" -A trust -U postgres >/dev/null
"${RUN[@]}" "$BIN/pg_ctl" -D "$DIR" -o "-p $PORT -k /tmp" -l "$DIR/log" -w start >/dev/null
trap '"${RUN[@]}" "$BIN/pg_ctl" -D "$DIR" -m fast stop >/dev/null; rm -rf "$DIR"' EXIT
PSQL="psql -h /tmp -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
# rôles qui existent sur Supabase
$PSQL -c "create role anon; create role authenticated; create role service_role bypassrls;"
for f in supabase/migrations/*.sql; do $PSQL -f "$f"; done
$PSQL -f supabase/seed.sql
$PSQL -f scripts/test-db.sql
echo "Base de données : OK"
