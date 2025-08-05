# SEO Tools Audit

## API Overview
This document provides a comprehensive audit of the existing APIs within the SEO Analyzer application.

### Available Endpoints

#### **User Authentication**
- **POST /api/auth/login**: Handles user login.
- **POST /api/auth/logout**: Handles user logout.
- **POST /api/auth/register**: Handles user registration.

#### **User Profile**
- **GET /api/users/me**: Retrieves current user's profile.
- **PATCH /api/users/me**: Updates current user's profile.

#### **Admin Management**
- **GET /api/admin/users**: Lists users with pagination and filtering.
- **POST /api/admin/users**: Creates a new user.
- **GET /api/admin/users/[id]**: Retrieves detailed information about a specific user.
- **PATCH /api/admin/users/[id]**: Updates a specific user.
- **DELETE /api/admin/users/[id]**: Deletes a specific user.

#### **Project Management**
- **GET /api/projects**: Lists user projects.
- **POST /api/projects**: Creates a new project.

#### **Project Audits**
- **GET /api/projects/[id]/audits**: Gets audits for a specific project.
- **POST /api/projects/[id]/audits**: Creates a new audit for a project.

#### **SEO Audits**
- **GET /api/seo-audits**: Fetches SEO audits for the current user.

#### **Subscription**
- **GET /api/subscription/me**: Retrieves user subscription.
- **POST /api/subscription**: Creates a user subscription.
- **DELETE /api/subscription/me**: Cancels the user subscription.

### Missing Endpoints
- **PUT /api/projects**: Update existing projects.
- **DELETE /api/projects**: Delete existing projects.
- **Various SEO tools related endpoints**: Such as keyword tracking, competitor analysis.

### Data Contracts
- **User Model**:
  - Properties: id, name, email, isAdmin, createdAt, updatedAt.
- **Project Model**:
  - Properties: id, name, domain, createdAt, updatedAt.
- **Subscription Model**:
  - Properties: id, planId, status, createdAt, endDate.

## UI Components

### Reusable UI Components
- **Theme Provider**: Provides theme and toggling functionality.
- **Button**: Provides various button styles and sizes.
- **Badge**: Used for labels such as 'Popular', 'New'.
- **Card**: Structured card layout for displaying information.
- **Progress**: Dynamic progress indicator.
- **Select**: Styled select dropdowns.
- **Stats Card (Dashboard)**: Displays project statistics with performance metrics.

### Notes
- **ThemeProvider** and **AuthProvider** are extensively used to wrap application layouts and facilitate context-based theming and authentication.
- **Cards** and **Buttons** are extensively customizable and vary based on theme and context.

## Conclusion
The audit reveals a well-structured API with a comprehensive approach to managing user authentication, subscriptions, projects, and audits. However, there is a need to implement additional endpoints for enhanced SEO tool functionalities such as detailed keyword tracking and competitor analysis.

All components are designed with reusability in mind, offering easy integration and customization within the application.
