import request from "supertest";
import { createApp } from "../app";

describe("Projects API", () => {
  it("GET /projects returns success without query validation crash", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/projects");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
