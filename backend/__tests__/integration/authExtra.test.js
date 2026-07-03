process.env.ACCESS_TOKEN_SECRET = "test_access_secret_1234567890";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret_1234567890";
process.env.ACCESS_TOKEN_EXPIRY = "15m";
process.env.REFRESH_TOKEN_EXPIRY = "7d";
process.env.MONGO_URI = "placeholder";
process.env.GOOGLE_CLIENT_ID = "dummy";
process.env.GOOGLE_CLIENT_SECRET = "dummy";
process.env.GOOGLE_CALLBACK_URL = "http://localhost/callback";
process.env.RAZORPAY_KEY_ID = "dummy";
process.env.RAZORPAY_KEY_SECRET = "dummy";
process.env.RAZORPAY_WEBHOOK_SECRET = "dummy";
process.env.CLOUDINARY_CLOUD_NAME = "dummy";
process.env.CLOUDINARY_API_KEY = "dummy";
process.env.CLOUDINARY_API_SECRET = "dummy";
process.env.CLIENT_URL = "http://localhost:3000";

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI);
  app = (await import("../../src/app.js")).default;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) await collections[key].deleteMany({});
});

const validUser = {
  name: "Adarsh Singh",
  email: "adarsh@example.com",
  password: "Test@1234",
};

describe("Authentication OTP & Password Reset Flows", () => {
  it("verifies registration, login attempt before/after OTP verify, forgot password, reset password, and login with new password", async () => {
    // 1. Register user
    const regRes = await request(app)
      .post("/api/v1/auth/register")
      .send(validUser);
    expect(regRes.status).toBe(201);

    // 2. Login before verification should fail
    const loginFail = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    expect(loginFail.status).toBe(403);
    expect(loginFail.body.message).toMatch(/verify/i);

    // Retrieve the user from DB to get the verification OTP
    const userDoc = await mongoose.model("User").findOne({ email: validUser.email }).select("+verificationOtp +verificationOtpExpires");
    expect(userDoc.verificationOtp).toBeDefined();

    // 3. Verify OTP
    const verifyRes = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email: validUser.email, otp: userDoc.verificationOtp });
    expect(verifyRes.status).toBe(200);

    // 4. Login after verification should succeed
    const loginSuccess = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    expect(loginSuccess.status).toBe(200);
    expect(loginSuccess.body.data.accessToken).toBeDefined();

    // 5. Forgot Password
    const forgotRes = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: validUser.email });
    expect(forgotRes.status).toBe(200);

    // Retrieve the reset password OTP
    const userDocForReset = await mongoose.model("User").findOne({ email: validUser.email }).select("+resetPasswordOtp +resetPasswordOtpExpires");
    expect(userDocForReset.resetPasswordOtp).toBeDefined();

    // 6. Reset password
    const newPassword = "NewPassword@999";
    const resetRes = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        email: validUser.email,
        otp: userDocForReset.resetPasswordOtp,
        newPassword: newPassword,
      });
    expect(resetRes.status).toBe(200);

    // 7. Login with old password should fail
    const oldLoginFail = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    expect(oldLoginFail.status).toBe(401);

    // 8. Login with new password should succeed
    const newLoginSuccess = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: newPassword });
    expect(newLoginSuccess.status).toBe(200);
  });
});
