# JobTrace - Backend: manual validation

This document tracks the manual validation of the JobTrace back-end API.
<br>
The goal is to verify the main user flows before considering the backend stable.

## Environment

- Backend: `Node.js` / `Express`.
- Database: `PostgreSQL`.
- ORM: `Prisma`.
- Authentication: `JWT`.
- API documentation: `Swagger` / `OpenAPI`.
- Upload system: `Multer` with local storage.

To display the JSON response from a `curl` command in a readable format, it is recommended to use `jq`.

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

During validation, the following shell variables may be used:

- `EMAIL`: email of the main test account (must be a real email).
- `PASSWORD`: current password of the main test account.
- `NEW_PASSWORD`: temporary password used during password update validation.
- `TOKEN`: JWT of the authenticated test user.
- `EMAIL_VERIFICATION_TOKEN`: token received in the email verification link.
- `PASSWORD_RESET_TOKEN`: token received in the password reset link.

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

Status:

## 3. Prisma checks

### Apply migrations if the database is new

#### Goal

Apply the existing Prisma migrations when the PostgreSQL database is new, empty, or has just been reset.

#### Command to run

From the backend directory:

```bash
npm run prisma:migrate
```

#### Expected result

The existing migrations should be applied successfully.

Example:

```text
Your database is now in sync with your schema.
```

Status:

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
Generated Prisma Client (v*.*.*)
```

Status:

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
      "email": "jobtrace.app@gmail.com",
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
      "id": "*",
      "email": "jobtrace.app@gmail.com",
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
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "*",
      "email": "jobtrace.app@gmail.com",
      "firstName": null,
      "lastName": null,
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "light",
      "dailyGoal": 5,
      "followUpDelayDays": 15,
      "createdAt": "*",
      "updatedAt": "*"
    },
    "token": "*"
  }
}
```

#### Variable to save

```bash
TOKEN="PASTE_THE_TOKEN_HERE"
```

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

```json
{
  "success": true,
  "message": "Current user retrieved successfully.",
  "data": {
    "user": {
      "id": "*",
      "email": "jobtrace.app@gmail.com",
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

Invalid request:

```json
{
  "success": false,
  "message": "Authentication token is required.",
  "errors": []
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
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "profile": {
      "id": "*",
      "email": "jobtrace.app@gmail.com",
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
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Fabien",
    "lastName": "Chavonet",
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
      "id": "*",
      "email": "jobtrace.app@gmail.com",
      "firstName": "Fabien",
      "lastName": "Chavonet",
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
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Fabien_du_29",
    "lastName": "12345"
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
      "id": "*",
      "email": "jobtrace.app@gmail.com",
      "firstName": "Fabien",
      "lastName": "Chavonet",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "dark",
      "dailyGoal": 8,
      "followUpDelayDays": 20,
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

Status:

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
curl -s -X POST http://localhost:4000/api/auth/login \
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
      "email": "jobtrace.app@gmail.com",
      "firstName": "Fabien",
      "lastName": "Chavonet",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "dark",
      "dailyGoal": 8,
      "followUpDelayDays": 20,
      "createdAt": "*",
      "updatedAt": "*"
    },
    "token": "*"
  }
}
```

#### Variable to update

```bash
TOKEN="PASTE_THE_NEW_TOKEN_HERE"
```

Status:

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
    "newPassword": "AnotherWrongPassword1"
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

Save the token:

```bash
PASSWORD_RESET_TOKEN="PASTE_THE_PASSWORD_RESET_TOKEN_HERE"
```

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
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "*",
      "email": "jobtrace.app@gmail.com",
      "firstName": "Fabien",
      "lastName": "Chavonet",
      "avatarUrl": null,
      "emailVerified": true,
      "theme": "dark",
      "dailyGoal": 8,
      "followUpDelayDays": 20,
      "createdAt": "*",
      "updatedAt": "*"
    },
    "token": "*"
  }
}
```

#### Variable to update

```bash
TOKEN="PASTE_THE_NEW_TOKEN_HERE"
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

Status:

## 9. Applications CRUD

### POST `/api/applications`

#### Goal

Verify that an authenticated user can create an application.

#### Command to run

```bash
APPLICATION_ID=$(curl -s -X POST http://localhost:4000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company": "Wayne Enterprises",
    "position": "Robin",
    "status": "Envoyée",
    "contractType": "CDI",
    "location": "Gotham City",
    "salary": 50000,
    "link": "https://careers.wayne-enterprises.example/jobs/robin",
    "notes": "Application used for manual validation.",
    "sentAt": "2026-06-20",
    "followUpAt": "2026-07-05",
    "interviewAt": null
  }' | jq -r ".data.application.id")

echo "$APPLICATION_ID"
```

#### Expected result

An application is created and an application id is returned.

Status:

### GET `/api/applications`

#### Goal

Verify that the authenticated user can list their applications.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications \
  -H "Authorization: Bearer $TOKEN" | jq
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
        "status": "Envoyée",
        "contractType": "CDI",
        "location": "Gotham City",
        "salary": 50000,
        "link": "https://careers.wayne-enterprises.example/jobs/robin",
        "notes": "Application used for manual validation.",
        "sentAt": "2026-06-20T00:00:00.000Z",
        "followUpAt": "2026-07-05T00:00:00.000Z",
        "interviewAt": null,
        "createdAt": "*",
        "updatedAt": "*",
        "contacts": [],
        "tags": [],
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
  -H "Authorization: Bearer $TOKEN" | jq
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
      "status": "Envoyée",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": null,
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [],
      "tags": []
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
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "Entretien",
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [],
      "tags": []
    }
  }
}
```

Status:


## 10. Contacts CRUD

### POST `/api/contacts`

#### Goal

Verify that an authenticated user can create a contact.

#### Command to run

```bash
CONTACT_ID=$(curl -s -X POST http://localhost:4000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Bruce",
    "lastName": "Wayne",
    "email": "bruce.wayne@wayne-enterprises.com",
    "phoneNumber": "0600000000",
    "company": "Wayne Enterprises",
    "notes": "Contact used for manual validation."
  }' | jq -r ".data.contact.id")

echo "$CONTACT_ID"
```

#### Expected result

A contact is created and a contact id is returned.

Status:

### GET `/api/contacts`

#### Goal

Verify that the authenticated user can list their contacts.

#### Command to run

```bash
curl -s http://localhost:4000/api/contacts \
  -H "Authorization: Bearer $TOKEN" | jq
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
        "email": "bruce.wayne@wayne-enterprises.com",
        "phoneNumber": "0600000000",
        "company": "Wayne Enterprises",
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
  -H "Authorization: Bearer $TOKEN" | jq
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
      "email": "bruce.wayne@wayne-enterprises.com",
      "phoneNumber": "0600000000",
      "company": "Wayne Enterprises",
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
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company": "Wayne Industries"
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
      "email": "bruce.wayne@wayne-enterprises.com",
      "phoneNumber": "0600000000",
      "company": "Wayne Industries",
      "notes": "Contact used for manual validation.",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
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
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"contactId\": \"$CONTACT_ID\",
    \"role\": \"Batman\"
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [
        {
          "id": "*",
          "firstName": "Bruce",
          "lastName": "Wayne",
          "email": "bruce.wayne@wayne-enterprises.com",
          "phoneNumber": "0600000000",
          "company": "Wayne Industries",
          "notes": "Contact used for manual validation.",
          "role": "Batman",
          "linkedAt": "*"
        }
      ],
      "tags": [],
      "documents": []
    }
  }
}
```

Status:


## 11. Documents CRUD

### Create a local invalid file

#### Goal

Create a local file with an unsupported extension in order to validate upload restrictions.

#### Command to run

```bash
echo "Wayne Enterprises document validation" > /tmp/wayne-document.txt
```

Status:

### POST `/api/documents` with invalid file type

#### Goal

Verify that unsupported file types are rejected.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=resume" \
  -F "document=@/tmp/wayne-document.txt" | jq
```

#### Expected result

The request is rejected because the uploaded file type is not allowed.

Status:

### Create a local PDF file

#### Goal

Create a small local PDF file for upload validation.

#### Command to run

```bash
printf '%s
' '%PDF-1.4' '1 0 obj' '<<>>' 'endobj' 'trailer' '<<>>' '%%EOF' > /tmp/wayne-resume.pdf
```

Status:

### POST `/api/documents`

#### Goal

Verify that an authenticated user can upload a document.

#### Command to run

```bash
DOCUMENT_ID=$(curl -s -X POST http://localhost:4000/api/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=resume" \
  -F "document=@/tmp/wayne-resume.pdf" | jq -r ".data.document.id")

echo "$DOCUMENT_ID"
```

#### Expected result

A document is uploaded and a document id is returned.

Status:

### GET `/api/documents`

#### Goal

Verify that the authenticated user can list their documents.

#### Command to run

```bash
curl -s http://localhost:4000/api/documents \
  -H "Authorization: Bearer $TOKEN" | jq
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
        "originalName": "wayne-resume.pdf",
        "storedName": "*",
        "mimeType": "application/pdf",
        "size": "*",
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
  -H "Authorization: Bearer $TOKEN" | jq
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
      "originalName": "wayne-resume.pdf",
      "storedName": "*",
      "mimeType": "application/pdf",
      "size": "*",
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
  -H "Authorization: Bearer $TOKEN" \
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
      "originalName": "wayne-resume.pdf",
      "storedName": "*",
      "mimeType": "application/pdf",
      "size": "*",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### GET `/api/documents/:id/download`

#### Goal

Verify that the authenticated user can download one of their documents.

#### Command to run

```bash
curl -s -L http://localhost:4000/api/documents/$DOCUMENT_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/downloaded-wayne-resume.pdf

ls -lh /tmp/downloaded-wayne-resume.pdf
```

#### Expected result

A file named `/tmp/downloaded-wayne-resume.pdf` is downloaded locally.

Status:

### POST `/api/applications/:id/documents`

#### Goal

Verify that an authenticated user can link one of their documents to one of their applications.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications/$APPLICATION_ID/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"documentId\":\"$DOCUMENT_ID\"}" | jq
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [
        {
          "id": "*",
          "firstName": "Bruce",
          "lastName": "Wayne",
          "email": "bruce.wayne@wayne-enterprises.com",
          "phoneNumber": "0600000000",
          "company": "Wayne Industries",
          "notes": "Contact used for manual validation.",
          "role": "Batman",
          "linkedAt": "*"
        }
      ],
      "tags": [],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "wayne-resume.pdf",
          "storedName": "*",
          "mimeType": "application/pdf",
          "size": "*",
          "linkedAt": "*"
        }
      ]
    }
  }
}
```

Status:


## 12. Tags CRUD

### POST `/api/tags`

#### Goal

Verify that an authenticated user can create a tag.

#### Command to run

```bash
TAG_ID=$(curl -s -X POST http://localhost:4000/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Priority",
    "color": "#ff0000"
  }' | jq -r ".data.tag.id")

echo "$TAG_ID"
```

### GET `/api/tags`

#### Goal

Verify that the authenticated user can list their tags.

#### Command to run

```bash
curl -s http://localhost:4000/api/tags \
  -H "Authorization: Bearer $TOKEN" | jq
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
        "name": "Priority",
        "slug": "priority",
        "color": "#ff0000",
        "createdAt": "*",
        "updatedAt": "*"
      }
    ]
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
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Bat Signal",
    "color": "#FFAA00"
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
      "name": "Bat Signal",
      "slug": "bat-signal",
      "color": "#FFAA00",
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
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Bat Signal",
    "color": "#FFAA00"
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

### POST `/api/applications/:id/tags`

#### Goal

Verify that an authenticated user can link one of their tags to one of their applications.

#### Command to run

```bash
curl -s -X POST http://localhost:4000/api/applications/$APPLICATION_ID/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [
        {
          "id": "*",
          "firstName": "Bruce",
          "lastName": "Wayne",
          "email": "bruce.wayne@wayne-enterprises.com",
          "phoneNumber": "0600000000",
          "company": "Wayne Industries",
          "notes": "Contact used for manual validation.",
          "role": "Batman",
          "linkedAt": "*"
        }
      ],
      "tags": [
        {
          "id": "*",
          "name": "Bat Signal",
          "slug": "bat-signal",
          "color": "#FFAA00",
          "linkedAt": "*"
        }
      ],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "wayne-resume.pdf",
          "storedName": "*",
          "mimeType": "application/pdf",
          "size": "*",
          "linkedAt": "*"
        }
      ]
    }
  }
}
```

Status:


## 13. Application history

### GET `/api/applications/:id/history`

#### Goal

Verify that the authenticated user can read the history of one of their applications.

#### Command to run

```bash
curl -s http://localhost:4000/api/applications/$APPLICATION_ID/history \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Application history retrieved successfully.",
  "data": {
    "history": [
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
          "role": "Batman",
          "contactId": "*"
        },
        "createdAt": "*"
      },
      {
        "id": "*",
        "action": "application_status_updated",
        "metadata": {
          "newStatus": "Entretien",
          "previousStatus": "Envoyée"
        },
        "createdAt": "*"
      },
      {
        "id": "*",
        "action": "application_created",
        "metadata": {
          "status": "Envoyée",
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

### DELETE `/api/applications/:id/contacts/:contactId`

#### Goal

Verify that an authenticated user can unlink a contact from one of their applications.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/applications/$APPLICATION_ID/contacts/$CONTACT_ID \
  -H "Authorization: Bearer $TOKEN" | jq
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [],
      "tags": [
        {
          "id": "*",
          "name": "Bat Signal",
          "slug": "bat-signal",
          "color": "#FFAA00",
          "linkedAt": "*"
        }
      ],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "wayne-resume.pdf",
          "storedName": "*",
          "mimeType": "application/pdf",
          "size": "*",
          "linkedAt": "*"
        }
      ]
    }
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
  -H "Authorization: Bearer $TOKEN" | jq
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
      "interviewAt": "2026-07-12T00:00:00.000Z",
      "createdAt": "*",
      "updatedAt": "*",
      "contacts": [],
      "tags": [],
      "documents": [
        {
          "id": "*",
          "type": "cover_letter",
          "originalName": "wayne-resume.pdf",
          "storedName": "*",
          "mimeType": "application/pdf",
          "size": "*",
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
  -H "Authorization: Bearer $TOKEN" | jq
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
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

### Protected business routes without JWT

#### Goal

Verify that business routes reject unauthenticated requests.

#### Commands to run

```bash
curl -s http://localhost:4000/api/contacts | jq
curl -s http://localhost:4000/api/applications | jq
curl -s http://localhost:4000/api/tags | jq
curl -s http://localhost:4000/api/documents | jq
curl -s http://localhost:4000/api/applications/$APPLICATION_ID/history | jq
```

#### Expected result

Each request is rejected because no JWT token was provided.

Status:


## 14. User data export

### GET `/api/auth/export`

#### Goal

Verify that the authenticated user can export their data without exposing sensitive fields.

#### Command to run

```bash
curl -s http://localhost:4000/api/auth/export \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Expected result

The response contains the authenticated user data, applications, contacts, documents and tags without exposing sensitive fields such as the password hash or tokens.

Status:


## 15. Cleanup and account deletion

### DELETE `/api/applications/:id`

#### Goal

Verify that an authenticated user can delete one of their applications.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/applications/$APPLICATION_ID \
  -H "Authorization: Bearer $TOKEN" | jq
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
      "status": "Entretien",
      "contractType": "CDI",
      "location": "Gotham City",
      "salary": 50000,
      "link": "https://careers.wayne-enterprises.example/jobs/robin",
      "notes": "Application used for manual validation.",
      "sentAt": "2026-06-20T00:00:00.000Z",
      "followUpAt": "2026-07-05T00:00:00.000Z",
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

### DELETE `/api/contacts/:id`

#### Goal

Verify that an authenticated user can delete one of their contacts.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/contacts/$CONTACT_ID \
  -H "Authorization: Bearer $TOKEN" | jq
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
      "email": "bruce.wayne@wayne-enterprises.com",
      "phoneNumber": "0600000000",
      "company": "Wayne Industries",
      "notes": "Contact used for manual validation.",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### DELETE `/api/documents/:id`

#### Goal

Verify that an authenticated user can delete one of their documents.

#### Command to run

```bash
curl -s -X DELETE http://localhost:4000/api/documents/$DOCUMENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq
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
      "originalName": "wayne-resume.pdf",
      "storedName": "*",
      "mimeType": "application/pdf",
      "size": "*",
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
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Expected result

```json
{
  "success": true,
  "message": "Tag deleted successfully.",
  "data": {
    "tag": {
      "id": "*",
      "name": "Bat Signal",
      "slug": "bat-signal",
      "color": "#FFAA00",
      "createdAt": "*",
      "updatedAt": "*"
    }
  }
}
```

Status:

### DELETE `/api/auth/me`

#### Goal

Verify that an authenticated user can delete their account.

#### Command to run

Log in:

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq
```

Save the token:

```bash
TOKEN="PASTE_THE_TOKEN_HERE"
```

Delete the account:

```bash
curl -s -X DELETE http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

Try to log in again:

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
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

#### Expected result after deletion

```json
{
  "success": false,
  "message": "Invalid credentials.",
  "errors": []
}
```

Status:


## 16. Current backend validation summary

The following backend features have been manually validated:

- API startup.
- `GET /api/health`.
- `GET /api/health/db`.
- Unknown route handling.
- PostgreSQL connection.
- Prisma migrations.
- Prisma migration status.
- Prisma Client generation.
- User registration.
- Real email verification.
- Login blocked before email verification.
- Login after email verification.
- JWT authentication.
- Protected route access.
- Current user endpoint.
- Profile retrieval and update.
- User settings update.
- Password update.
- Real password reset email.
- Password reset.
- Applications CRUD.
- Contacts CRUD.
- Documents CRUD.
- Tags CRUD.
- Contact and application linking.
- Document and application linking.
- Tag and application linking.
- Application history.
- Business routes protected by JWT.
- User data isolation on business resources.
- Validation errors on business routes.
- Duplicate tag protection.
- User data export without sensitive fields.
- Account deletion.
- Coherent API responses.
