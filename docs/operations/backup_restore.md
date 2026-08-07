# JobTrace — Backup and restore

This document describes the production backup and restore procedure for JobTrace.

## Scope

JobTrace stores persistent data in two locations:

- PostgreSQL for application and user data.
- The Docker document volume for uploaded files.

A complete backup must contain both.

## Backup strategy

The production backup script temporarily stops the frontend and backend before creating the backup.

PostgreSQL remains running while `pg_dump` is executed.

Stopping the application prevents writes during the operation and keeps the database and uploaded documents consistent with each other.

The generated backup contains:

```text
backups/
└── YYYYMMDDTHHMMSSZ/
    ├── database.dump
    ├── documents.tar.gz
    ├── metadata.txt
    └── SHA256SUMS
```

- `database.dump` is created using PostgreSQL's custom dump format.
- `documents.tar.gz` contains the complete document upload volume.
- `SHA256SUMS` allows the integrity of both archives to be checked before restoration.

## Create a backup

Run the command from the project root on the production server:

```bash
./scripts/backup-production.sh
```

The default destination is:

```text
./backups/
```

A different destination can be specified with `BACKUP_ROOT`:

```bash
BACKUP_ROOT=/var/backups/jobtrace ./scripts/backup-production.sh
```

The frontend and backend are automatically restarted when the backup finishes.

They are also restarted if the backup fails after they have been stopped.

## Restore a backup

Restoration replaces the current database and uploaded documents.

It is therefore intentionally protected by the required `--confirm` argument.

Example:

```bash
./scripts/restore-production.sh \
  backups/20260807T080000Z \
  --confirm
```

Before restoring data, the script:

1. Checks that the backup files exist.
2. Validates their SHA-256 checksums.
3. Stops the frontend and backend.
4. Restores PostgreSQL.
5. Replaces the document volume contents.
6. Restarts the application.

## Validation

The backup strategy was tested with PostgreSQL 17.

The database validation included:

- Creation of a PostgreSQL custom-format dump.
- Validation of the dump with `pg_restore`.
- Restoration into a clean PostgreSQL instance.
- Verification of restored application data.
- Verification of Prisma migration history.

The document backup validation included:

- Creation of multiple test files.
- Archive creation.
- Restoration into a clean Docker volume.
- SHA-256 comparison before and after restoration.

The restored document hashes were identical to the originals.

## Security

Backups contain user data and uploaded documents.

They must therefore be treated as sensitive data.

Recommended precautions:

- Restrict access to the backup directory.
- Do not commit backup archives to Git.
- Keep the production `.env` outside Git.
- Encrypt backups when stored outside the server.
- Keep at least one copy outside the VPS.
- Remove obsolete backups according to the chosen retention policy.

The backup scripts use restrictive permissions for newly created backup files.

## Disaster recovery

A backup stored only on the same VPS does not protect against complete server loss.

Production backups should therefore be copied to separate storage after creation.

A recovery procedure should restore:

1. The JobTrace source code.
2. The production environment configuration.
3. The PostgreSQL backup.
4. The document archive.
5. The reverse proxy and HTTPS configuration.

After restoration, the application health endpoints should be checked:

```text
/api/health
/api/health/db
```
