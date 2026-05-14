# Lambda: Đăng ký
resource "aws_lambda_function" "register" {
  filename         = "../lambda/register/register.zip"
  function_name    = "${var.project_name}-register"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("../lambda/register/register.zip")

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }

  tags = {
    Project = var.project_name
  }
}

# Lambda: Đăng nhập
resource "aws_lambda_function" "login" {
  filename         = "../lambda/login/login.zip"
  function_name    = "${var.project_name}-login"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("../lambda/login/login.zip")

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }

  tags = {
    Project = var.project_name
  }
}

# Lambda: Xem sự kiện
resource "aws_lambda_function" "get_events" {
  filename         = "../lambda/get-events/get-events.zip"
  function_name    = "${var.project_name}-get-events"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("../lambda/get-events/get-events.zip")

  environment {
    variables = {
      EVENTS_TABLE = aws_dynamodb_table.events.name
    }
  }

  tags = {
    Project = var.project_name
  }
}

# Lambda: Đặt vé
resource "aws_lambda_function" "book_ticket" {
  filename         = "../lambda/book-ticket/book-ticket.zip"
  function_name    = "${var.project_name}-book-ticket"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("../lambda/book-ticket/book-ticket.zip")

  environment {
    variables = {
      TICKETS_TABLE = aws_dynamodb_table.tickets.name
      EVENTS_TABLE  = aws_dynamodb_table.events.name
      EMAIL_SENDER  = var.email_sender
    }
  }

  tags = {
    Project = var.project_name
  }
}

# Lambda: Hủy vé
resource "aws_lambda_function" "cancel_ticket" {
  filename         = "../lambda/cancel-ticket/cancel-ticket.zip"
  function_name    = "${var.project_name}-cancel-ticket"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("../lambda/cancel-ticket/cancel-ticket.zip")

  environment {
    variables = {
      TICKETS_TABLE = aws_dynamodb_table.tickets.name
      EMAIL_SENDER  = var.email_sender
    }
  }

  tags = {
    Project = var.project_name
  }
} 
