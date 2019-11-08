'use strict';

const ddbClient = require('./clients/ddbClient');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const sessionTable = process.env.SESSION_TABLE;

// https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
const createResponseObject = (response) => {
  return {
		statusCode: (response.error) ? 500 : (response.invalid) ? 400 : 200,
		body: JSON.stringify(response),//(response.error || response.invalid || response.success).body),
	  headers: {
			'Access-Control-Allow-Origin': '*', // Alter to restrict origin for CORS purposes
		}
  }
};

// API call to create a session
exports.createSession = async (event) => {
	const session_id = "4389";
	const guest_count = 0;
	const ddbItem = {
		TableName: sessionTable,
		Item: {
			session_id: session_id,
			guest_count: guest_count
		}
	};
	let response;
	try {
	  const ddbResponse = await ddbClient.put(ddbItem);
		const messege = `Successfully created session with session ID = ${session_id}`
		console.log(messege);
		response = { success: { body: messege } };
  } catch (err) {
    console.log(`Failed to createSession for session id = ${session_id}, with error: ${err}`);	  
		response = { error: { body: JSON.stringify(err) } };
	}
	return createResponseObject(response);
};

// API call to join a session
exports.joinSession = async (event) => {
  return createResponseObject({ success: { body: 'JOINED SESSION' } });  
};  

