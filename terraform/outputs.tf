 
output "api_gateway_url" {
  value       = aws_apigatewayv2_stage.main.invoke_url
  description = "URL của API Gateway"
}

output "frontend_url" {
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
  description = "URL của Frontend"
}

output "users_table" {
  value       = aws_dynamodb_table.users.name
  description = "Tên bảng Users"
}

output "events_table" {
  value       = aws_dynamodb_table.events.name
  description = "Tên bảng Events"
}

output "tickets_table" {
  value       = aws_dynamodb_table.tickets.name
  description = "Tên bảng Tickets"
}