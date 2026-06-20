# JobTrace Back-end: manual validation

This document tracks the manual validation of the JobTrace backend API.
<br>
The goal is to verify the main user flows before considering the backend stable.

## Environment

- Backend: `Node.js` / `Express`.
- Database: `PostgreSQL`.
- ORM: `Prisma 6`.
- Authentication: `JWT`.
- Password hashing: `bcrypt`.
- Email sending: `SMTP` with `Nodemailer`.
- Local orchestration: `Docker Compose`.

To display the JSON response from a `curl` command in a readable format, it is recommended to use `jq`.

Install `jq` if it is not already available:

```bash
apt install jq -y
```

Then add `| jq` at the end of any `curl` command that returns JSON:

```bash
curl -s http://localhost:4000/api/health | jq
```

This will format the JSON response and make it easier to read in the terminal.

## Test user

Main test account:

* Email: `jobtrace.app@gmail.com`.
* Password: set locally with `JOBTRACE_PASSWORD`.

> The test password must be set locally before running the validation commands.
> It must not be confused with the Gmail account password or the Gmail application password.
> It must not be committed in the repository.

## Test variables

During validation, the following shell variables may be used:

* `JOBTRACE_EMAIL`: email of the main test account.
* `JOBTRACE_PASSWORD`: current password of the main test account.
* `JOBTRACE_NEW_PASSWORD`: temporary password used during password update validation.
* `TOKEN`: JWT of the authenticated test user.
* `EMAIL_VERIFICATION_TOKEN`: token received in the email verification link.
* `PASSWORD_RESET_TOKEN`: token received in the password reset link.
* `DELETE_ACCOUNT_EMAIL`: email of the temporary account used for deletion validation.
* `DELETE_ACCOUNT_PASSWORD`: password of the temporary account used for deletion validation.
* `DELETE_ACCOUNT_TOKEN`: JWT of the temporary account used for deletion validation.

Example:

```bash
JOBTRACE_EMAIL="jobtrace.app@gmail.com"
JOBTRACE_PASSWORD="PASTE_A_LOCAL_TEST_PASSWORD_HERE"
JOBTRACE_NEW_PASSWORD="PASTE_A_SECOND_LOCAL_TEST_PASSWORD_HERE"
TOKEN="PASTE_THE_TOKEN_HERE"

EMAIL_VERIFICATION_TOKEN="PASTE_THE_EMAIL_VERIFICATION_TOKEN_HERE"
PASSWORD_RESET_TOKEN="PASTE_THE_PASSWORD_RESET_TOKEN_HERE"

DELETE_ACCOUNT_EMAIL="jobtrace.app+delete@gmail.com"
DELETE_ACCOUNT_PASSWORD="PASTE_A_TEMPORARY_TEST_PASSWORD_HERE"
DELETE_ACCOUNT_TOKEN="PASTE_THE_DELETE_ACCOUNT_TOKEN_HERE"
```

## Prerequisites

From the project root, PostgreSQL must be running.

If Docker is managed from the host machine:

```bash
docker compose up -d database
```

From the backend directory, the API can be started with:

```bash
npm run dev
```

The API should start on port `4000`.

The local `.env` file must contain a valid SMTP configuration. <br>
The `.env` file must not be committed.

## 1. Health checks

### GET `/api/health`

#### Goal

Verify that the API server is running.

#### Command to run

```bash
curl -s http://localhost:4000/api/health | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "API is running.",
  "data": {
    "status": "ok"
  }
}
```

Status: ✅

### GET `/api/health/db`

#### Goal

Verify that the API can connect to the PostgreSQL database through Prisma.

#### Command to run

```bash
curl -s http://localhost:4000/api/health/db | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Database connection is working.",
  "data": {
    "status": "ok"
  }
}
```

Status: ✅

## 2. Error handling

### Unknown route

#### Goal

Verify that an unknown route returns a clean and consistent API error response.

#### Command to run

```bash
curl -s http://localhost:4000/api/unknown | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Route not found.",
  "errors": []
}
```

Status: ✅

## 3. Prisma checks

### Migration status

#### Goal

Verify that the database schema is synchronized with the Prisma migration history.

#### Command to run

From the backend directory:

```bash
npm run prisma:status
```

#### Expected result

The database schema should be up to date with the local migrations.

Example:

```text
Database schema is up to date!
```

Status: ✅

### Prisma Client generation

#### Goal

Verify that Prisma Client can be generated successfully from the current schema.

#### Command to run

From the backend directory:

```bash
npm run prisma:generate
```

#### Expected result

```text
Generated Prisma Client
```

Status: ✅

## 4. Authentication

### POST `/api/auth/register`

#### Goal

Verify that a new user can register and receive a real email verification link.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\",
    \"password\": \"$JOBTRACE_PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "email": "jobtrace.app@gmail.com",
      "emailVerified": false
    }
  }
}
```

#### Manual checks

* The response does not expose `passwordHash`.
* The response does not expose `verificationToken`.
* A real verification email is received.
* The email contains a link based on `FRONTEND_URL`.
* The email link contains a `token` query parameter.

Status: ✅

### POST `/api/auth/login` before email verification

#### Goal

Verify that an unverified user cannot log in.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\",
    \"password\": \"$JOBTRACE_PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Email must be verified before login.",
  "errors": []
}
```

Status: ✅

### GET `/api/auth/verify-email`

#### Goal

Verify that the email verification token received by email can validate the account.

#### Command to run

Copy the token from the email verification link.

Example frontend link:

```text
http://localhost:3000/verify-email?token=PASTE_THE_EMAIL_VERIFICATION_TOKEN_HERE
```

Save the token:

```bash
EMAIL_VERIFICATION_TOKEN="PASTE_THE_EMAIL_VERIFICATION_TOKEN_HERE"
```

Then call the backend endpoint:

```bash
curl -s "http://localhost:4000/api/auth/verify-email?token=$EMAIL_VERIFICATION_TOKEN" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "user": {
      "email": "jobtrace.app@gmail.com",
      "emailVerified": true
    }
  }
}
```

Status: ✅

### GET `/api/auth/verify-email` with invalid token

#### Goal

Verify that an invalid email verification token is rejected.

#### Command to run

```bash
curl -s "http://localhost:4000/api/auth/verify-email?token=invalid-token" | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Email verification token is invalid.",
  "errors": []
}
```

Status: ✅

### POST `/api/auth/login`

#### Goal

Verify that a verified user can log in.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\",
    \"password\": \"$JOBTRACE_PASSWORD\"
  }" | jq
```

#### Expected result

* `success` is `true`.
* A JWT token is returned.
* The user object is returned.
* `passwordHash` is not exposed.
* `emailVerifyToken` is not exposed.
* `resetToken` is not exposed.

#### Variable to save

```bash
TOKEN="PASTE_THE_TOKEN_HERE"
```

Status: ✅

### POST `/api/auth/login` with invalid credentials

#### Goal

Verify that invalid credentials are rejected with a neutral error message.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\",
    \"password\": \"WrongPassword1\"
  }" | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Invalid credentials.",
  "errors": []
}
```

Status: ✅

### GET `/api/auth/me`

#### Goal

Verify that the authenticated user can retrieve their account data.

#### Command to run

Valid request:

```bash
curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

Invalid request:

```bash
curl -s http://localhost:4000/api/auth/me | jq
```

#### Expected result

Valid request:

* `success` is `true`.
* The authenticated user is returned.
* The returned email is `jobtrace.app@gmail.com`.
* `passwordHash` is not exposed.
* `emailVerifyToken` is not exposed.
* `resetToken` is not exposed.

Invalid request:

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status: ✅

## 5. Profile

### GET `/api/profile`

#### Goal

Verify that the authenticated user can retrieve their profile.

#### Command to run

```bash
curl -s http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "profile": {
      "email": "jobtrace.app@gmail.com"
    }
  }
}
```

Status: ✅

### PATCH `/api/profile`

#### Goal

Verify that the authenticated user can update their profile.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "JobTrace",
    "lastName": "App",
    "avatarUrl": null
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "profile": {
      "firstName": "JobTrace",
      "lastName": "App"
    }
  }
}
```

Status: ✅

### PATCH `/api/profile` with invalid name

#### Goal

Verify that invalid profile values are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "JobTrace123",
    "lastName": "App"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "First name can only contain letters, spaces and hyphens.",
  "errors": []
}
```

Status: ✅

## 6. User settings

### PATCH `/api/profile/settings`

#### Goal

Verify that the authenticated user can update their settings.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "theme": "dark",
    "dailyGoal": 8,
    "followUpDelayDays": 20
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Settings updated successfully.",
  "data": {
    "profile": {
      "theme": "dark",
      "dailyGoal": 8,
      "followUpDelayDays": 20
    }
  }
}
```

Status: ✅

### PATCH `/api/profile/settings` with invalid theme

#### Goal

Verify that invalid settings are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "theme": "invalid"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Theme must be light or dark.",
  "errors": []
}
```

Status: ✅

## 7. Password update

### PATCH `/api/profile/password`

#### Goal

Verify that the authenticated user can update their password.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"currentPassword\": \"$JOBTRACE_PASSWORD\",
    \"newPassword\": \"$JOBTRACE_NEW_PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Password updated successfully.",
  "data": {}
}
```

Status: ✅

### POST `/api/auth/login` with updated password

#### Goal

Verify that the updated password can be used to log in.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\",
    \"password\": \"$JOBTRACE_NEW_PASSWORD\"
  }" | jq
```

#### Expected result

* `success` is `true`.
* A new JWT token is returned.

#### Variable to update

```bash
TOKEN="PASTE_THE_NEW_TOKEN_HERE"
```

Status: ✅

### PATCH `/api/profile/password` with invalid current password

#### Goal

Verify that a wrong current password is rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "WrongPassword1",
    "newPassword": "AnotherPassword1"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Current password is incorrect.",
  "errors": []
}
```

Status: ✅

## 8. Password reset

### POST `/api/auth/forgot-password`

#### Goal

Verify that a password reset email can be requested.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Password reset request processed successfully.",
  "data": {}
}
```

#### Manual checks

* The response does not expose `resetToken`.
* A real password reset email is received.
* The email contains a link based on `FRONTEND_URL`.
* The email link contains a `token` query parameter.

Status: ✅

### POST `/api/auth/forgot-password` with unknown email

#### Goal

Verify that unknown emails receive the same neutral response.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "unknown@example.com"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Password reset request processed successfully.",
  "data": {}
}
```

Status: ✅

### POST `/api/auth/reset-password`

#### Goal

Verify that the password can be reset with the token received by email.

#### Command to run

Copy the token from the password reset email link.

Example frontend link:

```text
http://localhost:3000/reset-password?token=PASTE_THE_PASSWORD_RESET_TOKEN_HERE
```

Save the token:

```bash
PASSWORD_RESET_TOKEN="PASTE_THE_PASSWORD_RESET_TOKEN_HERE"
```

Then reset the password back to the main test password:

```bash
curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$PASSWORD_RESET_TOKEN\",
    \"password\": \"$JOBTRACE_PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {}
}
```

Status: ✅

### POST `/api/auth/login` after password reset

#### Goal

Verify that the reset password works.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$JOBTRACE_EMAIL\",
    \"password\": \"$JOBTRACE_PASSWORD\"
  }" | jq
```

#### Expected result

* `success` is `true`.
* A new JWT token is returned.

#### Variable to update

```bash
TOKEN="PASTE_THE_NEW_TOKEN_HERE"
```

Status: ✅

### POST `/api/auth/reset-password` with invalid token

#### Goal

Verify that an invalid reset token is rejected.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token",
    "password": "AnotherPassword1"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Password reset token is invalid.",
  "errors": []
}
```

Status: ✅

## 9. User data export

### GET `/api/auth/export`

#### Goal

Verify that the authenticated user can export their data without exposing sensitive fields.

#### Command to run

```bash
curl -s http://localhost:4000/api/auth/export \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Expected result

* `success` is `true`.
* The export contains the user profile.
* The export contains empty arrays for features that are not implemented yet.
* `passwordHash` is not exposed.
* `emailVerifyToken` is not exposed.
* `resetToken` is not exposed.

Status: ✅

## 10. Account deletion

### DELETE `/api/auth/me`

#### Goal

Verify that an authenticated user can delete their account.

> Use a dedicated temporary account for this validation.

#### Temporary account variables

```bash
DELETE_ACCOUNT_EMAIL="jobtrace.app+delete@gmail.com"
DELETE_ACCOUNT_PASSWORD="PASTE_A_TEMPORARY_TEST_PASSWORD_HERE"
```

#### Command to run

Register a temporary account:

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$DELETE_ACCOUNT_EMAIL\",
    \"password\": \"$DELETE_ACCOUNT_PASSWORD\"
  }" | jq
```

Verify the temporary account with the token received by email:

```bash
EMAIL_VERIFICATION_TOKEN="PASTE_THE_DELETE_ACCOUNT_EMAIL_VERIFICATION_TOKEN_HERE"
```

```bash
curl -s "http://localhost:4000/api/auth/verify-email?token=$EMAIL_VERIFICATION_TOKEN" | jq
```

Log in as the temporary account:

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$DELETE_ACCOUNT_EMAIL\",
    \"password\": \"$DELETE_ACCOUNT_PASSWORD\"
  }" | jq
```

Save the temporary token:

```bash
DELETE_ACCOUNT_TOKEN="PASTE_THE_DELETE_ACCOUNT_TOKEN_HERE"
```

Delete the temporary account:

```bash
curl -s -X DELETE http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $DELETE_ACCOUNT_TOKEN" | jq
```

Try to log in again:

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$DELETE_ACCOUNT_EMAIL\",
    \"password\": \"$DELETE_ACCOUNT_PASSWORD\"
  }" | jq
```

#### Expected result for deletion

```json
{
  "success": true,
  "message": "Account deleted successfully.",
  "data": {}
}
```

#### Expected result after deletion

```json
{
  "success": false,
  "message": "Invalid credentials.",
  "errors": []
}
```

Status: ✅

## 11. Current backend validation summary

The following backend features have been manually validated:

* API startup.
* `GET /api/health`.
* `GET /api/health/db`.
* Unknown route handling.
* PostgreSQL connection.
* Prisma migration status.
* Prisma Client generation.
* User registration.
* Real email verification.
* Login blocked before email verification.
* Login after email verification.
* JWT authentication.
* Protected route access.
* Current user endpoint.
* Profile retrieval and update.
* User settings update.
* Password update.
* Real password reset email.
* Password reset.
* User data export without sensitive fields.
* Account deletion.
