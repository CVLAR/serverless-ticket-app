const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Thiếu userId" })
      };
    }

    const result = await docClient.send(new ScanCommand({
      TableName: process.env.TICKETS_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId }
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Lấy danh sách vé thành công!",
        tickets: result.Items || []
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Lỗi server", error: error.message })
    };
  }
}; 
