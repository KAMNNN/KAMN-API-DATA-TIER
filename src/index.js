'use strict';

const ddbClient = require('./clients/ddbClient');
const sqsClient = require('./clients/sqsClient');
const sessionTable = process.env.SESSION_TABLE;
const questionTable = process.env.QUESTION_TABLE;

// https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
const createResponseObject = (response) => {
  return {
		statusCode: (response.error) ? 500 : (response.invalid) ? 400 : 200,
		body: JSON.stringify((response.error || response.invalid || response.success).body),
	  headers: {
			'Access-Control-Allow-Origin': '*', // Alter to restrict origin for CORS purposes
		}
  }
};

// API call to create a session
exports.createSession = async (event) => {
	const session_id = "4389";
	const guest_count = 0;
	let ddbItem = {
		TableName: sessionTable,
		Item: {
			session_id: session_id,
			guest_count: guest_count
		}
	};
	const queueParams = {
		QueueName: `${session_id}.fifo`,
		Attributes: {
			FifoQueue: 'true',
			ContentBasedDeduplication: 'true'
		}
	};
	let response;
	try {
		const sqsResponse = await sqsClient.createQueue(queueParams);
		ddbItem.Item['queue_url'] = sqsResponse.QueueUrl;
	  const ddbResponse = await ddbClient.put(ddbItem);
		const message = `Successfully created session with session ID = ${session_id}`
		console.log(message);
		response = { success: { body: message } };
  } catch (err) {
    console.log(`Failed to createSession for session id = ${session_id}, with error: ${err}`);	  
		response = { error: { body: err } };
	}
	return createResponseObject(response);
};

// API call to join a session
exports.joinSession = async (event) => {
	const session_id = "4389"
	const params = {
	  TableName: sessionTable,
		Key: {
			session_id: session_id,
		},
		UpdateExpression: "set guest_count = guest_count + :i",
		ExpressionAttributeValues: {
			":i": 1
		}
	};
	let response;
	try {
		const ddbResponse = await ddbClient.update(params);
		const message = `Successfully added guest to session with session ID = ${session_id}`;
		console.log(message);
		response = { success : { body: message } };
	} catch (err) {
		console.log(`Failed to add guest to session ID = ${session_id}`)
		response = { error: { body: err } };
	}
	return createResponseObject(response);
};  

// API call to get a question
exports.getQuestion = async (body) => {
	console.log('Attempting to get a question from sqs..');
	const session_id = "4389";
	const question_id = "223";
	const ddbParams = {
		TableName: sessionTable,
		Key: {
			session_id: session_id
		}
	};
	let ddbQuestionParams = {
		TableName: questionTable,
	  Item: {
			question_id: question_id,
			session: session_id,
			correct_answers: 0,
			incorrect_answers: 0
		}
	};
	let sqsParams = {
		MaxNumberOfMessages: 1,
		VisibilityTimeout: 0,
		WaitTimeSeconds: 0
	};
	let response;
	try {
		const ddbResponse = await ddbClient.get(ddbParams);
		sqsParams['QueueUrl'] = ddbResponse.Item.queue_url;
		const data = await sqsClient.receiveMessage(sqsParams);
		console.log(data);
		if(data.Messages === undefined || data.Messages.length === 0) {
      console.log('No Messages retrieved');
			response = { success : { body : 'No questions in queue' } };
		} else {
		  console.log(`Successfully retrieved a message from SQS`);
			console.log(data.Messages[0].Body);
			const questionData = JSON.parse(JSON.parse(data.Messages[0].Body));
			questionData['question_id'] = question_id;
			Object.assign(ddbQuestionParams.Item, questionData);
			console.log(ddbQuestionParams);
			const ddbQuestionResponse = await ddbClient.put(ddbQuestionParams);
			response = { success : { body : JSON.stringify(questionData) } };
		}
	} catch (err) {
		console.log(`Failed to retrieve a message from SQS with ERROR: ${err}`);
		response = { error: { body: err } };
	}
	return createResponseObject(response);
};

const validateSession = async (session_id) => {

};
