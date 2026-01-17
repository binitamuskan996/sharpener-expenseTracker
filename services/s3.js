require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'eu-north-1' 
});

const uploadToS3 = async (data, filename) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: data
  };

  await s3.upload(params).promise();
  return filename; 
};

const getPresignedUrl = (filename) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Expires: 60 * 5 
  };
  return s3.getSignedUrl('getObject', params);
};

module.exports = { uploadToS3, getPresignedUrl };
