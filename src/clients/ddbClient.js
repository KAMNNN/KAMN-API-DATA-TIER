const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

exports.put = async (params) => {
  return await dynamo.put(params).promise();	
};

