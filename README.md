# JobTrace

## Description

JobTrace is a full-stack web application designed to help job seekers centralize, organize and monitor their job applications.

Instead of managing multiple spreadsheets, emails and documents, JobTrace provides a single workspace where users can manage applications, companies, contacts and documents while keeping track of interviews, follow-ups and personal objectives.

The project was developed as part of the French RNCP Level 6 "Concepteur Développeur d'Applications" certification and focuses on building a modern, secure and maintainable web application using current development practices.

## Objectives

- Centralize every job application in a single dashboard.
- Simplify application tracking and follow-up management.
- Manage companies, recruiters and professional contacts.
- Store documents related to applications.
- Visualize application progress and personal statistics.
- Apply modern web development, testing and security practices.

## Tech Stack

![HTML5 badge](https://img.shields.io/badge/HTML5-e34f26?logo=html5&logoColor=white&style=for-the-badge)
![CSS3 badge](https://img.shields.io/badge/CSS3-1572b6?logo=css&logoColor=white&style=for-the-badge)
![JavaScript badge](https://img.shields.io/badge/JAVASCRIPT-f7df1e?logo=javascript&logoColor=black&style=for-the-badge)
![Vite badge](https://img.shields.io/badge/VITE-9135ff?logo=vite&logoColor=white&style=for-the-badge)
![REACT badge](https://img.shields.io/badge/REACT-61dafb?logo=react&logoColor=black&style=for-the-badge)
![Tailwind CSS badge](https://img.shields.io/badge/TAILWIND&nbsp;CSS-06b6d4?logo=tailwindcss&logoColor=white&style=for-the-badge)
![DaisyUI badge](https://img.shields.io/badge/DAISYUI-1ad1a5?logo=daisyui&logoColor=white&style=for-the-badge)
![Lucide REACT badge](https://img.shields.io/badge/LUCIDE&nbsp;REACT-f56565?logo=lucide&logoColor=white&style=for-the-badge)
![Node.js badge](https://img.shields.io/badge/NODE.JS-5fa04e?logo=node.js&logoColor=white&style=for-the-badge)
![PostgreSQL badge](https://img.shields.io/badge/POSTGRESQL-4169e1?logo=postgresql&logoColor=white&style=for-the-badge)
![Prisma badge](https://img.shields.io/badge/PRISMA-2d3748?logo=prisma&logoColor=white&style=for-the-badge)
![JSON badge](https://img.shields.io/badge/JSON-000000?logo=json&logoColor=white&style=for-the-badge)
![Docker badge](https://img.shields.io/badge/DOCKER-2496ed?logo=docker&logoColor=white&style=for-the-badge)
![Git badge](https://img.shields.io/badge/GIT-f05032?logo=git&logoColor=white&style=for-the-badge)
![GitHub badge](https://img.shields.io/badge/GITHUB-181717?logo=github&logoColor=white&style=for-the-badge)
![Markdown badge](https://img.shields.io/badge/MARKDOWN-000000?logo=markdown&logoColor=white&style=for-the-badge)

## File Description

| **FILE**                  | **DESCRIPTION**                                                                                                     |
| :-----------------------: | ------------------------------------------------------------------------------------------------------------------- |
| `assets/`                  | Contains the resources required for the repository.                                                                 |
| `backend/`                 | Contains the Express REST API, authentication, business logic, and database access.                                 |
| `frontend/`                | Contains the React single-page application and its user interface.                                                  |
| `docs/`                    | Contains the project report submitted for the RNCP certification, along with its diagrams and supporting resources. |
| `.env.example`            | Provides an example of the environment variables required to configure the project.                                 |
| `docker-compose.prod.yml` | Defines the Docker services and configuration used for the production environment.                                  |
| `docker-compose.yml`      | Defines the Docker services required to run the complete project locally.                                           |
| `.gitignore`              | Specifies files and folders to be ignored by Git.                                                                   |
| `README.md`               | The README file you are currently reading 😉.                                                                       |

## Installation & Usage

### Installation

1. Clone this repository:
    - Open your preferred Terminal.
    - Navigate to the directory where you want to clone the repository.
    - Run the following command:

```
git clone https://github.com/fchavonet/full_stack-jobtrace.git
```

2. Open the cloned repository.

3. Start the complete application:

```
docker compose up --build
```

### Usage

1. Open your browser and navigate to:

```
http://localhost:3000
```

You can also test the project online by clicking [here](https://www.jobtrace.fr/).

> To better understand the project’s design and development process, you can consult the PDF available in the `docs/` directory at the root of the repository. It contains the project report submitted for the RNCP certification, along with the associated diagrams and supporting resources (written in French). For more detailed technical information, refer to the dedicated README files located in the `frontend/` and `backend/` directories.

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/dashboard-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/dashboard-dark.webp">
        <img width="100%" src="./assets/images/screenshots/dashboard-light.webp" alt="Dashboard">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/applications-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/applications-dark.webp">
        <img width="100%" src="./assets/images/screenshots/applications-light.webp" alt="Applications">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/application_form-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/application_form-dark.webp">
        <img width="100%" src="./assets/images/screenshots/application_form-light.webp" alt="Application form">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/calendar-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/calendar-dark.webp">
        <img width="100%" src="./assets/images/screenshots/calendar-light.webp" alt="Calendar">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/achievements-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/achievements-dark.webp">
        <img width="100%" src="./assets/images/screenshots/achievements-light.webp" alt="Achievements">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/contacts-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/contacts-dark.webp">
        <img width="100%" src="./assets/images/screenshots/contacts-light.webp" alt="Contacts">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/documents-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/documents-dark.webp">
        <img width="100%" src="./assets/images/screenshots/documents-light.webp" alt="Documents">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/statistics-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/statistics-dark.webp">
        <img width="100%" src="./assets/images/screenshots/statistics-light.webp" alt="Statistics">
    </picture>
</p>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/settings-light.webp">
        <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/settings-dark.webp">
        <img width="100%" src="./assets/images/screenshots/settings-light.webp" alt="Settings">
    </picture>
</p>

<table align="center">
    <tr>
        <th align="center" style="text-align: center;">Desktop view</th>
        <th align="center" style="text-align: center;">Tablet view</th>
        <th align="center" style="text-align: center;">Mobile view</th>
    </tr>
    <tr valign="top">
        <td align="center">
            <picture>
                <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/homepage-desktop-light.webp">
                <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/homepage-desktop-dark.webp">
                <img width="100%" src="./assets/images/screenshots/homepage-desktop-light.webp" alt="Desktop Screenshot">
            </picture>
        </td>
        <td align="center">
            <picture>
                <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/homepage-tablet-light.webp">
                <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/homepage-tablet-dark.webp">
                <img width="100%" src="./assets/images/screenshots/homepage-tablet-light.webp" alt="Tablet Screenshot">
            </picture>
        </td>
        <td align="center">
            <picture>
                <source media="(prefers-color-scheme: light)" srcset="./assets/images/screenshots/homepage-mobile-light.webp">
                <source media="(prefers-color-scheme: dark)" srcset="./assets/images/screenshots/homepage-mobile-dark.webp">
                <img width="100%" src="./assets/images/screenshots/homepage-mobile-light.webp" alt="Mobile Screenshot">
            </picture>
        </td>
    </tr>
</table>

## What's Next?

- Strengthen application security.
- Add city autocomplete using an external API.
- Improve the user interface and overall user experience.
- Complete the CI/CD pipeline with automated deployment to the VPS.

## Thanks

- I would like to thank all those who participated or helped to carry out this project.
- A big thank you to my friends Pierre and Yoann, always available to test and provide feedback on my projects.

## Author(s)

**Fabien CHAVONET**
- GitHub: [@fchavonet](https://github.com/fchavonet)
- LinkedIn: [Fabien Chavonet](https://www.linkedin.com/in/fchavonet/)
