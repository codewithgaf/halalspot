# HalalSpot

**Discover halal dining with greater confidence.**

HalalSpot is a halal restaurant discovery platform designed to help people find restaurants, explore menus, understand available halal information, and make informed dining decisions.

> **Project status:** Early development — MVP in progress.

## Project Goals

- Help users discover halal dining options.
- Provide clear information about restaurants and their locations.
- Distinguish verified halal certification, restaurant self-declarations, and unknown halal status.
- Support transparent restaurant information and community feedback.
- Build a secure, maintainable, and scalable full-stack application.

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | PHP, Laravel |
| Frontend | React, TypeScript |
| Server-driven SPA | Inertia.js |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Testing | PHPUnit or Pest |
| Version Control | Git and GitHub |
| CI/CD | GitHub Actions |
| Development OS | Fedora Linux |

**Architecture:** Modular monolith.

The technologies above represent the intended stack. Individual integrations will be documented as they are completed.

## MVP Features

### Restaurant Discovery
- Browse restaurant listings.
- Search restaurants by name or location.
- Filter restaurants by available halal information.
- View restaurant details.

### Halal Information
- Display halal certification evidence when available.
- Identify restaurant self-declared halal claims.
- Clearly display unknown or unverified halal status.
- Record evidence sources and verification dates where applicable.

### User Accounts
- User registration and authentication.
- Profile management.
- Authorized access to protected features.

### Reviews
- Submit restaurant reviews.
- View community feedback.
- Apply moderation and authorization rules.

### Administration
- Manage restaurant records.
- Review submitted halal information.
- Moderate user-generated content.

These features are planned and should not be considered implemented until verified by tests.

## Local Development

### Prerequisites
- Compatible PHP version
- Composer
- Node.js and npm
- PostgreSQL
- Git

### Installation

```bash
git clone <repository-url>
cd halalspot

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure the local database connection in `.env`.

```bash
php artisan migrate
```

Start the application using the development commands appropriate to the installed Laravel starter configuration.

For a standard Laravel setup:

```bash
php artisan serve
```

In a separate terminal:

```bash
npm run dev
```

### Testing

```bash
php artisan test
```

The test suite will grow as features are implemented.

## Engineering Principles

HalalSpot follows these principles:

- Clean, readable, maintainable code
- Small, focused changes
- Test-driven thinking
- Secure defaults
- Database integrity
- Accessible and responsive interfaces
- Clear technical documentation
- Continuous integration

## Documentation

Technical documentation lives in the `docs/` directory.

Planned documents include:

- Product requirements
- MVP scope and user stories
- System architecture
- Database design
- Engineering decisions
- Testing strategy
- Deployment guide

## Development Workflow

1. Create a GitHub issue.
2. Create a feature branch.
3. Implement a small, focused change.
4. Add or update tests.
5. Run validation and tests.
6. Open a pull request.
7. Review and merge after checks pass.

## Roadmap

- [x] Initialize Laravel application
- [x] Initialize Git and create initial commit
- [ ] Create and connect GitHub repository
- [ ] Configure PostgreSQL
- [ ] Set up React, TypeScript, and Inertia.js
- [ ] Implement authentication
- [ ] Implement restaurant discovery
- [ ] Implement halal information tracking
- [ ] Implement reviews
- [ ] Implement administration
- [ ] Add CI/CD
- [ ] Deploy MVP

## Security

Do not commit credentials, API keys, production data, or `.env` files.

Security issues should be reported privately using the process described in `SECURITY.md`.

## License

License selection is pending.

## Maintainer

Developed as a full-stack software engineering and portfolio project.

**HalalSpot — Making halal dining easier to discover.**
