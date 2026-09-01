# IntelliPrep Deployment Guide

This guide covers various ways to deploy IntelliPrep.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Variables](#environment-variables)

## Local Development

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **In another terminal, pull the model:**
   ```bash
   ollama pull llama3.1
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Development Mode with Auto-Reload

```bash
npm run dev
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
docker-compose up
```

This will:
- Start the IntelliPrep application
- Start Ollama service
- Create necessary volumes for persistence
- Set up networking between services

### Build Custom Docker Image

```bash
docker build -t intelliprep:latest .
docker run -p 3000:3000 intelliprep:latest
```

### With Custom Environment

```bash
docker run -p 3000:3000 \
  -e OLLAMA_BASE_URL=http://ollama:11434/v1 \
  -e OLLAMA_MODEL=llama3.1 \
  intelliprep:latest
```

## Production Deployment

### Recommended Setup

1. **Use a Process Manager:**
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "intelliprep"
   pm2 save
   pm2 startup
   ```

2. **Set Environment to Production:**
   ```bash
   export NODE_ENV=production
   ```

3. **Use a Reverse Proxy (Nginx):**
   ```nginx
   upstream intelliprep {
     server localhost:3000;
   }

   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://intelliprep;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

4. **SSL/HTTPS with Let's Encrypt:**
   ```bash
   certbot certonly --standalone -d your-domain.com
   ```

### Cloud Deployment Options

#### Heroku
```bash
git push heroku main
heroku config:set OLLAMA_BASE_URL=<your-ollama-url>
```

#### AWS (EC2)
1. Launch Ubuntu instance
2. Install Node.js and Ollama
3. Clone repository
4. Run with PM2
5. Setup security groups

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Deploy

#### Railway/Render
Connect your GitHub repo and set environment variables

## Environment Variables

### Required
- `OLLAMA_BASE_URL` - URL to Ollama API (default: http://localhost:11434/v1)
- `OLLAMA_MODEL` - Model to use (default: llama3.1)

### Optional
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: localhost)
- `NODE_ENV` - Environment mode (development/production)
- `OPENAI_API_KEY` - For OpenAI alternative (instead of Ollama)

## Performance Optimization

### For Production:
1. Enable gzip compression
2. Use CDN for static files
3. Implement rate limiting
4. Add caching headers
5. Monitor Ollama model performance
6. Use load balancing if needed

### Monitoring:
- Set up error logging (e.g., Sentry)
- Monitor API response times
- Track Ollama availability
- Monitor disk space for uploads

## Troubleshooting

### Ollama Connection Issues
```bash
curl http://localhost:11434/api/tags
```

### Model Not Available
```bash
ollama list
ollama pull llama3.1
```

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

## Security Considerations

1. Use environment variables for sensitive data
2. Never commit .env files
3. Use HTTPS in production
4. Implement authentication
5. Rate limit API endpoints
6. Validate user uploads
7. Regular security updates

## Backup & Recovery

### Backup Data
```bash
tar -czf intelliprep-backup.tar.gz data/ uploads/
```

### Restore Data
```bash
tar -xzf intelliprep-backup.tar.gz
```

## Support

For deployment issues, check the [README](README.md) or open an issue on GitHub.
