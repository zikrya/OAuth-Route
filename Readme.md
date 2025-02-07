# OAuth 2.0 Authorization Server

A TypeScript-based OAuth 2.0 authorization server implementing the Authorization Code Flow with Refresh Token support. Built using **Express.js**, **jose** (for JWTs), and **Rate Limiting** for security.

## 🌟 Features

- OAuth 2.0 Authorization Code Flow
- Refresh Token Support
- JWT-based Access Tokens
- Rate Limiting on `/oauth/token`
- Fully Modularized Codebase
- Jest & Supertest for API Testing
- Logging for OAuth Events

## 🚀 Tech Stack

- **TypeScript**
- **Express.js**
- **JOSE** (for JWTs)
- **Rate Limit** (Express middleware)
- **Jest** & **Supertest** (for testing)

## 🛠️ Setup & Installation

1. Ensure you have Node.js LTS version installed:

```bash
nvm use --lts
```

3. Clone the repository:

```bash
git clone https://github.com/zikrya/OAuth-Route.git
cd oauth-server
```

4. Install dependencies:

```bash
npm install
```

5. Create a .env File:

```bash
PORT=8080
JWT_SECRET=your_secret_key
```

6. Start the development server:

```bash
npm run dev
```

## API Endpoints

1. Authorization Endpoint (GET /api/oauth/authorize)

```bash
curl -i "http://localhost:8080/api/oauth/authorize?response_type=code&client_id=upfirst&redirect_uri=http://localhost:8081/process&state=SOME_STATE"
```

Response:

```bash
HTTP/1.1 302 Found
Location: http://localhost:8081/process?code=SOME_AUTH_CODE&state=SOME_STATE
```

2. Token Exchange Endpoint (POST /api/oauth/token)

```bash
curl -X POST http://localhost:8080/api/oauth/token \
     -H "Content-Type: application/json" \
     -d '{
       "grant_type": "authorization_code",
       "code": "SOME_AUTH_CODE",
       "client_id": "upfirst",
       "redirect_uri": "http://localhost:8081/process"
     }'
```

Response

```bash
{
  "access_token": "SOME_JWT_ACCESS_TOKEN",
  "refresh_token": "SOME_REFRESH_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600
}
```

3. Refresh Token (POST /api/oauth/token)

```bash
curl -X POST http://localhost:8080/api/oauth/token \
     -H "Content-Type: application/json" \
     -d '{
       "grant_type": "refresh_token",
       "refresh_token": "SOME_REFRESH_TOKEN",
       "client_id": "upfirst"
     }'
```

Response:

```bash
{
  "access_token": "NEW_JWT_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## Testing

1. Run Tests

```bash
npm test
```

2. Check Logs
   Logs are stored in logs/oauth.log. To view logs:

```bash
cat logs/oauth.log
```

## Security & Rate Limiting

To prevent brute-force attacks, rate limiting is enforced on /oauth/token. If too many requests are sent in a short period, a 429 Too Many Requests error will be returned.

## Notes

- If you encounter errors, ensure you are using the correct Node.js version: nvm use --lts (nvm 22)
- For dev, ensure JWT_SECRET is set in .env
