require('dotenv').config();

const express = require('express');
const cors = require('cors');
const s3Routes = require('./s3.routes');

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());
app.use('/api', s3Routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
