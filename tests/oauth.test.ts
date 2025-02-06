import request from "supertest";
import app from '../src/index'

describe("OAuth 2.0 Authorization and Token Exchange", () => {
  let authCode: string;
  let refreshToken: string;

  it("should return an authorization code on valid request", async () => {
    const res = await request(app)
      .get("/api/oauth/authorize")
      .query({
        response_type: "code",
        client_id: "upfirst",
        redirect_uri: "http://localhost:8081/process",
        state: "test123",
      });

    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/code=[a-f0-9]+/);

    const match = res.headers.location.match(/code=([a-f0-9]+)/);
    if (match) authCode = match[1];
  });

  it("should reject requests with invalid client_id", async () => {
    const res = await request(app)
      .get("/api/oauth/authorize")
      .query({
        response_type: "code",
        client_id: "invalid_client",
        redirect_uri: "http://localhost:8081/process",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_client");
  });

  it("should exchange authorization code for access token", async () => {
    const res = await request(app)
      .post("/api/oauth/token")
      .send({
        grant_type: "authorization_code",
        code: authCode,
        client_id: "upfirst",
        redirect_uri: "http://localhost:8081/process",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("refresh_token");

    refreshToken = res.body.refresh_token;
  });

  it("should reject an invalid authorization code", async () => {
    const res = await request(app)
      .post("/api/oauth/token")
      .send({
        grant_type: "authorization_code",
        code: "invalid_code",
        client_id: "upfirst",
        redirect_uri: "http://localhost:8081/process",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_grant");
  });

  it("should return a new access token using a refresh token", async () => {
    const res = await request(app)
      .post("/api/oauth/token")
      .send({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: "upfirst",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
  });

  it("should reject an invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/oauth/token")
      .send({
        grant_type: "refresh_token",
        refresh_token: "invalid_refresh_token",
        client_id: "upfirst",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_grant");
  });

  it("should reject unsupported grant types", async () => {
    const res = await request(app)
      .post("/api/oauth/token")
      .send({
        grant_type: "invalid_grant_type",
        client_id: "upfirst",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("unsupported_grant_type");
  });

  it("should enforce rate limiting on /oauth/token", async () => {
    let lastResponse: request.Response | null = null;
    let rateLimitHit = false;

    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post("/api/oauth/token")
        .send({
          grant_type: "authorization_code",
          code: authCode,
          client_id: "upfirst",
          redirect_uri: "http://localhost:8081/process",
        });

      lastResponse = res;

      if (res.status === 429) {
        rateLimitHit = true;
        break;
      }
    }

    expect(rateLimitHit).toBe(true);
    expect(lastResponse).not.toBeNull();
    expect(lastResponse!.status).toBe(429);
    expect(lastResponse!.body.error).toBe("too_many_requests");
  });

});
