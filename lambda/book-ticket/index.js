const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({ region: "ap-southeast-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, eventId, userEmail, userName } = body;

    if (!userId || !eventId || !userEmail || !userName) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Thiếu thông tin bắt buộc" })
      };
    }

    const eventResult = await docClient.send(new GetCommand({
      TableName: process.env.EVENTS_TABLE,
      Key: { eventId }
    }));

    if (!eventResult.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Sự kiện không tồn tại!" })
      };
    }

    if (eventResult.Item.availableTickets <= 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Sự kiện đã hết vé!" })
      };
    }

    const ticketId = crypto.randomUUID();

    await docClient.send(new PutCommand({
      TableName: process.env.TICKETS_TABLE,
      Item: {
        ticketId,
        userId,
        eventId,
        eventName: eventResult.Item.name,
        userEmail,
        userName,
        status: "CONFIRMED",
        bookedAt: new Date().toISOString()
      }
    }));

    await docClient.send(new UpdateCommand({
      TableName: process.env.EVENTS_TABLE,
      Key: { eventId },
      UpdateExpression: "SET availableTickets = availableTickets - :dec",
      ConditionExpression: "availableTickets > :zero",
      ExpressionAttributeValues: { ":dec": 1, ":zero": 0 }
    }));

    // Gửi email riêng, không fail nếu lỗi
    try {
      await sesClient.send(new SendEmailCommand({
        Source: process.env.EMAIL_SENDER,
        Destination: { ToAddresses: [userEmail] },
        Message: {
          Subject: { Data: `Xác nhận đặt vé - ${eventResult.Item.name}` },
          Body: {
            Text: {
              Data: `Xin chào ${userName}!\n\nBạn đã đặt vé thành công!\n\nSự kiện: ${eventResult.Item.name}\nMã vé: ${ticketId}\nThời gian: ${eventResult.Item.date}\nĐịa điểm: ${eventResult.Item.location}\n\nCảm ơn bạn đã sử dụng dịch vụ!`
            }
          }
        }
      }));
      console.log("Email sent to:", userEmail);
    } catch (emailError) {
      console.error("Email error:", emailError.message);
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Đặt vé thành công! Email xác nhận đã được gửi.",
        ticketId
      })
    };

  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Lỗi server", error: error.message })
    };
  }
};