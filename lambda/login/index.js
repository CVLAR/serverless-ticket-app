const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Thiếu email hoặc mật khẩu" })
      };
    }

    // Hash password để so sánh
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Tìm user theo email
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.USERS_TABLE,
      FilterExpression: "email = :email AND password = :password",
      ExpressionAttributeValues: {
        ":email": email,
        ":password": hashedPassword
      }
    }));

    if (result.Items.length === 0) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Email hoặc mật khẩu không đúng!" })
      };
    }

    const user = result.Items[0];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Đăng nhập thành công!",
        userId: user.userId,
        fullName: user.fullName,
        email: user.email
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
