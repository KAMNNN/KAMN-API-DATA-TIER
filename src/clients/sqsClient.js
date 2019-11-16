const AWS = require('aws-sdk');
const sqsClient = new AWS.SQS();

exports.createQueue = async (params) => {
	console.log('Creating SQS queue..');
	return await sqsClient.createQueue(params).promise();
};

exports.receiveMessage = async (params) => {
	console.log('Receiving Message from SQS..');
	return await sqsClient.receiveMessage(params).promise();
};

exports.deleteMessage = async (params) => {
	return await sqsClient.deleteMessage(params).promise();
};

