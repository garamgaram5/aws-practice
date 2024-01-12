const express = require('express')
const app = express()
const port = 80;
require('dotenv').config()
const { Sequelize } = require('sequelize');
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql'
  }
);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log('DB 연결 성공!');
  } catch (err) {
    console.log('DB 연결 X', err);
  }
  console.log(`RDS: Example app listening on port ${port}`)
})

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: "ap-northeast-1"
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  }),
})

app.post('/upload', upload.array('photos'), (req, res) => {
  res.send(req.files);
})

app.listen(port, () => {
  console.log(`S3: Example app listening on port ${port}`)
})
