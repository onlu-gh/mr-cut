# pgAdmin Docker Setup

This project provides a Dockerized setup for pgAdmin 4, a popular open-source administration and management tool for PostgreSQL.

## Prerequisites

- Docker Desktop installed and running on your system
- Basic knowledge of Docker commands
- PostgreSQL database to connect to (if you want to use pgAdmin to manage a database)

## Setup Instructions

1. **Ensure Docker Desktop is Running**
   - Open Docker Desktop application
   - Wait for it to fully start (you should see the whale icon in your system tray)
   - Verify Docker is running by opening a terminal and typing:
     ```bash
     docker --version
     ```

2. **Build the Docker Image**
   ```bash
   # Navigate to the pgadmin directory
   cd pgadmin
   
   # Build the Docker image
   docker build -t pgadmin .
   ```

3. **Run the Container**
   ```bash
   docker run -p 80:80 --name pgadmin-container pgadmin
   ```

4. **Access pgAdmin**
   - Open your web browser and navigate to `http://localhost:80`
   - Login credentials:
     - Email: admin@admin.com
     - Password: admin

## Configuration

The Dockerfile is pre-configured with the following environment variables:
- `PGADMIN_DEFAULT_EMAIL`: admin@admin.com
- `PGADMIN_DEFAULT_PASSWORD`: admin

## Connecting to a PostgreSQL Database

1. After logging in, click on "Add New Server"
2. In the "General" tab:
   - Name: Choose a name for your server connection
3. In the "Connection" tab:
   - Host name/address: Your PostgreSQL server address
   - Port: 5432 (default PostgreSQL port)
   - Maintenance database: postgres
   - Username: Your PostgreSQL username
   - Password: Your PostgreSQL password

## Security Notes

- The default credentials in this setup are for demonstration purposes only
- For production use, you should:
  - Change the default email and password
  - Use environment variables or secrets management
  - Consider implementing additional security measures

## Troubleshooting

If you encounter any issues:

1. **Docker Connection Issues**
   - Ensure Docker Desktop is running
   - Restart Docker Desktop if needed
   - Check Docker service status in Windows Services

2. **Build Issues**
   - Verify you're in the correct directory (pgadmin folder)
   - Check if Dockerfile exists in the current directory
   - Ensure Docker Desktop has enough resources allocated

3. **Container Issues**
   - Check if the container is running: `docker ps`
   - View container logs: `docker logs pgadmin-container`
   - Ensure port 80 is not in use by another service

## Stopping the Container

To stop and remove the container:
```bash
docker stop pgadmin-container
docker rm pgadmin-container
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.jsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   m r - c u t 
 
 