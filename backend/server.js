const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/data', (req, res) => {
  const filePath = path.join(`${__dirname}/api/data`, 'work-item.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err){
      console.error('Error reading file: ', err);
      res.status(500).json({ error: 'Internal Server Error'});
      return;
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
    console.log(jsonData);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});