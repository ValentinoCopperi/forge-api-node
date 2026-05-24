import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { prisma_test } from "../../shared/libs/prisma/prisma-test.connection";

const testRepository = new AuthRepository(prisma_test);

const storageService = {};

const service = new AuthService(testRepository as any, storageService as any);

beforeEach(async () => {
  await prisma_test.userRole.deleteMany();
  await prisma_test.user.deleteMany();
});

describe("Auth Sevice - Register new user", () => {
  it("it should create and return a new user", async () => {
    const data = {
      name: "Valen",
      email: "valen@test.com",
      password: "123456",
    };

    const result = await service.register(data);

    expect(result).toEqual(
      expect.objectContaining({
        name: "Valen",
        email: "valen@test.com",
      }),
    );
  });

  it("case:email already used , it throw a 409", async () => {
    const data = {
      name: "Valen",
      email: "valen@test.com",
      password: "123456",
    };

    const result = await service.register(data);

    expect(result).toEqual(
      expect.objectContaining({
        name: "Valen",
        email: "valen@test.com",
      }),
    );

    await expect(service.register(data)).rejects.toMatchObject({
      message: "valen@test.com is already used",
      statusCode: 409,
    });
  });
});
