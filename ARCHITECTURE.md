# NaijaTrust System Architecture

This document provides a technical overview of the NaijaTrust platform architecture, including high-level and low-level designs, as well as customer journey maps.

---

## 🏗️ High-Level Architecture

The NaijaTrust platform follows a modern full-stack architecture with a decoupled frontend and backend, using MongoDB as the primary data store and Render/Vercel for managed hosting.

```mermaid
graph TD
    subgraph "External Services"
        GoogleAuth["Google OAuth 2.0"]
        GmailSMTP["Gmail SMTP (Notifications)"]
        Paystack["Paystack Payment Gateway"]
        MongoDBAtlas["MongoDB Atlas (Database)"]
    end

    subgraph "Client Tier (Vercel)"
        Frontend["React + Vite (Frontend)"]
    end

    subgraph "Application Tier (Render)"
        Backend["Node.js + Express (API)"]
        Auth["Passport.js (Auth Logic)"]
        Cron["Background Jobs (Seed/Cleanup)"]
    end

    Frontend -- "HTTPS / JSON" --> Backend
    Backend -- "Mongoose ODM" --> MongoDBAtlas
    Backend -- "REST API" --> Paystack
    Backend -- "SMTP" --> GmailSMTP
    Backend -- "OAuth" --> GoogleAuth
```

---

## 🧩 Low-Level Component Architecture

Detailed view of the backend services and model relationships.

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String password
        +Boolean isEmailVerified
        +ObjectId[] likedBusinesses
    }

    class Business {
        +String name
        +String category
        +String location
        +Number rating
        +Number likes
        +ObjectId owner
        +Enum claimStatus
    }

    class BusinessUser {
        +String name
        +String email
        +ObjectId[] claimedBusinesses
        +Enum tier
    }

    class Review {
        +ObjectId user
        +ObjectId business
        +Number rating
        +String content
        +Number likes
    }

    class UpgradeRequest {
        +ObjectId businessId
        +Enum tier
        +Enum status
        +String paystackReference
    }

    User "1" -- "*" Review : writes
    Business "1" -- "*" Review : receives
    BusinessUser "1" -- "*" Business : owns
    Business "1" -- "*" UpgradeRequest : initiates
```

---

## 🛤️ Customer Journeys

### 1. Regular User Journey (Discovery & Trust)
The path for a consumer looking for reliable Nigerian businesses.

```mermaid
journey
    title Consumer Discovery Journey
    section Discovery
      Landing Page: 5: User
      Search for Category: 4: User
      Filter by Location: 4: User
    section Evaluation
      View Business Profile: 5: User
      Read Reviews: 4: User
      Check Verification Badge: 5: User
    section Engagement
      Like Business: 4: User
      Write Honest Review: 5: User
      Share Profile: 3: User
```

### 2. Business User Journey (Growth & Reputation)
The path for a business owner leveraging NaijaTrust to build credibility.

```mermaid
journey
    title Business Owner Growth Journey
    section Onboarding
      Create Business Account: 5: Owner
      Find & Claim Business: 4: Owner
      Verify Ownership: 5: Owner
    section Reputation
      Monitor Dashboard Likes: 4: Owner
      Analyze Visit Stats: 4: Owner
      Respond to Feedback: 5: Owner
    section Scaling
      Upgrade to Verified Tier: 4: Owner
      Pay via Paystack: 5: Owner
      Unlock Premium Analytics: 5: Owner
```

---

## 🔐 Security Architecture

- **Authentication**: JWT-based stateless authentication for API requests.
- **Privacy**: Passwords hashed using bcrypt; sensitive data stored in environment variables.
- **Communication**: TLS/SSL encryption for all data in transit.
- **Compliance**: Email verification requirement for consumers; ownership verification for businesses.
