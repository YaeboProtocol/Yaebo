# STD Protocol Implementation Blueprint

## Project Overview

This document outlines a detailed plan for implementing the Securely Tradable Debts (STD) MVP platform based on the provided specification. The platform enables tokenizing high-margin manufacturing debt, allowing crypto investors to fund manufacturers and earn real-world yields.

## Key Components

1. **Authentication & Authorization**
   - Google login for all users
   - Wallet connection for DAO members
   - Role-based access control

2. **User Interfaces**
   - Manufacturer onboarding & dashboard
   - Diligence Firm review interface
   - DAO proposal & voting system
   - Investor marketplace

3. **Data Management**
   - Supabase database
   - File storage for documents
   - Real-time updates for marketplace

4. **Core Functionality**
   - Application submission & review
   - Proposal creation & voting
   - Mock marketplace for investments
   - Dashboard analytics

## Implementation Plan

### Phase 1: Project Setup & Authentication

#### Step 1.1: Project Initialization

```
Create a new Next.js project for the STD Protocol platform. Set up the project with TypeScript, Tailwind CSS, and configure it to use the App Router. Install necessary dependencies including shadcn/ui components and Supabase client libraries. Create a basic project structure with appropriate directories for components, hooks, and utilities.

Key tasks:
1. Initialize Next.js project with TypeScript
2. Install and configure Tailwind CSS
3. Set up shadcn/ui
4. Install Supabase client
5. Create basic folder structure
6. Configure environment variables
```

#### Step 1.2: Supabase Integration

```
Set up a Supabase project and configure the database schema based on the specification. Create tables for users, manufacturer applications, proposals, marketplace items, and investments. Define relationships between tables and set up appropriate indexes and constraints. Implement API utilities for interacting with Supabase.

Key tasks:
1. Create Supabase project
2. Define database schema for all entities
3. Set up storage buckets for file uploads
4. Create utility functions for database operations
5. Implement error handling for database operations
```

#### Step 1.3: Authentication System

```
Implement authentication using Supabase Auth with Google login. Create a custom auth provider component that manages the authentication state across the application. Add user role management to associate different permissions with manufacturers, diligence firms, DAO members, and investors. Implement protected routes based on user roles.

Key tasks:
1. Set up Supabase Auth with Google provider
2. Create an AuthContext and provider component
3. Implement login/logout functionality
4. Create user role management system
5. Set up protected routes
6. Add wallet connection for DAO members
```

### Phase 2: Core User Interfaces

#### Step 2.1: Layout & Navigation

```
Create the main application layout including header, navigation, and footer components. Implement responsive design using Tailwind CSS following the white/yellow theme specified. Create navigation that adapts based on user role and authentication status. Implement the Inter V font and establish a consistent UI pattern library.

Key tasks:
1. Create main layout component
2. Build responsive header with navigation
3. Implement footer
4. Set up role-based navigation
5. Configure theme with white/yellow color scheme
6. Set up Inter V font
```

#### Step 2.2: Dashboard Components

```
Build the core dashboard components that will be used across different user roles. Create reusable card components, status indicators, notification system, and data tables. Implement skeleton loaders for asynchronous content and error states for failed operations.

Key tasks:
1. Create dashboard layout
2. Build reusable card components
3. Implement status indicators with different states
4. Create notification component for system messages
5. Build data table component with sorting and filtering
6. Add skeleton loaders for async content
```

#### Step 2.3: Form Components

```
Develop reusable form components for data input across the application. Create form validation utilities using a library like zod or yup. Implement file upload components that work with Supabase Storage and have appropriate validation and error handling. Create a multi-step form wizard for complex processes.

Key tasks:
1. Build form input components
2. Create file upload component with preview
3. Implement form validation with error messages
4. Create multi-step form wizard component
5. Add form submission handling with loading states
```

### Phase 3: Manufacturer Module

#### Step 3.1: Manufacturer Onboarding Form

```
Implement the manufacturer onboarding form based on the data model in the specification. Create a multi-step form that collects company information, SME details, and allows document uploads. Add validation for all fields and implement the submission process that saves data to Supabase.

Key tasks:
1. Create manufacturer registration page
2. Build multi-step form for all required fields
3. Implement document upload functionality
4. Add form validation for all inputs
5. Create submission handler that saves to Supabase
6. Add success/error feedback
```

#### Step 3.2: Manufacturer Dashboard

```
Build the manufacturer dashboard that displays application status, documents, and comments. Implement the ability to view application details, upload additional documents when requested, and respond to comments from the diligence firm. Add real-time updates for status changes.

Key tasks:
1. Create manufacturer dashboard layout
2. Build application status display
3. Implement document viewer/uploader
4. Create comment thread component
5. Add functionality to respond to "Needs More Info" requests
6. Implement real-time updates for status changes
```

### Phase 4: Diligence Firm Module

#### Step 4.1: Application Review Interface

```
Develop the diligence firm interface for reviewing manufacturer applications. Create components to view all applications with filtering and sorting options. Implement detailed application view with document preview capabilities. Add functionality to update application status and add comments.

Key tasks:
1. Create applications list view with filters
2. Build detailed application view
3. Implement document viewer
4. Add status update functionality
5. Create comment system for providing feedback
6. Implement file attachment for comments
```

#### Step 4.2: Proposal Creation

```
Implement the proposal creation interface for the diligence firm. Create a form to set lot size, share price, and maximum investment per investor. Add validation and submission handling. Implement the ability to generate a proposal for DAO voting after accepting an application.

Key tasks:
1. Create proposal creation form
2. Add validation for proposal parameters
3. Implement submission to create DAO proposal
4. Build preview of how proposal will appear
5. Add confirmation step before submission
```

#### Step 4.3: Analytics Dashboard

```
Build a mock analytics dashboard for the diligence firm showing application statistics, funding rates, and approval times. Create visualizations using a charting library like Chart.js or Recharts. Implement filtering options for date ranges and application types.

Key tasks:
1. Create analytics dashboard layout
2. Implement chart components for key metrics
3. Build statistics summary cards
4. Add mock data generation
5. Implement date filtering functionality
```

### Phase 5: DAO Module

#### Step 5.1: Proposal Listing

```
Develop the DAO proposal listing page that shows all proposals with their current status. Implement filtering by status (voting, closed, marketplace). Create detailed proposal view with all relevant information including lot size, share price, and maximum investment per investor.

Key tasks:
1. Create proposal listing page
2. Implement proposal card component
3. Add filtering by proposal status
4. Build detailed proposal view
5. Create proposal statistics summary
```

#### Step 5.2: Voting System

```
Implement the DAO voting system that allows members to vote on proposals. Create voting interface with options for lot size, share price, and maximum investment per investor. Add vote tracking and display of current results. Implement time-based closing of polls after one week.

Key tasks:
1. Create voting interface
2. Implement vote submission
3. Build vote results display
4. Add timer for poll closing
5. Create vote confirmation and feedback
6. Implement wallet verification for voting
```

#### Step 5.3: Comments and Discussion

```
Build a comment system for DAO proposals that allows members to discuss proposals. Implement a flat thread structure with the ability to attach files. Add real-time updates for new comments and proper formatting for different content types.

Key tasks:
1. Create comment thread component
2. Implement comment submission
3. Add file attachment functionality
4. Build comment display with formatting
5. Implement real-time updates for new comments
```

### Phase 6: Investor Module

#### Step 6.1: Marketplace Listing

```
Develop the marketplace interface for investors to browse available proposals. Create filtering and sorting options for different investment parameters. Implement detailed view of each opportunity with all relevant information. Add progress indicators for funding status.

Key tasks:
1. Create marketplace listing page
2. Build investment opportunity cards
3. Implement filtering and sorting
4. Create detailed investment view
5. Add funding progress indicators
6. Implement real-time updates for funding progress
```

#### Step 6.2: Investment Functionality

```
Implement the mock investment functionality that allows investors to purchase lots. Create a purchase interface with quantity selection and confirmation. Add transaction recording to the database and update funding progress in real-time. Implement maximum investment limits per investor.

Key tasks:
1. Build investment purchase interface
2. Create quantity selector with validation
3. Implement mock transaction processing
4. Add confirmation flow
5. Update database and real-time funding progress
6. Implement investment limits enforcement
```

#### Step 6.3: Investor Dashboard

```
Create the investor dashboard showing investments, status, and claimable returns. Implement a portfolio view with all current investments and their performance. Add mock functionality for claiming returns. Create notifications for important investment events.

Key tasks:
1. Build investor dashboard layout
2. Create investment portfolio view
3. Implement investment detail cards
4. Add mock returns calculation
5. Create claim returns functionality
6. Implement notification system
```

### Phase 7: File Handling and Storage

#### Step 7.1: Document Upload System

```
Implement a comprehensive document upload system that handles different file types and validates uploads. Create a secure storage solution using Supabase Storage with appropriate access controls. Implement fallback to uploadthing if Supabase Storage fails. Add progress tracking for uploads.

Key tasks:
1. Create file upload component
2. Implement file type and size validation
3. Build Supabase Storage integration
4. Add uploadthing fallback
5. Create progress indicator for uploads
6. Implement error handling for failed uploads
```

#### Step 7.2: Document Viewer

```
Build a document viewer that can display different file types including PDFs and images. Implement preview generation for documents. Add the ability to download documents and display metadata. Create a file browser for managing multiple documents.

Key tasks:
1. Create document viewer component
2. Implement PDF viewer
3. Build image viewer with zoom
4. Add document metadata display
5. Create download functionality
6. Implement file browser for multiple documents
```

### Phase 8: Notifications and Real-time Updates

#### Step 8.1: Notification System

```
Implement a notification system that logs important events and displays them to users. Create mock email notifications that are displayed in the dashboard. Add real-time updates for new notifications using Supabase real-time features.

Key tasks:
1. Create notification data model
2. Build notification display component
3. Implement mock email generation
4. Add notification indicators
5. Create notification settings
6. Implement real-time updates for new notifications
```

#### Step 8.2: Real-time Updates

```
Enhance the application with real-time updates for critical components using Supabase real-time. Implement real-time updates for marketplace funding progress, application status changes, and new comments. Add presence indicators for active users on proposal discussions.

Key tasks:
1. Set up Supabase real-time subscriptions
2. Implement real-time updates for marketplace
3. Add real-time status updates for applications
4. Create real-time comment updates
5. Build presence indicators for active users
6. Implement error handling for real-time failures
```

### Phase 9: Polishing and Deployment

#### Step 9.1: Error Handling and Edge Cases

```
Improve the application's robustness by implementing comprehensive error handling and addressing edge cases. Create user-friendly error messages for different scenarios. Implement retry mechanisms for failed operations and proper loading states throughout the application.

Key tasks:
1. Create error boundary components
2. Implement toast notifications for errors
3. Add retry mechanisms for failed operations
4. Create fallback UI components
5. Implement proper loading states
6. Add offline detection and handling
```

#### Step 9.2: Performance Optimization

```
Optimize the application for performance by implementing code splitting, lazy loading, and image optimization. Add caching strategies for frequent database queries. Optimize component re-renders and implement memoization where appropriate.

Key tasks:
1. Implement code splitting for routes
2. Add lazy loading for heavy components
3. Optimize image loading and display
4. Implement query caching
5. Reduce unnecessary re-renders
6. Add performance monitoring
```

#### Step 9.3: Testing and Quality Assurance

```
Implement testing for critical components and functionality. Create unit tests for utility functions and API calls. Add integration tests for key user flows. Implement end-to-end tests for critical paths. Create a QA checklist for manual testing.

Key tasks:
1. Set up testing framework
2. Create unit tests for utilities
3. Implement component tests
4. Add integration tests for key flows
5. Create end-to-end tests for critical paths
6. Build QA checklist for manual testing
```

#### Step 9.4: Deployment

```
Prepare the application for deployment. Set up environment configurations for development, staging, and production. Implement proper security measures including CORS and authentication protection. Configure CI/CD pipelines for automated deployment.

Key tasks:
1. Configure environment variables
2. Set up deployment platform
3. Implement security measures
4. Create CI/CD pipeline
5. Add monitoring and logging
6. Perform final deployment and testing
```

## LLM Prompts for Implementation

### Prompt 1: Project Setup & Basic Structure

```
Create a new Next.js project for the STD Protocol platform with the following specifications:

1. Initialize a Next.js project with TypeScript and App Router
2. Configure Tailwind CSS with a white/yellow theme
3. Set up shadcn/ui components
4. Install Supabase client libraries
5. Create the following folder structure:
   - app/ (for Next.js App Router)
   - components/ (for reusable UI components)
   - lib/ (for utilities and shared code)
   - types/ (for TypeScript interfaces)
   - hooks/ (for custom React hooks)
   - public/ (for static assets)

Create a .env.local file template with the necessary environment variables for Supabase and other configurations.

Implement a basic layout component with header, main content area, and footer. Use Inter V font and establish a consistent white/yellow theme as specified.
```

### Prompt 2: Supabase Configuration & Database Schema

```
Set up the Supabase database schema for the STD Protocol platform based on the specification. Implement the following:

1. Create TypeScript types for all database tables
2. Implement a Supabase client configuration
3. Create the following database tables with appropriate relationships:
   - users (with role field for manufacturer, diligence firm, dao, investor)
   - manufacturer_applications (with all fields from spec)
   - application_documents (linked to applications)
   - application_comments (linked to applications)
   - proposals (linked to applications)
   - proposal_votes (linked to proposals)
   - proposal_comments (linked to proposals)
   - marketplace_items (linked to proposals)
   - investments (linking investors to marketplace items)

Create utility functions for common database operations (create, read, update, delete) for each entity.

Set up Supabase storage buckets for document uploads with appropriate permissions.
```

### Prompt 3: Authentication System

```
Implement the authentication system for the STD Protocol platform using Supabase Auth. Create the following:

1. Set up Google OAuth provider in Supabase
2. Create an AuthContext and provider component that manages authentication state
3. Implement login/logout functionality with Google
4. Create a user registration flow that captures role information
5. Implement wallet connection for DAO members using a library like Web3Modal or RainbowKit
6. Create protected routes that redirect unauthenticated users or those without appropriate roles
7. Add a user profile page that displays basic information and role

Make sure all authentication state is properly managed and persisted using localStorage or cookies where appropriate.
```

### Prompt 4: Manufacturer Onboarding

```
Implement the manufacturer onboarding form and dashboard based on the specification. Create the following:

1. A multi-step form for manufacturer application with the following sections:
   - Company Information (name, Stellar pubkey, contact, website)
   - SME Information (name, reg #, jurisdiction, address, website)
   - Document Uploads (incorporation cert, tax cert, audited financials, business plan, etc.)
   - Investment Terms (lot price, total lots, max per investor, min period, expected return)

2. Document upload component that supports PDFs and images with preview

3. Form validation using a library like zod with appropriate error messages

4. Submission handler that saves all data to Supabase and handles file uploads

5. A manufacturer dashboard that displays:
   - Application status with visual indicator
   - Uploaded documents with ability to view
   - Comments from diligence firm with ability to respond
   - Option to upload additional documents when status is "Needs More Info"

Make sure all forms have proper loading states and error handling.
```

### Prompt 5: Diligence Firm Interface

```
Create the diligence firm interface for reviewing manufacturer applications. Implement the following:

1. A dashboard that lists all applications with:
   - Filtering by status (Submitted, Under Review, Needs More Info, Accepted, Rejected)
   - Sorting by date, company name, etc.
   - Status indicators for each application
   - Quick action buttons

2. A detailed application view that shows:
   - All application information in a structured format
   - Document viewer for uploaded files
   - Comment thread with ability to add new comments
   - Status update controls to change application status
   - Button to create proposal after acceptance

3. Proposal creation form with fields for:
   - Lot size
   - Share price
   - Maximum investment per investor
   - Summary and investment terms

4. A mock analytics dashboard showing:
   - Number of applications by status
   - Funding rate
   - Average approval time
   - Simple charts visualizing this data

Ensure all actions have proper confirmation dialogs and loading states.
```

### Prompt 6: DAO Voting System

```
Implement the DAO voting system for proposals. Create the following components and functionality:

1. A proposal listing page that shows all proposals with:
   - Status indicators (voting, closed, marketplace)
   - Key proposal details
   - Voting progress
   - Time remaining for open polls

2. A detailed proposal view with:
   - All proposal information
   - Current voting results
   - Voting interface for authenticated DAO members
   - Comment thread for discussion

3. A voting interface that allows DAO members to:
   - Vote on lot size
   - Vote on share price
   - Vote on maximum investment per investor
   - See current voting results
   - See time remaining for voting

4. A comment system that:
   - Displays flat thread of comments
   - Allows adding new comments
   - Supports file attachments
   - Updates in real-time using Supabase real-time

Ensure that only authenticated DAO members (with connected wallets) can vote and create proposals.
```

### Prompt 7: Investor Marketplace

```
Create the investor marketplace and dashboard for the STD Protocol. Implement the following:

1. A marketplace listing page that shows all available investment opportunities with:
   - Key details (lot price, total lots, expected return, period)
   - Funding progress indicator
   - Quick invest button
   - Filtering and sorting options

2. A detailed investment view that shows:
   - All proposal details
   - Research summary
   - Risk assessment
   - Investment terms
   - Funding progress
   - Investment interface

3. An investment interface that:
   - Allows selecting number of lots to purchase
   - Shows total investment amount
   - Validates against maximum investment limit
   - Processes mock transaction
   - Updates funding progress in real-time

4. An investor dashboard that shows:
   - Portfolio overview with total investment and returns
   - List of current investments with status
   - Claimable returns (mocked)
   - Transaction history
   - Notification center for investment updates

Implement real-time updates for funding progress using Supabase real-time features.
```

### Prompt 8: Document Management System

```
Implement a comprehensive document management system for the STD Protocol. Create the following:

1. A file upload component that:
   - Supports multiple file types (PDF, images)
   - Validates file type and size
   - Shows upload progress
   - Handles errors gracefully
   - Uploads to Supabase Storage
   - Falls back to uploadthing if Supabase fails

2. A document viewer that:
   - Renders PDFs inline
   - Displays images with zoom capability
   - Shows document metadata
   - Allows downloading files
   - Handles different file types appropriately

3. A file browser component that:
   - Lists all documents for an entity
   - Shows thumbnails where appropriate
   - Allows sorting and filtering
   - Supports bulk operations (download, delete)

4. Storage utility functions for:
   - Uploading files
   - Retrieving files
   - Deleting files
   - Generating signed URLs
   - Error handling

Ensure all components have appropriate loading states and error handling.
```

### Prompt 9: Notification System & Real-time Updates

```
Implement a notification system and real-time updates for the STD Protocol. Create the following:

1. A notification data model in Supabase that stores:
   - User ID
   - Type of notification
   - Message content
   - Related entity (application, proposal, investment)
   - Read status
   - Created timestamp

2. A notification component that:
   - Shows unread notification count
   - Displays notification list
   - Allows marking as read
   - Shows notification details
   - Links to relevant pages

3. Real-time subscription handlers for:
   - Marketplace funding updates
   - Application status changes
   - New comments on threads
   - Proposal status updates

4. A mock email notification system that:
   - Logs emails in the notification system
   - Shows them in the dashboard
   - Allows viewing email content

5. Real-time presence indicators for:
   - Users viewing the same proposal
   - Active diligence team members
   - Online status for key stakeholders

Use Supabase real-time features for all real-time functionality.
```

### Prompt 10: Polishing & Final Integration

```
Complete the STD Protocol implementation by polishing the user experience and ensuring all components are integrated. Implement the following:

1. Comprehensive error handling:
   - Create error boundary components
   - Implement toast notifications for errors
   - Add retry mechanisms for failed operations
   - Create fallback UI components

2. Performance optimizations:
   - Implement code splitting for routes
   - Add lazy loading for heavy components
   - Optimize image loading with Next.js Image
   - Implement query caching for frequent operations

3. Final integration:
   - Ensure all modules work together seamlessly
   - Verify navigation flows between different sections
   - Check that real-time updates work across components
   - Validate that file uploads and storage work properly

4. Responsive design:
   - Ensure all components work on different screen sizes
   - Optimize layout for mobile devices
   - Test navigation on smaller screens

5. Final testing:
   - Verify all user flows work as expected
   - Test edge cases and error scenarios
   - Ensure all real-time features function properly
   - Validate form submissions and data persistence

Make any necessary adjustments to ensure the application meets all requirements specified in the specification document.
``` 