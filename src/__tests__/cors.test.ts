import request from "supertest";
import { createApp } from "../app";
import { corsAllowedOrigins } from "../config/env";

describe("CORS", () => {
  const app = createApp();
  const allowedOrigin = corsAllowedOrigins[0];

  it("allows configured frontend origin", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", allowedOrigin);

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(allowedOrigin);
  });

  it("rejects unknown origins", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://evil.example.com");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("answers preflight for allowed origin", async () => {
    const res = await request(app)
      .options("/api/v1/health")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "authorization,content-type");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });
});
