async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/reset-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "8123456789", otp: "123456", newPin: "9999" })
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch(e) {
    console.error(e);
  }
}
test();
