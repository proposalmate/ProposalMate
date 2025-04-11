# ProposalMate Backend Requirements

## 1. User Authentication System
- User registration with email verification
- Login/logout functionality
- Password reset capability
- User profile management
- Session management and security

## 2. Proposal Generation Tool
- Form-based interface for entering proposal details
- Template system for different proposal types
- PDF and DOC export functionality
- Preview capability before download
- Save draft proposals

## 3. Stripe Payment Integration
- 7-day free trial implementation
- £7/month subscription billing
- Payment method management
- Invoice generation
- Subscription management (upgrade, downgrade, cancel)
- Webhook handling for payment events

## 4. User Dashboard
- Overview of created proposals
- Ability to view, edit, and download past proposals
- Subscription status and management
- User profile settings
- Usage statistics

## Technical Requirements
- Backend framework: Node.js with Express
- Database: MongoDB for flexible document storage
- Authentication: JWT (JSON Web Tokens)
- PDF Generation: PDFKit or similar library
- DOC Generation: docx.js or similar library
- Payment Processing: Stripe API
- Hosting: Cloud platform with SSL support
- Email Service: SendGrid or similar for transactional emails
