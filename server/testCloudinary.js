const https = require('https');
const url = "https://res.cloudinary.com/dss7xbgqt/raw/upload/v1775247380/student_buddy/notes/note_1775247371990_COHORT_22_FEB_2026_OOP_lyst1772736042877.pdf";

https.get(url, (res) => {
  console.log('Status Base:', res.statusCode);
  res.on('data', d => console.log('Base:', d.toString()));
});

const urlAuth = "https://432734468257748:d6K4rPqGiGD5supoNPIUhR7QJg8@res.cloudinary.com/dss7xbgqt/raw/upload/v1775247380/student_buddy/notes/note_1775247371990_COHORT_22_FEB_2026_OOP_lyst1772736042877.pdf";

https.get(urlAuth, (res) => {
  console.log('Status Auth:', res.statusCode);
  res.on('data', d => console.log('Auth:', d.toString()));
});

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dss7xbgqt',
  api_key: '432734468257748',
  api_secret: 'd6K4rPqGiGD5supoNPIUhR7QJg8',
});

const signedUrl = cloudinary.url('student_buddy/notes/note_1775247371990_COHORT_22_FEB_2026_OOP_lyst1772736042877.pdf', {
  resource_type: 'raw',
  type: 'upload',
  sign_url: true,
  secure: true,
});

console.log('Signed:', signedUrl);
https.get(signedUrl, (res) => {
  console.log('Status Signed:', res.statusCode);
  res.on('data', d => console.log('Signed Data:', d.toString()));
});
