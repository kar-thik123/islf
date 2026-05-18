const http = require('http');

const data = JSON.stringify({
  identifier: 'islf_root',
  password: 'ISLF#Root@2026!X9m'
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Login Result:', json.user ? 'Success' : 'Failed');
      if (json.token) {
        testSource(json.token);
      } else {
        console.log('Error:', json);
      }
    } catch(e) { console.log("Failed to parse login:", body) }
  });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();

function testSource(token) {
  const req2 = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/source?companyCode=ISLF&branchCode=FF-MAA&departmentCode=EXP',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('Source Response Code:', res.statusCode);
      try {
        const json = JSON.parse(body);
        console.log('Source Data Length:', json.data ? json.data.length : 'N/A');
        if (json.error) console.log('Source Error:', json.error);
        if (json.message) console.log('Source Message:', json.message);
      } catch(e) {
        console.log('Source Raw Body:', body.substring(0, 500));
      }
    });
  });
  req2.end();
}
