# ProposalMate Deployment Instructions

This file contains instructions for deploying the ProposalMate application using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Stripe account with API keys
- SMTP server for email notifications

## Deployment Steps

1. Clone the repository to your server
2. Navigate to the project directory
3. Edit the `.env` file with your production credentials
4. Run the following command to start the application:

```bash
docker-compose up -d
```

5. The application will be available at http://your-server-ip:5000

## Environment Variables

Make sure to set the following environment variables in your production environment:

- `NODE_ENV`: Set to "production"
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `STRIPE_PRICE_ID`: The price ID for your £7/month subscription
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`: SMTP server details for sending emails

## Monitoring

You can monitor the application logs with:

```bash
docker-compose logs -f
```

## Scaling

To scale the application, you can use Docker Swarm or Kubernetes for orchestration.

## Backup

Regular database backups are recommended. You can set up a cron job to backup the MongoDB data volume.
