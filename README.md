# Chef Hiring System Backend

A platform connecting restaurants with qualified chefs. Built with Node.js, Express, and deployed on AWS.

## Tech Stack

**Backend:** Node.js | Express | JWT Authentication
**Database:** SQL
**Deployment:** Docker | AWS
**Tools:** Git | REST APIs

## Features

- RESTful APIs for user management (chefs & restaurants)
- Role-based authentication & authorization
- Job posting and application management
- Secure password hashing with JWT tokens
- Docker containerization for easy deployment
- AWS EC2/RDS deployment

## Getting Started

### Prerequisites
- Node.js (v14+)
- Docker
- AWS Account (optional, for deployment)

### Installation

```bash
# Clone repository
git clone https://github.com/sai-vineeth-kankanala/chef-hiring-system-backend.git
cd chef-hiring-system-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run locally
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t chef-hiring-system .

# Run container
docker run -p 3000:3000 chef-hiring-system
```

## API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

**User Management**
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

**Jobs**
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job (restaurants only)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job (chefs only)

## Project Highlights

- Secure authentication with JWT
- Role-based access control (Chef vs Restaurant)
- Scalable API architecture
- Docker containerization for consistent deployments
- AWS cloud deployment

## Learning Outcomes

- Designed and implemented production-ready REST APIs
- Implemented secure authentication & authorization
- Containerized application using Docker
- Deployed to cloud infrastructure (AWS)
- Database schema design and optimization

## Future Enhancements

- Add rating & review system
- Implement messaging feature
- Add payment integration
- Mobile app development
