# Diagrammes Mermaid

## 1. Diagramme entité-association

```mermaid
erDiagram
    direction TB

    USER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string avatar_url
        boolean email_verified
        string email_verify_token
        datetime email_verify_expires
        string reset_token
        datetime reset_token_expires
        string theme
        int daily_goal
        int follow_up_delay_days
        datetime created_at
        datetime updated_at
    }

    APPLICATION {
        uuid id PK
        uuid user_id FK
        string company
        string position
        string status
        string contract_type
        string location
        int salary
        string link
        string notes
        date sent_at
        date follow_up_at
        date interview_at
        datetime created_at
        datetime updated_at
    }

    APPLICATION_TAG {
        uuid id PK
        uuid application_id FK
        uuid tag_id FK
        datetime created_at
    }

    TAG {
        uuid id PK
        uuid user_id FK
        string name
        string slug
        string color
        datetime created_at
        datetime updated_at
    }

    APPLICATION_CONTACT {
        uuid id PK
        uuid application_id FK
        uuid contact_id FK
        string role
        datetime created_at
    }

    CONTACT {
        uuid id PK
        uuid user_id FK
        string first_name
        string last_name
        string position
        string email
        string phone_number
        string company
        string linkedin_url
        string notes
        datetime created_at
        datetime updated_at
    }

    APPLICATION_DOCUMENT {
        uuid id PK
        uuid application_id FK
        uuid document_id FK
        datetime created_at
    }

    DOCUMENT {
        uuid id PK
        uuid user_id FK
        string type
        string original_name
        string stored_name
        string mime_type
        int size
        string path
        datetime created_at
        datetime updated_at
    }

    APPLICATION_HISTORY {
        uuid id PK
        uuid application_id FK
        string action
        json metadata
        datetime created_at
    }

    USER_ACHIEVEMENT {
        uuid id PK
        uuid user_id FK
        uuid achievement_id FK
        datetime unlocked_at
    }

    ACHIEVEMENT {
        uuid id PK
        string name
        string slug UK
        string description
        string icon
        datetime created_at
    }

    USER ||--o{ APPLICATION : owns

    APPLICATION ||--o{ APPLICATION_TAG : has
    APPLICATION_TAG }o--|| TAG : references

    APPLICATION ||--o{ APPLICATION_CONTACT : has
    APPLICATION_CONTACT }o--|| CONTACT : references

    APPLICATION ||--o{ APPLICATION_DOCUMENT : has
    APPLICATION_DOCUMENT }o--|| DOCUMENT : references

    TAG }o--|| USER : belongs_to
    CONTACT }o--|| USER : belongs_to
    DOCUMENT }o--|| USER : belongs_to

    USER_ACHIEVEMENT }o--|| USER : belongs_to
    USER_ACHIEVEMENT }o--|| ACHIEVEMENT : references

    APPLICATION_HISTORY }o--|| APPLICATION : belongs_to
```

## 2. Diagramme de classes métier simplifié

```mermaid
classDiagram
direction TB

class User {
  UUID id
  String email
  String passwordHash
  String firstName
  String lastName
  String avatarUrl
  Boolean emailVerified
  String emailVerifyToken
  DateTime emailVerifyExpires
  String resetToken
  DateTime resetTokenExpires
  String theme
  Integer dailyGoal
  Integer followUpDelayDays
  DateTime createdAt
  DateTime updatedAt
}

class Application {
  UUID id
  String company
  String position
  String status
  String contractType
  String location
  Integer salary
  String link
  String notes
  Date sentAt
  Date followUpAt
  Date interviewAt
  DateTime createdAt
  DateTime updatedAt
}

class ApplicationHistory {
  UUID id
  String action
  JSON metadata
  DateTime createdAt
}

class Tag {
  UUID id
  String name
  String slug
  String color
  DateTime createdAt
  DateTime updatedAt
}

class Contact {
  UUID id
  String firstName
  String lastName
  String position
  String email
  String phoneNumber
  String company
  String linkedinUrl
  String notes
  DateTime createdAt
  DateTime updatedAt
}

class Document {
  UUID id
  String type
  String originalName
  String storedName
  String mimeType
  Integer size
  String path
  DateTime createdAt
  DateTime updatedAt
}

class Achievement {
  UUID id
  String name
  String slug
  String description
  String icon
  DateTime createdAt
}

User "1" *-- "0..*" Application : possède
User "1" *-- "0..*" Tag : possède
User "1" *-- "0..*" Contact : possède
User "1" *-- "0..*" Document : possède
User "0..*" -- "0..*" Achievement : débloque

Application "1" *-- "0..*" ApplicationHistory : génère
Application "0..*" -- "0..*" Tag : utilise
Application "0..*" -- "0..*" Contact : associe
Application "0..*" -- "0..*" Document : joint
```

## 3. Diagramme de séquence : authentification

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Frontend as Frontend React
    participant Browser as Navigateur
    participant API as Route / contrôleur Express
    participant Validator as Validateur
    participant AuthService as Service d'authentification
    participant AuthMiddleware as Middleware d'authentification
    participant DB as PostgreSQL via Prisma

    User->>Frontend: Saisit son email et son mot de passe
    Frontend->>API: POST /api/auth/login
    API->>Validator: Valide les données de connexion

    alt Données invalides
        Validator-->>Frontend: 400 Bad Request
        Frontend-->>User: Affiche un message d'erreur
    else Données valides
        Validator-->>API: Données validées
        API->>AuthService: loginUser(email, password)
        AuthService->>DB: Recherche l'utilisateur par email
        DB-->>AuthService: Retourne l'utilisateur
        AuthService->>AuthService: Compare le mot de passe avec bcrypt
        AuthService->>AuthService: Vérifie que l'email est validé

        alt Identifiants invalides
            AuthService-->>API: Erreur 401
            API-->>Frontend: 401 Unauthorized
            Frontend-->>User: Affiche un message d'erreur
        else Email non vérifié
            AuthService-->>API: Erreur 403
            API-->>Frontend: 403 Forbidden
            Frontend-->>User: Demande de vérifier l'adresse email
        else Authentification réussie
            AuthService->>AuthService: Génère un JWT
            AuthService-->>API: Utilisateur et JWT
            API-->>Browser: Set-Cookie JWT<br/>HttpOnly, SameSite=Lax, Secure en production
            API-->>Frontend: 200 OK + utilisateur
            Frontend-->>User: Redirige vers l'espace connecté
        end
    end

    User->>Frontend: Accède à une page protégée
    Frontend->>API: GET /api/auth/me
    Browser-->>API: Ajoute automatiquement le cookie JWT
    API->>AuthMiddleware: Vérifie l'authentification
    AuthMiddleware->>AuthMiddleware: Extrait puis vérifie le JWT
    AuthMiddleware->>DB: Recherche l'utilisateur avec le userId
    DB-->>AuthMiddleware: Retourne l'utilisateur

    alt JWT absent, invalide ou expiré
        AuthMiddleware-->>Frontend: 401 Unauthorized
        Frontend-->>User: Redirige vers la connexion
    else JWT valide
        AuthMiddleware-->>API: Ajoute request.user et autorise la requête
        API->>AuthService: getCurrentUser(request.user.id)
        AuthService->>DB: Recherche l'utilisateur
        DB-->>AuthService: Retourne l'utilisateur
        AuthService-->>API: Utilisateur nettoyé
        API-->>Frontend: 200 OK + utilisateur connecté
        Frontend-->>User: Affiche la page protégée
    end
```

## 4. Diagramme de séquence : création d’une candidature

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Frontend as Frontend React
    participant Browser as Navigateur
    participant Route as Route Express
    participant Auth as Middleware d'authentification
    participant Validator as Validateur
    participant Controller as Contrôleur
    participant Service as Service des candidatures
    participant DB as PostgreSQL via Prisma

    User->>Frontend: Remplit le formulaire de candidature
    User->>Frontend: Clique sur "Enregistrer"
    Frontend->>Route: POST /api/applications
    Browser-->>Route: Ajoute automatiquement le cookie JWT
    Route->>Auth: Vérifie le JWT et recherche l'utilisateur

    alt Authentification invalide
        Auth-->>Frontend: 401 Unauthorized
        Frontend-->>User: Affiche une erreur
    else Utilisateur authentifié
        Auth-->>Route: Ajoute request.user et autorise la requête
        Route->>Validator: Valide applicationData

        alt Données invalides
            Validator-->>Frontend: 400 Bad Request
            Frontend-->>User: Affiche les erreurs de validation
        else Données valides
            Validator-->>Route: Données validées
            Route->>Controller: createApplication()
            Controller->>Service: createUserApplication(userId, applicationData)
            Service->>DB: Crée la candidature
            DB-->>Service: Candidature créée
            Service->>DB: Crée l'entrée d'historique
            DB-->>Service: Historique créé
            Service-->>Controller: Candidature nettoyée
            Controller-->>Frontend: 201 Created + candidature
            Frontend-->>User: Affiche un message de succès
        end
    end
```

## 5. Diagramme de séquence : création d’un contact

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Frontend as Frontend React
    participant Browser as Navigateur
    participant Route as Route Express
    participant Auth as Middleware d'authentification
    participant Validator as Validateur
    participant Controller as Contrôleur
    participant Service as Service des contacts
    participant DB as PostgreSQL via Prisma

    User->>Frontend: Remplit le formulaire de contact
    User->>Frontend: Clique sur "Enregistrer"
    Frontend->>Route: POST /api/contacts
    Browser-->>Route: Ajoute automatiquement le cookie JWT
    Route->>Auth: Vérifie le JWT et recherche l'utilisateur

    alt Authentification invalide
        Auth-->>Frontend: 401 Unauthorized
        Frontend-->>User: Affiche une erreur
    else Utilisateur authentifié
        Auth-->>Route: Ajoute request.user et autorise la requête
        Route->>Validator: Valide contactData

        alt Données invalides
            Validator-->>Frontend: 400 Bad Request
            Frontend-->>User: Affiche les erreurs de validation
        else Données valides
            Validator-->>Route: Données validées
            Route->>Controller: createContact()
            Controller->>Service: createUserContact(userId, contactData)
            Service->>DB: Crée le contact
            DB-->>Service: Contact créé
            Service-->>Controller: Contact nettoyé
            Controller-->>Frontend: 201 Created + contact
            Frontend-->>User: Affiche un message de succès
        end
    end
```

## 6. Diagramme de séquence : téléversement d’un document

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant Frontend as Frontend React
    participant Browser as Navigateur
    participant Route as Route Express
    participant Auth as Middleware d'authentification
    participant Upload as Middleware Multer
    participant Validator as Validateur
    participant Controller as Contrôleur
    participant Service as Service des documents
    participant Storage as Stockage local
    participant DB as PostgreSQL via Prisma

    User->>Frontend: Sélectionne un document
    User->>Frontend: Lance le téléversement
    Frontend->>Route: POST /api/documents<br/>multipart/form-data
    Browser-->>Route: Ajoute automatiquement le cookie JWT
    Route->>Auth: Vérifie le JWT et recherche l'utilisateur

    alt Authentification invalide
        Auth-->>Frontend: 401 Unauthorized
        Frontend-->>User: Affiche une erreur
    else Utilisateur authentifié
        Auth-->>Route: Ajoute request.user et autorise la requête
        Route->>Upload: Vérifie l'extension, le type MIME et la taille

        alt Fichier invalide
            Upload-->>Frontend: Requête refusée
            Frontend-->>User: Affiche une erreur de fichier
        else Fichier valide
            Upload->>Storage: Enregistre le fichier avec un nom UUID
            Storage-->>Upload: Fichier stocké
            Upload-->>Route: Ajoute request.file
            Route->>Validator: Valide documentData

            alt Données invalides
                Validator-->>Frontend: 400 Bad Request
                Frontend-->>User: Affiche les erreurs de validation
            else Données valides
                Validator-->>Route: Données validées
                Route->>Controller: uploadDocument()
                Controller->>Service: createUserDocument(userId, documentData, file)
                Service->>DB: Enregistre les métadonnées
                DB-->>Service: Document créé
                Service-->>Controller: Document nettoyé
                Controller-->>Frontend: 201 Created + document
                Frontend-->>User: Affiche un message de succès
            end
        end
    end
```

## 7. Workflow Git simplifié

```mermaid
gitGraph
    commit id: " "

    branch dev
    checkout dev
    commit id: "initial commit"

    branch documentation

    checkout dev
    commit id: "  "

    branch feature1
    checkout feature1
    commit id: "commit1"

    checkout dev
    merge feature1 id: "merge feature1"

    checkout documentation
    commit id: "feature1-doc"

    checkout dev
    commit id: "   "

    branch feature2
    checkout feature2
    commit id: "commit2"

    checkout dev
    merge feature2 id: "merge feature2"

    checkout documentation
    commit id: "feature2-doc"

    checkout dev
    merge documentation id: "merge documentation"

    checkout main
    merge dev id: "version stable" tag: "v1.0"
```

## 8. Historique Git simplifié : backend

```mermaid
gitGraph
    commit id: " "

    branch dev
    checkout dev
    commit id: "  "

    branch documentation
    checkout documentation
    commit id: "docs: create documentation branch"

    checkout dev
    commit id: "   "

    branch project-foundation
    checkout project-foundation
    commit id: "chore: initialize project structure"

    checkout dev
    merge project-foundation

    commit id: "    "

    branch backend-foundation
    checkout backend-foundation
    commit id: "feat: initialize backend package"
    commit id: "feat: setup express application"
    commit id: "feat: add health check endpoint"
    commit id: "feat: add basic error handling"
    commit id: "chore: add backend environment configuration"
    commit id: "chore: add backend docker service"
    commit id: "chore: add postgres docker service"
    commit id: "feat: add database health endpoint"
    commit id: "chore: install prisma"
    commit id: "feat: add initial prisma schema"
    commit id: "feat: add initial database migration"
    commit id: "chore: add prisma client configuration"
    commit id: "refactor: use prisma for database health endpoint"
    commit id: "fix: remove unused database configuration"

    checkout dev
    merge backend-foundation

    checkout documentation
    commit id: "docs: add backend manual validation guide"

    checkout dev
    commit id: "     "

    branch backend-auth
    checkout backend-auth
    commit id: "chore: configure backend eslint"
    commit id: "feat: add authentication route structure"
    commit id: "feat: add user registration"
    commit id: "feat: add email verification flow"
    commit id: "feat: add user login"
    commit id: "feat: add authentication middleware"
    commit id: "feat: add current user endpoint"
    commit id: "feat: add profile endpoints"
    commit id: "feat: add user settings endpoints"
    commit id: "feat: add password update endpoint"
    commit id: "feat: add password reset flow"
    commit id: "feat: add user data export endpoint"
    commit id: "feat: add account deletion endpoint"
    commit id: "fix: normalize authentication error responses"
    commit id: "feat: add email service configuration"
    commit id: "feat: send email verification email"
    commit id: "feat: send password reset email"
    commit id: "fix: remove development auth tokens from responses"

    checkout dev
    merge backend-auth

    checkout documentation
    commit id: "docs: add authentication manual validation"

    checkout dev
    commit id: "      "

    branch backend-applications
    checkout backend-applications
    commit id: "feat: add contacts crud"
    commit id: "feat: add applications crud"
    commit id: "feat: link contacts to applications"
    commit id: "feat: add tags crud"
    commit id: "feat: link tags to applications"
    commit id: "feat: add application history endpoint"

    checkout dev
    merge backend-applications

    checkout documentation
    commit id: "docs: add applications manual validation"

    checkout dev
    commit id: "       "

    branch backend-documents
    checkout backend-documents
    commit id: "feat: add document upload configuration"
    commit id: "feat: add documents crud"
    commit id: "feat: link documents to applications"

    checkout dev
    merge backend-documents

    checkout documentation
    commit id: "docs: add documents manual validation"

    checkout dev
    commit id: "        "

    branch backend-achievements
    checkout backend-achievements
    commit id: "feat: add achievements Prisma schema"
    commit id: "feat: add achievements catalog endpoint"
    commit id: "feat: unlock achievements from user actions"

    checkout dev
    merge backend-achievements

    checkout documentation
    commit id: "docs: add achievements manual validation"

    checkout dev
    commit id: "         "

    branch backend-cleanup
    checkout backend-cleanup
    commit id: "refactor: standardize contact validation and route order"
    commit id: "refactor: use english application values"
    commit id: "refactor: harmonize application routes and controller order"
    commit id: "refactor: harmonize application service structure"
    commit id: "refactor: harmonize supporting service structure"
    commit id: "refactor: harmonize supporting routes structure"
    commit id: "refactor: harmonize supporting validators structure"

    checkout dev
    merge backend-cleanup

    checkout documentation
    commit id: "docs: rewrite backend manual validation"

    checkout dev
    commit id: "          "

    branch backend-tests
    checkout backend-tests
    commit id: "test: cover health route"
    commit id: "test: cover error handling route"
    commit id: "test: cover error routes"
    commit id: "test: cover authentication routes"
    commit id: "test: cover applications routes"
    commit id: "test: standardize test descriptions"
    commit id: "test: cover profile routes"
    commit id: "test: cover tags routes"
    commit id: "test: cover contacts routes"
    commit id: "test: cover documents routes"
    commit id: "test: cover relation routes"
    commit id: "test: cover achievements routes"

    checkout dev
    merge backend-tests

    checkout documentation
    commit id: "docs: add automated backend tests summary"
    commit id: "docs: add swagger api documentation"

    checkout dev
    commit id: "           "

    branch update_contact_details
    checkout update_contact_details
    commit id: "feat: add contact professional fields to schema"
    commit id: "feat: support contact professional details"

    checkout dev
    merge update_contact_details

    commit id: "            "

    branch auth_cookies
    checkout auth_cookies
    commit id: "chore: add authentication cookie configuration"
    commit id: "feat: store authentication token in secure cookie"
    commit id: "feat: add authentication logout endpoint"
    commit id: "test: upgrade cookie tests and preserve development data"

    checkout dev
    merge auth_cookies

    checkout documentation
    commit id: "docs: update contact manual validation"
    commit id: "docs: update contact automated tests"
    commit id: "docs: update contact API documentation"

    checkout dev
    merge documentation
```

## 9. Historique Git simplifié : frontend

```mermaid
gitGraph
    commit id: " "

    branch dev
    checkout dev
    commit id: "  "

    branch documentation

    checkout dev
    commit id: "   "

    branch frontend-foundation
    checkout frontend-foundation
    commit id: "feat: initialize frontend application"
    commit id: "feat: add frontend base routing"
    commit id: "feat: add frontend api client foundation"

    checkout dev
    merge frontend-foundation

    commit id: "    "

    branch frontend-auth
    checkout frontend-auth
    commit id: "feat: add authentication api methods"
    commit id: "feat: add authentication context"
    commit id: "feat: add authentication forms"
    commit id: "feat: protect frontend routes"
    commit id: "feat: add frontend email verification flow"
    commit id: "feat: add frontend password reset flow"

    checkout dev
    merge frontend-auth

    commit id: "     "

    branch frontend-layout
    checkout frontend-layout
    commit id: "feat: add application header"
    commit id: "feat: add dashboard sidebar"
    commit id: "feat: add dashboard navigation pages"

    checkout dev
    merge frontend-layout

    commit id: "      "

    branch frontend-settings
    checkout frontend-settings
    commit id: "feat: add settings api calls"
    commit id: "feat: build user settings page"
    commit id: "feat: add legal account settings"
    commit id: "feat: add theme management"
    commit id: "feat: complete user settings experience"

    checkout dev
    merge frontend-settings

    commit id: "       "

    branch frontend-applications
    checkout frontend-applications
    commit id: "feat: add applications api client"
    commit id: "feat: add application creation modal"
    commit id: "refactor: split application modal components"
    commit id: "feat: add application details management"
    commit id: "feat: add applications table"
    commit id: "feat: add applications table controls"
    commit id: "feat: improve application date rules"

    checkout dev
    merge frontend-applications

    commit id: "        "

    branch frontend-contacts
    checkout frontend-contacts
    commit id: "feat: add contacts page"
    commit id: "feat: add contact cards and modal"

    checkout dev
    merge frontend-contacts

    commit id: "         "

    branch frontend-documents
    checkout frontend-documents
    commit id: "feat: add document upload modal"
    commit id: "feat: add document preview modal"
    commit id: "feat: add document cards with previews"
    commit id: "feat: build documents page"
    commit id: "fix: remove control regex from document names"
    commit id: "fix: polish document previews"

    checkout dev
    merge frontend-documents

    commit id: "          "

    branch frontend-componentization
    checkout frontend-componentization
    commit id: "chore: prepare frontend component structure"
    commit id: "refactor: restructure dashboard sidebar"
    commit id: "refactor: extract application select options"
    commit id: "refactor: reuse application options in details modal"
    commit id: "refactor: reuse application options in table"
    commit id: "refactor: extract application display helpers"
    commit id: "refactor: extract application form constants"
    commit id: "refactor: extract API response helpers"
    commit id: "refactor: extract string normalization helper"
    commit id: "refactor: extract application date helpers"
    commit id: "refactor: extract application relation helpers"
    commit id: "refactor: extract application label helpers"
    commit id: "refactor: organize application form sections"
    commit id: "refactor: simplify application creation modal"
    commit id: "refactor: share contact form fields"
    commit id: "refactor: share document upload fields"
    commit id: "refactor: simplify application details modal"
    commit id: "refactor: simplify applications table"
    commit id: "refactor: extract document helpers"
    commit id: "refactor: clean frontend organization"

    checkout dev
    merge frontend-componentization

    commit id: "           "

    branch frontend-calendar
    checkout frontend-calendar
    commit id: "feat: add calendar event utilities"
    commit id: "feat: add desktop applications calendar"
    commit id: "feat: add mobile calendar agenda view"

    checkout dev
    merge frontend-calendar

    commit id: "            "

    branch frontend-achievements
    checkout frontend-achievements
    commit id: "feat: add achievements objective page"

    checkout dev
    merge frontend-achievements

    commit id: "             "

    branch frontend-statistics
    checkout frontend-statistics
    commit id: "feat: add applications statistics page"
    commit id: "feat: add applications location map"
    commit id: "fix: improve monthly activity chart responsiveness"

    checkout dev
    merge frontend-statistics

    commit id: "              "

    branch frontend-dashboard
    checkout frontend-dashboard
    commit id: "feat: add dashboard overview page"

    checkout dev
    merge frontend-dashboard

    commit id: "               "

    branch frontend-ui_harmonization
    checkout frontend-ui_harmonization
    commit id: "refactor: normalize frontend ui baseline"
    commit id: "refactor: harmonize frontend navigation styles"
    commit id: "refactor: harmonize dashboard page headers"
    commit id: "refactor: simplify dashboard card styles"
    commit id: "refactor: add shared card components"
    commit id: "refactor: polish dashboard overview"

    checkout dev
    merge frontend-ui_harmonization
```
