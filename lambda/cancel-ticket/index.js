const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({ region: "ap-southeast-1" });

exports.handler = async (event) => {
  try {
    const ticketId = event.pathParameters?.ticketId;
    const body = JSON.parse(event.body);
    const { userId } = body;

    if (!ticketId || !userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Thiếu thông tin bắt buộc" })
      };
    }

    // Lấy thông tin vé
    const ticketResult = await docClient.send(new GetCommand({
      TableName: process.env.TICKETS_TABLE,
      Key: { ticketId, userId }
    }));

    if (!ticketResult.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Vé không tồn tại!" })
      };
    }

    if (ticketResult.Item.status === "CANCELLED") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Vé đã bị hủy trước đó!" })
      };
    }

    // Cập nhật trạng thái vé thành CANCELLED
    await docClient.send(new UpdateCommand({
      TableName: process.env.TICKETS_TABLE,
      Key: { ticketId, userId },
      UpdateExpression: "SET #status = :status, cancelledAt = :cancelledAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": "CANCELLED",
        ":cancelledAt": new Date().toISOString()
      }
    }));

    // Hoàn lại số vé cho sự kiện
    await docClient.send(new UpdateCommand({
      TableName: process.env.EVENTS_TABLE,
      Key: { eventId: ticketResult.Item.eventId },
      UpdateExpression: "SET availableTickets = availableTickets + :inc",
      ExpressionAttributeValues: { ":inc": 1 }
    }));

    // Gửi email thông báo hủy vé
    try {
      await sesClient.send(new SendEmailCommand({
        Source: process.env.EMAIL_SENDER,
        Destination: { ToAddresses: [ticketResult.Item.userEmail] },
        Message: {
          Subject: { Data: `Xác nhận hủy vé - ${ticketResult.Item.eventName}` },
          Body: {
            Text: {
              Data: `Xin chào ${ticketResult.Item.userName}!\n\nVé của bạn đã được hủy thành công.\n\nSự kiện: ${ticketResult.Item.eventName}\nMã vé: ${ticketId}\n\nNếu có thắc mắc vui lòng liên hệ chúng tôi.`
            }
          }
        }
      }));
      console.log("Cancel email sent to:", ticketResult.Item.userEmail);
    } catch (emailError) {
      console.error("Email error:", emailError.message);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hủy vé thành công!" })
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