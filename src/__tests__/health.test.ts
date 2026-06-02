import request from "supertest";
import { createApp } from "../app";

describe("Health API", () => {
  it("returns ok status", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });
});
