# ProposalMate Deployment Guide

This document outlines the steps needed to deploy the ProposalMate application to a production environment.

## Prerequisites

- Node.js (v14+)
- MongoDB database
- Stripe account with API keys
- Email service (for sending verification emails)
- Domain name (optional but recommended)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=your_from_email
FROM_NAME=ProposalMate
```

## Deployment Steps

1. **Prepare the application**
   - Install dependencies: `npm install --production`
   - Build any frontend assets: `npm run build` (if applicable)

2. **Set up MongoDB**
   - Create a production MongoDB database
   - Secure it with proper authentication
   - Update the MONGODB_URI in your .env file

3. **Configure Stripe**
   - Set up your Stripe account for production
   - Create a product and price for the £7/month subscription
   - Update the Stripe environment variables
   - Configure the webhook endpoint in your Stripe dashboard

4. **Deploy to hosting service**
   - Options include:
     - Heroku
     - DigitalOcean
     - AWS
     - Google Cloud Platform
     - Microsoft Azure

5. **Set up domain and SSL**
   - Point your domain to the deployed application
   - Set up SSL certificates for secure HTTPS connections

## Deployment to Heroku

Heroku is a simple option for deploying Node.js applications:

1. Install the Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create proposalmate`
4. Add MongoDB addon: `heroku addons:create mongodb:sandbox`
5. Set environment variables: `heroku config:set KEY=VALUE`
6. Deploy the application: `git push heroku main`

## Deployment to DigitalOcean

DigitalOcean App Platform provides a simple way to deploy Node.js applications:

1. Create a DigitalOcean account
2. Create a new App from the App Platform dashboard
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy the application

## Post-Deployment Steps

1. **Test the deployed application**
   - Verify all functionality works in production
   - Test user registration and login
   - Test proposal creation and PDF generation
   - Test Stripe payment integration

2. **Set up monitoring**
   - Configure error logging
   - Set up performance monitoring
   - Configure alerts for critical issues

3. **Set up backups**
   - Configure regular database backups
   - Set up a disaster recovery plan

## Scaling Considerations

As the application grows, consider:

1. Implementing a caching layer (Redis)
2. Setting up a CDN for static assets
3. Implementing database indexing for performance
4. Setting up load balancing for high traffic
