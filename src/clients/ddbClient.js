const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.get = async (params) => {
	return await dynamo.get(params).promise();
};

exports.put = async (params) => {
  return await dynamo.put(params).promise();	
};

exports.update = async (params) => {
	console.log('Updating item in Dynamo Database..');
	return await dynamo.update(params).promise();
};
