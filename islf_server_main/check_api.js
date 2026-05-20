async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/booking/BKG000063', {
      headers: {
        'x-user-data': JSON.stringify({ username: 'admin', role: 'admin', companyCode: 'ISLF' })
      }
    });
    const data = await res.json();
    console.log("=== API RESPONSE ===");
    console.log(data.service_type);
    console.log(Object.keys(data));
  } catch(e) {
    console.error(e.message);
  }
}
run();
