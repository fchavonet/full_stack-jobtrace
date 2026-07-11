# JobTrace - Backend: manual validation

This document tracks the manual validation of the JobTrace backend API.
<br>
The goal is to verify the main user flows before considering the backend stable.

The validation is designed to be executed from top to bottom on a fresh database.

## Environment

- Backend: `Node.js` / `Express`.
- Database: `PostgreSQL`.
- ORM: `Prisma`.
- API documentation: `Swagger` / `OpenAPI`.
- Authentication: `JWT` stored in a secure `HttpOnly` cookie.
- Email system: `Nodemailer` with `SMTP`.
- Upload system: `Multer` with local storage.

To display JSON responses from `curl` commands in a readable format, it is recommended to use `jq`.

Install `jq` if it is not already available:

```bash
apt install jq -y
```

Then add ` | jq` at the end of any `curl` command that returns JSON.
<br>
This will format the JSON response and make it easier to read in the terminal.

Some response values can change depending on the test environment, the database state, the current date or generated identifiers.

In expected JSON responses, dynamic values are replaced by `*`.

## Test variables

During validation, the following shell variables may be used.

Set them manually before running the tests:

- `EMAIL`: email of the main test account.
- `PASSWORD`: current password of the main test account.
- `NEW_PASSWORD`: temporary password used during password update validation.
- `COOKIE_JAR`: local file used by `curl` to store and resend the authentication cookie.

Initialize the cookie file before starting the authentication tests:

```bash
COOKIE_JAR="/tmp/jobtrace-cookies.txt"
rm -f "$COOKIE_JAR"
```

The email address must be real and accessible because email verification and password reset links are sent by email.
<br>
Passwords must respect the backend password rules.

The following variables will be filled manually during the validation:

- `EMAIL_VERIFICATION_TOKEN`: token received in the email verification link.
- `PASSWORD_RESET_TOKEN`: token received in the password reset link.

<br>

- `APPLICATION_ID`: id of the application created during validation.
- `CONTACT_ID`: id of the contact created during validation.
- `TAG_ID`: id of the tag created during validation.
- `DOCUMENT_ID`: id of the document uploaded during validation.

IDs and email tokens must be copied manually from the real API responses.

## 1. Project startup

### Install backend dependencies

#### Goal

Install backend dependencies before running local backend and Prisma commands.

#### Command to run

From the backend directory:

```bash
npm install
```

#### Expected result

The backend dependencies should be installed successfully.

Status:

### Start the Docker services

#### Goal

Build and start the backend and database services.

#### Command to run

From the project root:

```bash
docker compose up --build
```

#### Expected result

The backend and database services should build and start successfully.

Status:

### Generate Prisma Client

#### Goal

Generate Prisma Client from the current Prisma schema.

#### Command to run

From the backend directory:

```bash
npm run prisma:generate
```

#### Expected result

Prisma Client should be generated successfully.

Example:

```text
Generated Prisma Client (v*.*.*)
```

Status:

### Apply Prisma migrations

#### Goal

Apply the existing Prisma migrations on the PostgreSQL database.

#### Command to run

From the backend directory, in the Ubuntu / VS Code terminal:

```bash
npm run prisma:migrate
```

#### Expected result

The database should be synchronized with the Prisma schema.

Example:

```text
Your database is now in sync with your schema.
```

Status:

### Check Prisma migration status

#### Goal

Verify that the database schema is synchronized with the Prisma migration history.

#### Command to run

From the backend directory, in the Ubuntu / VS Code terminal:

```bash
npm run prisma:status
```

#### Expected result

The database schema should be up to date with the local migrations.

Example:

```text
Database schema is up to date!
```

Status:

## 2. Health checks

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

Status:

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

Status:

## 3. Error handling

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

Status:

## 4. Authentication

### POST `/api/auth/register`

#### Goal

Verify that a new user can register and receive a real email verification link.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "*",
      "email": "*",
      "firstName": null,
      "lastName": null,
      "avatarUrl": null,
      "emailVerified": false,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### POST `/api/auth/login` before email verification

#### Goal

Verify that an unverified user cannot log in.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
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

Status:

### GET `/api/auth/verify-email`

#### Goal

Verify that the email verification token received by email can validate the account.

#### Command to run

Copy the token from the email verification link.

Example frontend link:

```text
http://localhost:3000/verify-email?token=COPY_THE_EMAIL_VERIFICATION_TOKEN_HERE
```

Save the token manually:

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
      "id": "*",
      "email": "*",
      "firstName": null,
      "lastName": null,
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

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

Status:

### POST `/api/auth/login`

#### Goal

Verify that a verified user can log in.

#### Command to run

```bash
curl -s -c "$COOKIE_JAR" -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "*",
      "email": "*",
      "firstName": null,
      "lastName": null,
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

The JWT must not appear in the JSON response.

Verify that the authentication cookie was stored:

```bash
cat "$COOKIE_JAR"
```

The cookie file should contain an entry named `jobtrace_auth` marked as `HttpOnly`.

Status:

### POST `/api/auth/login` with invalid credentials

#### Goal

Verify that invalid credentials are rejected with a neutral error message.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
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

Status:

### GET `/api/auth/me`

#### Goal

Verify that the authenticated user can retrieve their account data.

#### Command to run

```bash
curl -s http://localhost:4000/api/auth/me \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

Valid request:

```json
{
  "success": true,
  "message": "Current user retrieved successfully.",
  "data": {
    "user": {
      "id": "*",
      "email": "*",
      "firstName": null,
      "lastName": null,
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

## 5. Profile

### GET `/api/profile`

#### Goal

Verify that the authenticated user can retrieve their profile.

#### Command to run

```bash
curl -s http://localhost:4000/api/profile \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "profile": {
      "id": "*",
      "email": "*",
      "firstName": null,
      "lastName": null,
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/profile`

#### Goal

Verify that the authenticated user can update their profile.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "firstName": "Dick",
    "lastName": "Grayson"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "profile": {
      "id": "*",
      "email": "*",
      "firstName": "Dick",
      "lastName": "Grayson",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/profile` with invalid name

#### Goal

Verify that invalid profile values are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "firstName": "J@son",
    "lastName": "Todd"
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

Status:

## 6. User settings

### PATCH `/api/profile/settings`

#### Goal

Verify that the authenticated user can update their settings.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/settings \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "theme": "dark",
    "dailyGoal": 10,
    "followUpDelayDays": 30
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Settings updated successfully.",
  "data": {
    "profile": {
      "id": "*",
      "email": "*",
      "firstName": "Dick",
      "lastName": "Grayson",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "dark",
      "dailyGoal": 10,
      "followUpDelayDays": 30,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/profile/settings` with invalid theme

#### Goal

Verify that invalid settings are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/settings \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "theme": "red"
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

Status:

## 7. Password update

### PATCH `/api/profile/password`

#### Goal

Verify that the authenticated user can update their password.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/password \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d "{
    \"currentPassword\": \"$PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\"
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

Status:

### POST `/api/auth/login` with updated password

#### Goal

Verify that the updated password can be used to log in.

#### Command to run

```bash
curl -s -c "$COOKIE_JAR" -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$NEW_PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "*",
      "email": "*",
      "firstName": "Dick",
      "lastName": "Grayson",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "dark",
      "dailyGoal": 10,
      "followUpDelayDays": 30,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```


Status:

### PATCH `/api/profile/password` with invalid current password

#### Goal

Verify that a wrong current password is rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/profile/password \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "currentPassword": "WrongPassword42",
    "newPassword": "AnotherWrongPassword42"
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

Status:

## 8. Password reset

### POST `/api/auth/forgot-password`

#### Goal

Verify that a password reset email can be requested.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\"
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

Status:

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

Status:

### POST `/api/auth/reset-password`

#### Goal

Verify that the password can be reset with the token received by email.

#### Command to run

Copy the token from the password reset email link.

Example frontend link:

```text
http://localhost:3000/reset-password?token=COPY_THE_PASSWORD_RESET_TOKEN_HERE
```

Save the token manually:

```bash
PASSWORD_RESET_TOKEN="PASTE_THE_PASSWORD_RESET_TOKEN_HERE"
```

Then reset the password back to the main test password:

```bash
curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$PASSWORD_RESET_TOKEN\",
    \"password\": \"$PASSWORD\"
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

Status:

### POST `/api/auth/login` after password reset

#### Goal

Verify that the reset password works.

#### Command to run

```bash
curl -s -c "$COOKIE_JAR" -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "8*",
      "email": "*",
      "firstName": "Dick",
      "lastName": "Grayson",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "dark",
      "dailyGoal": 10,
      "followUpDelayDays": 30,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```


Status:

### POST `/api/auth/reset-password` with invalid token

#### Goal

Verify that an invalid reset token is rejected.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token",
    "password": "AnotherPassword42"
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

Status:

## 9. Applications CRUD

### POST `/api/applications`

#### Goal

Verify that an authenticated user can create an application.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "company": "Wayne Enterprises",
    "position": "Robin",
    "status": "sent",
    "contractType": "permanent",
    "location": "Gotham City",
    "salary": 50000,
    "link": "https://careers.wayne-enterprises.example/jobs/robin",
    "notes": "Application used for manual validation.",
    "sentAt": "2026-06-21",
    "followUpAt": "2026-07-06",
    "interviewAt": null
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Application created successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "sent",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": null,
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [],
      "contacts": [],
      "documents": []
    }
  }
}
```

#### Variable to save

Copy the application id manually from the response:

```bash
APPLICATION_ID="PASTE_THE_APPLICATION_ID_HERE"
```

Status:

### GET `/api/applications`

#### Goal

Verify that the authenticated user can list their applications.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Applications retrieved successfully.",
  "data": {
    "applications": [
      {
        "id": "*",
        "company": "Wayne Enterprises",
        "position": "Robin",
        "status": "sent",
        "contractType": "permanent",
        "location": "Gotham City",
        "salary": 50000,
        "link": "https://careers.wayne-enterprises.example/jobs/robin",
        "notes": "Application used for manual validation.",
        "sentAt": "2026-06-21T00:00:00.000Z",
        "followUpAt": "2026-07-06T00:00:00.000Z",
        "interviewAt": null,
        "createdAt": "*",
        "updatedAt": "*",
        "tags": [],
        "contacts": [],
        "documents": []
      }
    ]
  }
}
```

Status:

### GET `/api/applications/:id`

#### Goal

Verify that the authenticated user can retrieve one of their applications.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications/$APPLICATION_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Application retrieved successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "sent",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": null,
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [],
      "contacts": [],
      "documents": []
    }
  }
}
```

Status:

### PATCH `/api/applications/:id`

#### Goal

Verify that the authenticated user can update one of their applications.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/applications/$APPLICATION_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "status": "interview",
    "interviewAt": "2026-07-12"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Application updated successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [],
      "tags": [],
      "documents": []
    }
  }
}
```

Status:

### POST `/api/applications` with invalid status

#### Goal

Verify that invalid application status values are rejected.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "company": "Wayne Enterprises",
    "position": "Nightwing",
    "status": "invalid",
    "contractType": "permanent",
    "sentAt": "2026-06-21"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Invalid application data.",
  "errors": [
    "Status is invalid."
  ]
}
```

Status:

### GET `/api/applications` without authentication cookie

#### Goal

Verify that the applications list is protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 10. Tags CRUD

### POST `/api/tags`

#### Goal

Verify that an authenticated user can create a tag.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/tags \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "Bat Signal",
    "color": "#ffee00"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag created successfully.",
  "data": {
    "tag": {
      "id": "*",
      "name": "Bat Signal",
      "slug": "bat-signal",
      "color": "#ffee00",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

#### Variable to save

Copy the tag id manually from the response:

```bash
TAG_ID="PASTE_THE_TAG_ID_HERE"
```

Status:

### GET `/api/tags`

#### Goal

Verify that the authenticated user can list their tags.

#### Command to run

```bash
curl -s http://localhost:4000/api/tags \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tags retrieved successfully.",
  "data": {
    "tags": [
      {
        "id": "*",
        "name": "Bat Signal",
        "slug": "bat-signal",
        "color": "#ffee00",
        "createdAt": "*",
        "updatedAt": "*"
      }
    ]
  }
}
```

Status:

### GET `/api/tags/:id`

#### Goal

Verify that the authenticated user can retrieve one of their tags.

#### Command to run

```bash
curl -s http://localhost:4000/api/tags/$TAG_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag retrieved successfully.",
  "data": {
    "tag": {
      "id": "*",
      "name": "Bat Signal",
      "slug": "bat-signal",
      "color": "#ffee00",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/tags/:id`

#### Goal

Verify that the authenticated user can update one of their tags.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/tags/$TAG_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "Gotham Priority",
    "color": "#000000"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag updated successfully.",
  "data": {
    "tag": {
      "id": "*",
      "name": "Gotham Priority",
      "slug": "gotham-priority",
      "color": "#000000",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### POST `/api/tags` with duplicate name

#### Goal

Verify that the same user cannot create two tags with the same slug.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/tags \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "Gotham Priority",
    "color": "#000000"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Tag already exists.",
  "errors": []
}
```

Status:

### POST `/api/tags` with invalid color

#### Goal

Verify that invalid tag color values are rejected.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/tags \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "Invalid Color",
    "color": "red"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Invalid tag data.",
  "errors": [
    "Tag color must be a valid hexadecimal color."
  ]
}
```

Status:

### POST `/api/applications/:id/tags`

#### Goal

Verify that an authenticated user can link one of their tags to one of their applications.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications/$APPLICATION_ID/tags \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d "{
    \"tagId\": \"$TAG_ID\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag linked to application successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [
        {
          "id": "*",
          "name": "Gotham Priority",
          "slug": "gotham-priority",
          "color": "#000000",
          "linkedAt": "*"
        }
      ],
      "contacts": [],
      "documents": []
    }
  }
}
```

Status:

### GET `/api/tags` without authentication cookie

#### Goal

Verify that the tags list is protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/tags | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 11. Contacts CRUD

### POST `/api/contacts`

#### Goal

Verify that an authenticated user can create a contact.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/contacts \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "firstName": "Bruce",
    "lastName": "Wayne",
    "position": "CEO",
    "email": "bruce.wayne@wayne-enterprises.example",
    "phoneNumber": "0600000000",
    "company": "Wayne Enterprises",
    "linkedinUrl": "https://www.linkedin.com/in/bruce-wayne",
    "notes": "Contact used for manual validation."
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contact created successfully.",
  "data": {
    "contact": {
      "id": "*",
      "firstName": "Bruce",
      "lastName": "Wayne",
      "position": "CEO",
      "email": "bruce.wayne@wayne-enterprises.example",
      "phoneNumber": "0600000000",
      "company": "Wayne Enterprises",
      "linkedinUrl": "https://www.linkedin.com/in/bruce-wayne",
      "notes": "Contact used for manual validation.",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

#### Variable to save

Copy the contact id manually from the response:

```bash
CONTACT_ID="PASTE_THE_CONTACT_ID_HERE"
```

Status:

### GET `/api/contacts`

#### Goal

Verify that the authenticated user can list their contacts.

#### Command to run

```bash
curl -s http://localhost:4000/api/contacts \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contacts retrieved successfully.",
  "data": {
    "contacts": [
      {
        "id": "*",
        "firstName": "Bruce",
        "lastName": "Wayne",
        "position": "CEO",
        "email": "bruce.wayne@wayne-enterprises.example",
        "phoneNumber": "0600000000",
        "company": "Wayne Enterprises",
        "linkedinUrl": "https://www.linkedin.com/in/bruce-wayne",
        "notes": "Contact used for manual validation.",
        "createdAt": "*",
        "updatedAt": "*"
      }
    ]
  }
}
```

Status:

### GET `/api/contacts/:id`

#### Goal

Verify that the authenticated user can retrieve one of their contacts.

#### Command to run

```bash
curl -s http://localhost:4000/api/contacts/$CONTACT_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contact retrieved successfully.",
  "data": {
    "contact": {
      "id": "*",
      "firstName": "Bruce",
      "lastName": "Wayne",
      "position": "CEO",
      "email": "bruce.wayne@wayne-enterprises.example",
      "phoneNumber": "0600000000",
      "company": "Wayne Enterprises",
      "linkedinUrl": "https://www.linkedin.com/in/bruce-wayne",
      "notes": "Contact used for manual validation.",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/contacts/:id`

#### Goal

Verify that the authenticated user can update one of their contacts.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/contacts/$CONTACT_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "position": "Chairman",
    "company": "Wayne Industries",
    "linkedinUrl": "https://www.linkedin.com/company/wayne-industries"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contact updated successfully.",
  "data": {
    "contact": {
      "id": "*",
      "firstName": "Bruce",
      "lastName": "Wayne",
      "position": "Chairman",
      "email": "bruce.wayne@wayne-enterprises.example",
      "phoneNumber": "0600000000",
      "company": "Wayne Industries",
      "linkedinUrl": "https://www.linkedin.com/company/wayne-industries",
      "notes": "Contact used for manual validation.",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/contacts/:id` with invalid email

#### Goal

Verify that invalid contact email values are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/contacts/$CONTACT_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "email": "invalid-email"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Email must be valid.",
  "errors": []
}
```

Status:

### PATCH `/api/contacts/:id` with invalid LinkedIn URL

#### Goal

Verify that invalid contact LinkedIn URL values are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/contacts/$CONTACT_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "linkedinUrl": "invalid-url"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "LinkedIn URL must be a valid URL.",
  "errors": []
}
```

Status:

### POST `/api/applications/:id/contacts`

#### Goal

Verify that an authenticated user can link one of their contacts to one of their applications.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications/$APPLICATION_ID/contacts \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d "{
    \"contactId\": \"$CONTACT_ID\",
    \"role\": \"Mentor\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contact linked to application successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [
        {
          "id": "*",
          "name": "Gotham Priority",
          "slug": "gotham-priority",
          "color": "#000000",
          "linkedAt": "*"
        }
      ],
      "contacts": [
        {
          "id": "*",
          "firstName": "Bruce",
          "lastName": "Wayne",
          "position": "Chairman",
          "email": "bruce.wayne@wayne-enterprises.example",
          "phoneNumber": "0600000000",
          "company": "Wayne Industries",
          "linkedinUrl": "https://www.linkedin.com/company/wayne-industries",
          "notes": "Contact used for manual validation.",
          "role": "Mentor",
          "linkedAt": "*"
        }
      ],
      "documents": []
    }
  }
}
```

Status:

### GET `/api/contacts` without authentication cookie

#### Goal

Verify that the contacts list is protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/contacts | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 12. Documents CRUD

### POST `/api/documents` with invalid file type

#### Goal

Verify that unsupported file types are rejected.

#### Command to run

```bash
echo "Wayne Enterprises document validation" > /tmp/dick-document.txt
```

```bash
curl -s -X POST http://localhost:4000/api/documents \
  -b "$COOKIE_JAR" \
  -F "type=resume" \
  -F "document=@/tmp/dick-document.txt" | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed.",
  "errors": []
}
```

Status:

### POST `/api/documents`

#### Goal

Verify that an authenticated user can upload a document.

#### Command to run

```bash
printf '%s\n' '%PDF-1.4' '1 0 obj' '<<>>' 'endobj' 'trailer' '<<>>' '%%EOF' > /tmp/dick-resume.pdf
```

```bash
curl -s -X POST http://localhost:4000/api/documents \
  -b "$COOKIE_JAR" \
  -F "type=resume" \
  -F "document=@/tmp/dick-resume.pdf" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Document uploaded successfully.",
  "data": {
    "document": {
      "id": "*",
      "type": "resume",
      "originalName": "dick-resume.pdf",
      "storedName": "*.pdf",
      "mimeType": "application/pdf",
      "size": 48,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

#### Variable to save

Copy the document id manually from the response:

```bash
DOCUMENT_ID="PASTE_THE_DOCUMENT_ID_HERE"
```

Status:

### GET `/api/documents`

#### Goal

Verify that the authenticated user can list their documents.

#### Command to run

```bash
curl -s http://localhost:4000/api/documents \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Documents retrieved successfully.",
  "data": {
    "documents": [
      {
        "id": "*",
        "type": "resume",
        "originalName": "dick-resume.pdf",
        "storedName": "*.pdf",
        "mimeType": "application/pdf",
        "size": 48,
        "createdAt": "*",
        "updatedAt": "*"
      }
    ]
  }
}
```

Status:

### GET `/api/documents/:id`

#### Goal

Verify that the authenticated user can retrieve one of their documents.

#### Command to run

```bash
curl -s http://localhost:4000/api/documents/$DOCUMENT_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Document retrieved successfully.",
  "data": {
    "document": {
      "id": "*",
      "type": "resume",
      "originalName": "dick-resume.pdf",
      "storedName": "*.pdf",
      "mimeType": "application/pdf",
      "size": 48,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/documents/:id`

#### Goal

Verify that the authenticated user can update the type of one of their documents.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/documents/$DOCUMENT_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "type": "cover_letter"
  }' | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Document updated successfully.",
  "data": {
    "document": {
      "id": "*",
      "type": "cover_letter",
      "originalName": "dick-resume.pdf",
      "storedName": "*.pdf",
      "mimeType": "application/pdf",
      "size": 48,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### PATCH `/api/documents/:id` with invalid type

#### Goal

Verify that invalid document type values are rejected.

#### Command to run

```bash
curl -s -X PATCH http://localhost:4000/api/documents/$DOCUMENT_ID \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "type": "invalid"
  }' | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Invalid document data.",
  "errors": [
    "Document type is invalid."
  ]
}
```

Status:

### GET `/api/documents/:id/download`

#### Goal

Verify that the authenticated user can download one of their documents.

#### Command to run

```bash
curl -s -L http://localhost:4000/api/documents/$DOCUMENT_ID/download \
  -b "$COOKIE_JAR" \
  -o /tmp/downloaded-dick-resume.pdf

ls -lh /tmp/downloaded-dick-resume.pdf
```

#### Expected result

A file named `/tmp/downloaded-dick-resume.pdf` should be downloaded locally.

Status:

### POST `/api/applications/:id/documents`

#### Goal

Verify that an authenticated user can link one of their documents to one of their applications.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications/$APPLICATION_ID/documents \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\"
  }" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Document linked to application successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [
        {
          "id": "*",
          "name": "Gotham Priority",
          "slug": "gotham-priority",
          "color": "#000000",
          "linkedAt": "*"
        }
      ],
      "contacts": [
        {
          "id": "*",
          "firstName": "Bruce",
          "lastName": "Wayne",
          "position": "Chairman",
          "email": "bruce.wayne@wayne-enterprises.example",
          "phoneNumber": "0600000000",
          "company": "Wayne Industries",
          "linkedinUrl": "https://www.linkedin.com/company/wayne-industries",
          "notes": "Contact used for manual validation.",
          "role": "Mentor",
          "linkedAt": "*"
        }
      ],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "dick-resume.pdf",
          "storedName": "*.pdf",
          "mimeType": "application/pdf",
          "size": 48,
          "linkedAt": "*"
        }
      ]
    }
  }
}
```

Status:

### GET `/api/documents` without authentication cookie

#### Goal

Verify that the documents list is protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/documents | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 13. Application history and unlink actions

### GET `/api/applications/:id/history`

#### Goal

Verify that the authenticated user can read the history of one of their applications.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications/$APPLICATION_ID/history \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

The response should contain the application history, ordered from the most recent action to the oldest one.

Example:

```json
{
  "success": true,
  "message": "Application history retrieved successfully.",
  "data": {
    "history": [
      {
        "id": "*",
        "action": "document_linked",
        "metadata": {
          "documentId": "*"
        },
        "createdAt": "*"
      },
      {
        "id": "*",
        "action": "contact_linked",
        "metadata": {
          "role": "Mentor",
          "contactId": "*"
        },
        "createdAt": "*"
      },
      {
        "id": "*",
        "action": "tag_linked",
        "metadata": {
          "tagId": "*"
        },
        "createdAt": "*"
      },
      {
        "id": "*",
        "action": "application_status_updated",
        "metadata": {
          "newStatus": "interview",
          "previousStatus": "sent"
        },
        "createdAt": "*"
      },
      {
        "id": "*",
        "action": "application_created",
        "metadata": {
          "status": "sent",
          "company": "Wayne Enterprises",
          "position": "Robin"
        },
        "createdAt": "*"
      }
    ]
  }
}
```

Status:

### DELETE `/api/applications/:id/tags/:tagId`

#### Goal

Verify that an authenticated user can unlink a tag from one of their applications.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/applications/$APPLICATION_ID/tags/$TAG_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag unlinked from application successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [],
      "contacts": [
        {
          "id": "*",
          "firstName": "Bruce",
          "lastName": "Wayne",
          "position": "Chairman",
          "email": "bruce.wayne@wayne-enterprises.example",
          "phoneNumber": "0600000000",
          "company": "Wayne Industries",
          "linkedinUrl": "https://www.linkedin.com/company/wayne-industries",
          "notes": "Contact used for manual validation.",
          "role": "Mentor",
          "linkedAt": "*"
        }
      ],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "dick-resume.pdf",
          "storedName": "*.pdf",
          "mimeType": "application/pdf",
          "size": 48,
          "linkedAt": "*"
        }
      ]
    }
  }
}
```

Status:

### DELETE `/api/applications/:id/contacts/:contactId`

#### Goal

Verify that an authenticated user can unlink a contact from one of their applications.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/applications/$APPLICATION_ID/contacts/$CONTACT_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contact unlinked from application successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [],
      "contacts": [],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "dick-resume.pdf",
          "storedName": "*.pdf",
          "mimeType": "application/pdf",
          "size": 48,
          "linkedAt": "*"
        }
      ]
    }
  }
}
```

Status:

### DELETE `/api/applications/:id/documents/:documentId`

#### Goal

Verify that an authenticated user can unlink a document from one of their applications.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/applications/$APPLICATION_ID/documents/$DOCUMENT_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Document unlinked from application successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [],
      "contacts": [],
      "documents": []
    }
  }
}
```

Status:

### GET `/api/applications/:id/history` after unlink actions

#### Goal

Verify that unlink actions are also stored in the application history.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications/$APPLICATION_ID/history \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

The response should now also contain:

```json
{
  "id": "*",
  "action": "document_unlinked",
  "metadata": {
    "documentId": "*"
  },
  "createdAt": "*"
},
{
  "id": "*",
  "action": "contact_unlinked",
  "metadata": {
    "contactId": "*"
  },
  "createdAt": "*"
},
{
  "id": "*",
  "action": "tag_unlinked",
  "metadata": {
    "tagId": "*"
  },
  "createdAt": "*"
},
```

Status:

### GET `/api/applications/:id/history` without authentication cookie

#### Goal

Verify that application history routes are protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications/$APPLICATION_ID/history | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 14. Achievements

### GET `/api/achievements`

#### Goal

Verify that an authenticated user can retrieve the achievements catalog with their unlock status.

#### Command to run

```bash
curl -s http://localhost:4000/api/achievements \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Achievements retrieved successfully.",
  "data": {
    "achievements": [
      {
        "id": "*",
        "name": "First application",
        "slug": "first-application",
        "description": "Create your first job application.",
        "icon": "briefcase",
        "unlocked": true,
        "unlockedAt": "*",
        "createdAt": "*"
      },
      {
        "id": "*",
        "name": "First tag",
        "slug": "first-tag",
        "description": "Create your first organization tag.",
        "icon": "tag",
        "unlocked": true,
        "unlockedAt": "*",
        "createdAt": "*"
      },
      {
        "id": "*",
        "name": "First contact",
        "slug": "first-contact",
        "description": "Create your first professional contact.",
        "icon": "user",
        "unlocked": true,
        "unlockedAt": "*",
        "createdAt": "*"
      },
      {
        "id": "*",
        "name": "First document",
        "slug": "first-document",
        "description": "Upload your first document.",
        "icon": "file",
        "unlocked": true,
        "unlockedAt": "*",
        "createdAt": "*"
      },
      {
        "id": "*",
        "name": "Application organized",
        "slug": "application-organized",
        "description": "Link a tag, a contact or a document to an application.",
        "icon": "link",
        "unlocked": true,
        "unlockedAt": "*",
        "createdAt": "*"
      },
      {
        "id": "*",
        "name": "Follow-up planned",
        "slug": "follow-up-planned",
        "description": "Create an application with a follow-up date.",
        "icon": "calendar",
        "unlocked": true,
        "unlockedAt": "*",
        "createdAt": "*"
      },
      {
        "id": "*",
        "name": "Five applications",
        "slug": "five-applications",
        "description": "Create five job applications.",
        "icon": "target",
        "unlocked": false,
        "unlockedAt": null,
        "createdAt": "*"
      }
    ]
  }
}
```

Status:

### GET `/api/achievements` after five applications

#### Goal

Create four additional applications manually so that the authenticated user has five applications in total.
<br>
Verify that creating five applications unlocks the five applications achievement.

#### Command to run

```bash
curl -s http://localhost:4000/api/achievements \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

The `five-applications` achievement should now be unlocked.

Example:

```json
{
  "id": "*",
  "name": "Five applications",
  "slug": "five-applications",
  "description": "Create five job applications.",
  "icon": "target",
  "unlocked": true,
  "unlockedAt": "*",
  "createdAt": "*"
}
```

Status:

### GET `/api/achievements` without authentication cookie

#### Goal

Verify that achievements routes are protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/achievements | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 15. User data export

### GET `/api/auth/export`

#### Goal

Verify that the authenticated user can export their data.
<br>
The export should include the user's profile, applications, contacts, tags and documents.
<br>
Sensitive fields such as password hashes, email verification tokens and password reset tokens must not be exposed.

#### Command to run

```bash
curl -s http://localhost:4000/api/auth/export \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

The response should return a successful export.

```json
{
  "success": true,
  "message": "User data exported successfully.",
  "data": {
    "export": "*"
  }
}
```

The exported data may vary depending on the additional applications created during validation and on user actions performed before this test.

The export should contain:

- The authenticated user profile.
- The user's applications.
- The user's tags.
- The user's contacts.
- The user's documents.

The exported user profile should contain:

* `id`.
* `email`.
* `firstName`.
* `lastName`.
* `avatarUrl`.
* `emailVerified`.
* `theme`.
* `dailyGoal`.
* `followUpDelayDays`.
* `createdAt`.
* `updatedAt`.

The export must not expose sensitive fields such as:

- Password hash.
- Email verification token.
- Password reset token.

Status:

### Check exported data for sensitive fields

#### Goal

Verify that the export response does not expose sensitive fields.

#### Command to run

```bash
curl -s http://localhost:4000/api/auth/export \
  -b "$COOKIE_JAR" | grep -Ei "password|hash|token|verification|reset"
```

#### Expected result

The command should not return any sensitive field.

Status:

### GET `/api/auth/export` without authentication cookie

#### Goal

Verify that the export route is protected.

#### Command to run

```bash
curl -s http://localhost:4000/api/auth/export | jq
```

#### Expected result

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
}
```

Status:

## 16. Cleanup and account deletion

### DELETE `/api/documents/:id`

#### Goal

Verify that an authenticated user can delete one of their documents.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/documents/$DOCUMENT_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Document deleted successfully.",
  "data": {
    "document": {
      "id": "*",
      "type": "cover_letter",
      "originalName": "dick-resume.pdf",
      "storedName": "*.pdf",
      "mimeType": "application/pdf",
      "size": 48,
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### DELETE `/api/contacts/:id`

#### Goal

Verify that an authenticated user can delete one of their contacts.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/contacts/$CONTACT_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Contact deleted successfully.",
  "data": {
    "contact": {
      "id": "*",
      "firstName": "Bruce",
      "lastName": "Wayne",
      "position": "Chairman",
      "email": "bruce.wayne@wayne-enterprises.example",
      "phoneNumber": "0600000000",
      "company": "Wayne Industries",
      "linkedinUrl": "https://www.linkedin.com/company/wayne-industries",
      "notes": "Contact used for manual validation.",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### DELETE `/api/tags/:id`

#### Goal

Verify that an authenticated user can delete one of their tags.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/tags/$TAG_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag deleted successfully.",
  "data": {
    "tag": {
      "id": "*",
      "name": "Gotham Priority",
      "slug": "gotham-priority",
      "color": "#000000",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### DELETE `/api/applications/:id`

#### Goal

Verify that an authenticated user can delete one of their applications.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/applications/$APPLICATION_ID \
  -b "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Application deleted successfully.",
  "data": {
    "application": {
      "id": "*",
      "company": "Wayne Enterprises",
      "position": "Robin",
      "status": "interview",
      "contractType": "permanent",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-21T00:00:00.000Z",
      "followUpAt": "2026-07-06T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "tags": [],
      "contacts": [],
      "documents": []
    }
  }
}
```

Status:

### POST `/api/auth/logout`

#### Goal

Verify that the authenticated user can log out and that the authentication cookie is cleared.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/auth/logout \
  -b "$COOKIE_JAR" \
  -c "$COOKIE_JAR" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "User logged out successfully.",
  "data": {}
}
```

The `jobtrace_auth` cookie should no longer contain a valid authentication token.

Log in again before deleting the account:

```bash
curl -s -c "$COOKIE_JAR" -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq
```

Status:

### DELETE `/api/auth/me`

#### Goal

Verify that an authenticated user can delete their account.

#### Command to run

Delete the authenticated account:

```bash
curl -i -s -X DELETE http://localhost:4000/api/auth/me \
  -b "$COOKIE_JAR" \
  -c "$COOKIE_JAR"
```

Then try to log in again:

```bash
curl -s -c "$COOKIE_JAR" -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
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

The account deletion response must also expire the `jobtrace_auth` cookie.

#### Expected result after deletion

```json
{
  "success": false,
  "message": "Invalid credentials.",
  "errors": []
}
```

Status:

## 17. Backend validation summary

The following backend features have been manually validated:

- Project startup.
- Backend dependency installation.
- Docker Compose services startup.
- Prisma Client generation.
- Prisma migrations.
- Prisma migration status.
- `GET /api/health`.
- `GET /api/health/db`.
- Unknown route handling.

<br>

- User registration.
- Real email verification.
- Login blocked before email verification.
- Login after email verification.
- Authentication cookie creation.
- Logout and authentication cookie deletion.
- Authentication with a JWT stored in an HttpOnly cookie.
- Protected route access.
- Current user endpoint.

<br>

- Profile retrieval.
- Profile update.
- Profile validation errors.
- User settings update.
- User settings validation errors.
- Password update.
- Login with updated password.
- Invalid current password rejection.
- Password reset email request.
- Neutral password reset response for unknown email.
- Password reset.
- Login after password reset.
- Invalid password reset token rejection.

<br>

- Applications CRUD.
- Application validation errors.

<br>

- Tags CRUD.
- Tag duplicate protection.
- Tag validation errors.
- Tag and application linking.

<br>

- Contacts CRUD.
- Contact validation errors.
- Contact professional details.
- Contact and application linking.

<br>

- Documents CRUD.
- Invalid document upload rejection.
- Document upload.
- Document download.
- Document validation errors.
- Document and application linking.

<br>

- Application history retrieval.
- Tag unlinking.
- Contact unlinking.
- Document unlinking.
- Application history after unlink actions.

<br>

- Achievements catalog retrieval.
- Achievement unlock status per authenticated user.
- First application achievement.
- First tag achievement.
- First contact achievement.
- First document achievement.
- Application organized achievement.
- Follow-up planned achievement.
- Five applications achievement.
- Achievements route protection.

<br>

- User data export.
- Sensitive fields exclusion from user data export.

<br>

- Document deletion.
- Contact deletion.
- Tag deletion.
- Application deletion.
- Account deletion and authentication cookie deletion.
- Login rejection after account deletion.

<br>

- Coherent API success responses.
- Coherent API error responses.
