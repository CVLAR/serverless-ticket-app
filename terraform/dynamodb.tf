 
# Bảng Users - lưu thông tin người dùng
resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Project = var.project_name
  }
}

# Bảng Events - lưu thông tin sự kiện
resource "aws_dynamodb_table" "events" {
  name           = "${var.project_name}-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "eventId"

  attribute {
    name = "eventId"
    type = "S"
  }

  tags = {
    Project = var.project_name
  }
}

# Bảng Tickets - lưu thông tin đặt vé
resource "aws_dynamodb_table" "tickets" {
  name           = "${var.project_name}-tickets"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "ticketId"
  range_key      = "userId"

  attribute {
    name = "ticketId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Project = var.project_name
  }
}