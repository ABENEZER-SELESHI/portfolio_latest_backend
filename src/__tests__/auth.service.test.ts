import bcrypt from "bcryptjs";
import { AuthService } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";
import { authRepository } from "../repositories/auth.repository";

jest.mock("../repositories/user.repository");
jest.mock("../repositories/auth.repository");

describe("AuthService", () => {
  const service = new AuthService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid credentials", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.getLoginAttempt as jest.Mock).mockResolvedValue(null);

    await expect(service.login("a@b.com", "wrongpass", "127.0.0.1")).rejects.toThrow(
      "Invalid credentials"
    );
  });

  it("returns tokens on valid login", async () => {
    const hash = await bcrypt.hash("ValidPass123", 4);
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "a@b.com",
      passwordHash: hash,
      role: "ADMIN",
    });
    (authRepository.getLoginAttempt as jest.Mock).mockResolvedValue(null);
    (authRepository.resetLoginAttempt as jest.Mock).mockResolvedValue({});
    (userRepository.updateLastLogin as jest.Mock).mockResolvedValue({});
    (authRepository.createRefreshToken as jest.Mock).mockResolvedValue({});

    const result = await service.login("a@b.com", "ValidPass123", "127.0.0.1");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe("a@b.com");
  });
});
