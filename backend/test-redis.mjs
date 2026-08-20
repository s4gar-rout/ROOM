import redis from './src/services/redis.service.js';

async function testOtp() {
  const email = "test@example.com";
  const otp = "123456";
  await redis.set(`reg-otp:${email}`, otp, { ex: 15 * 60 });
  const storedOtp = await redis.get(`reg-otp:${email}`);
  console.log("Stored OTP:", storedOtp, typeof storedOtp);
  console.log("Matches?", storedOtp === otp);
  console.log("Trim matches?", String(storedOtp) === otp.trim());
}

testOtp();
