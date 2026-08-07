#!/usr/bin/env bash

set -Eeuo pipefail

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

COMPOSE=(
  docker compose
  --env-file "$ENV_FILE"
  --file "$COMPOSE_FILE"
)

SERVICES_STOPPED=false

usage() {
  echo "Usage:"
  echo "  ./scripts/restore-production.sh <backup-directory> --confirm"
}

fail() {
  echo "ÉCHEC — $1" >&2
  exit 1
}

restart_application() {
  if [ "$SERVICES_STOPPED" = "true" ]; then
    echo
    echo "Tentative de redémarrage de JobTrace..."

    "${COMPOSE[@]}" up \
      --detach \
      backend \
      frontend \
      >/dev/null \
      2>&1 \
    || true
  fi
}

verify_checksums() {
  (
    cd "$BACKUP_DIR"

    if command -v sha256sum >/dev/null 2>&1; then
      sha256sum \
        --check SHA256SUMS

      return
    fi

    if command -v shasum >/dev/null 2>&1; then
      shasum \
        -a 256 \
        --check SHA256SUMS

      return
    fi

    fail "Aucun outil SHA-256 disponible."
  )
}

trap restart_application EXIT INT TERM

if [ "$#" -ne 2 ]; then
  usage
  exit 1
fi

if [ "$2" != "--confirm" ]; then
  echo "La restauration est destructive."
  usage
  exit 1
fi

if [ ! -d "$1" ]; then
  fail "Le dossier de sauvegarde est introuvable."
fi

BACKUP_DIR="$(
  cd "$1" \
  && pwd
)"

DATABASE_BACKUP="$BACKUP_DIR/database.dump"
DOCUMENTS_BACKUP="$BACKUP_DIR/documents.tar.gz"
CHECKSUM_FILE="$BACKUP_DIR/SHA256SUMS"

[ -f "$COMPOSE_FILE" ] \
  || fail "docker-compose.prod.yml est introuvable."

[ -f "$ENV_FILE" ] \
  || fail "Le fichier .env de production est introuvable."

[ -s "$DATABASE_BACKUP" ] \
  || fail "database.dump est introuvable ou vide."

[ -s "$DOCUMENTS_BACKUP" ] \
  || fail "documents.tar.gz est introuvable ou vide."

[ -s "$CHECKSUM_FILE" ] \
  || fail "SHA256SUMS est introuvable ou vide."

command -v docker >/dev/null 2>&1 \
  || fail "Docker est introuvable."

docker info >/dev/null 2>&1 \
  || fail "Docker n'est pas disponible."

"${COMPOSE[@]}" config --quiet \
  || fail "La configuration Docker Compose est invalide."

if ! "${COMPOSE[@]}" ps \
  --status running \
  --services \
  | grep \
      --quiet \
      '^database$'
then
  fail "Le service database n'est pas démarré."
fi

echo
echo "Restauration JobTrace"
echo "Source : $BACKUP_DIR"

echo
echo "1. Vérification des empreintes..."

verify_checksums

echo "Archives valides."

echo
echo "2. Arrêt du frontend et du backend..."

"${COMPOSE[@]}" stop \
  frontend \
  backend \
  >/dev/null \
  2>&1 \
|| true

SERVICES_STOPPED=true

echo "Services applicatifs arrêtés."

echo
echo "3. Restauration PostgreSQL..."

"${COMPOSE[@]}" exec \
  --no-TTY \
  database \
  sh -c '
    exec pg_restore \
      --username "$POSTGRES_USER" \
      --dbname "$POSTGRES_DB" \
      --clean \
      --if-exists \
      --no-owner \
      --no-privileges \
      --exit-on-error
  ' \
  < "$DATABASE_BACKUP"

echo "Base de données restaurée."

echo
echo "4. Restauration des documents..."

"${COMPOSE[@]}" run \
  --rm \
  --no-deps \
  --no-TTY \
  --entrypoint sh \
  backend \
  -c '
    rm -rf \
      /app/uploads/documents/* \
      /app/uploads/documents/.[!.]* \
      /app/uploads/documents/..?* \
      2>/dev/null \
    || true

    exec tar \
      -xzf - \
      -C /app/uploads/documents
  ' \
  < "$DOCUMENTS_BACKUP"

echo "Documents restaurés."

echo
echo "5. Redémarrage de JobTrace..."

"${COMPOSE[@]}" up \
  --detach \
  backend \
  frontend

SERVICES_STOPPED=false

echo
echo "État des services :"
echo

"${COMPOSE[@]}" ps

echo
echo "RESTAURATION RÉUSSIE — PostgreSQL et documents ont été restaurés."
