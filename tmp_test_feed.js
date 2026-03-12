import http from 'http';

http.get('http://localhost:5000/api/v1/posts', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
