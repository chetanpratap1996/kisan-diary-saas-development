require('dotenv').config();
const { POST } = require('./.next/server/app/api/auth/phone-login/route.js');

async function testPost() {
  const req = {
    json: async () => ({
      phone: "8888888888",
      pin: "1234",
      name: "Test"
    })
  };
  try {
    const res = await POST(req);
    const data = await res.json();
    console.log(res.status, data);
  } catch(e) {
    console.error(e);
  }
}

testPost();
