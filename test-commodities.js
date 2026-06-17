const API_KEY = "579b464db66ec23bdd000001448d2674114e44cb7427c75d1793650a";
const URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=2000`;

async function testApi() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    const commodities = new Set();
    if (data.records) {
      data.records.forEach(r => commodities.add(r.commodity));
    }
    console.log("Unique commodities found:", Array.from(commodities).join(", "));
  } catch (err) {
    console.error("API Test Error:", err);
  }
}

testApi();
