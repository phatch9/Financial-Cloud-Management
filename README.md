# Cloud-Budget-Management
A Multi-users Full-stack application with Java, Spring Boot, and AWS infrastructure that allows users to track income and expenses, and visualize their finances
--
## Core Features:
| Features | Description | Implementation |
| ------- | ------ | ------- |
| User Management | Secure registration, login, and user profiles | Spring Security (OAuth2/JWT) for authentication and authorization |
| Transaction CRUD | Ability to create, read, update, and delete financial transactions (e.g., groceries, salary).	| Spring Data JPA (Hibernate) for persistence and REST controllers |
| Budgeting	Users | Set spending limits per category | Business logic layer to calculate remaining budget dynamically|
| Reporting & Dashboards | Visualizations of spending trends, category breakdowns, and monthly summaries | REST endpoints provide structured data to the frontend for charting (e.g., D3.js or Chart.js)|
| Receipt Upload | Option to upload a photo of a receipt for a transaction.	| AWS S3 integration via the Spring Cloud AWS SDK|
---
## Technology Stack & AWS Integration
Demonstrating how SpringBoot Framework fully integrates with AWS services:

Frontend:
Modern Java framework like React or Angular (as suggested in search results) to consume the Spring Boot REST APIs.

Structure: Single-page application (SPA).

Communication: Axios/Fetch to consume the JSON REST APIs exposed by the Spring Boot server.

Styling: Tailwind CSS or custom CSS for a modern, responsive design.
Backend (Java / Spring Boot)
- Framework: Spring Boot 3 (using Java 17+).
- Data Access: Spring Data JPA with a relational database (PostgreSQL/MySQL).
- Security: Spring Security for user authentication and authorization.
- Deployment Packaging: Dockerfile to containerize the Spring Boot JAR for modern deployment.

AWS Infrastructure
