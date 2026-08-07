#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

SCRIPT_DIR="$(
  cd "$(dirname "${BASH_SOURCE[0]}")" \
  && pwd
)"

PROJECT_DIR="$(
  cd "$SCRIPT_DIR/.." \
  && pwd
)"

COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env"
BACKUP_ROOT="${BACKUP_ROOT:-$PROJECT_DIR/backups}"

TIMESTAMP="$(
  date -u +"%Y%m%dT%H%M%SZ"
)"

BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
DATABASE_BACKUP="$BACKUP_DIR/database.dump"
DOCUMENTS_BACKUP="$BACKUP_DIR/documents.tar.gz"
CHECKSUM_FILE="$BACKUP_DIR/SHA256SUMS"
METADATA_FILE="$BACKUP_DIR/metadata.txt"

COMPOSE=(
  docker compose
  --env-file "$ENV_FILE"
  --file "$COMPOSE_FILE"
)

SERVICES_STOPPED=false

restart_application() {
  if [ "$SERVICES_STOPPED" = "true" ]; then
    echo
    echo "Redémarrage de JobTrace..."

    "${COMPOSE[@]}" up \
      --detach \
      backend \
      frontend \
      >/dev/null \
      2>&1 \
    || true
  fi
}

trap restart_application EXIT INT TERM

fail() {
  echo "ÉCHEC — $1" >&2
  exit 1
}

create_checksums() {
  (
    cd "$BACKUP_DIR"

    if command -v sha256sum >/dev/null 2>&1; then
      sha256sum \
        database.dump \
        documents.tar.gz \
        > SHA256SUMS

      return
    fi

    if command -v shasum >/dev/null 2>&1; then
      shasum \
        -a 256 \
        database.dump \
        documents.tar.gz \
        > SHA256SUMS

      return
    fi

    fail "Aucun outil SHA-256 disponible."
  )
}

[ -f "$COMPOSE_FILE" ] \
  || fail "docker-compose.prod.yml est introuvable."

[ -f "$ENV_FILE" ] \
  || fail "Le fichier .env de production est introuvable."

command -v docker >/dev/null 2>&1 \
  || fail "Docker est introuvable."

docker info >/dev/null 2>&1 \
  || fail "Docker n'est pas disponible."

"${COMPOSE[@]}" config --quiet \
  || fail "La configuration Docker Compose est invalide."

for SERVICE in database backend frontend
do
  if ! "${COMPOSE[@]}" ps \
    --status running \
    --services \
    | grep \
        --quiet \
        --extended-regexp \
        "^${SERVICE}$"
  then
    fail "Le service ${SERVICE} n'est pas démarré."
  fi
done

mkdir -p "$BACKUP_DIR"

echo
echo "Sauvegarde JobTrace"
echo "Destination : $BACKUP_DIR"
echo
echo "1. Suspension temporaire des écritures..."

"${COMPOSE[@]}" stop \
  frontend \
  backend \
  >/dev/null

SERVICES_STOPPED=true

echo "Frontend et backend arrêtés."

echo
echo "2. Sauvegarde PostgreSQL..."

"${COMPOSE[@]}" exec \
  --no-TTY \
  database \
  sh -c '
    exec pg_dump \
      --username "$POSTGRES_USER" \
      --dbname "$POSTGRES_DB" \
      --format=custom
  ' \
  > "$DATABASE_BACKUP"

[ -s "$DATABASE_BACKUP" ] \
  || fail "La sauvegarde PostgreSQL est vide."

echo "Base de données sauvegardée."

echo
echo "3. Sauvegarde des documents..."

"${COMPOSE[@]}" run \
  --rm \
  --no-deps \
  --no-TTY \
  --entrypoint sh \
  backend \
  -c '
    exec tar \
      -czf - \
      -C /app/uploads/documents \
      .
  ' \
  > "$DOCUMENTS_BACKUP"

[ -s "$DOCUMENTS_BACKUP" ] \
  || fail "La sauvegarde des documents est vide."

echo "Documents sauvegardés."

echo
echo "4. Création des empreintes SHA-256..."

create_checksums

GIT_COMMIT="$(
  git \
    -C "$PROJECT_DIR" \
    rev-parse HEAD \
    2>/dev/null \
  || echo "unknown"
)"

cat > "$METADATA_FILE" <<META
created_at_utc=$TIMESTAMP
git_commit=$GIT_COMMIT
database_format=postgresql_custom
documents_format=tar_gzip
META

echo "Empreintes créées."

echo
echo "5. Redémarrage de JobTrace..."

"${COMPOSE[@]}" up \
  --detach \
  backend \
  frontend

SERVICES_STOPPED=false

echo
echo "Sauvegarde créée :"
echo
ls -lh \
  "$DATABASE_BACKUP" \
  "$DOCUMENTS_BACKUP" \
  "$CHECKSUM_FILE" \
  "$METADATA_FILE"

echo
echo "SAUVEGARDE RÉUSSIE — PostgreSQL et documents ont été sauvegardés."
