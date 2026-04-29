output "instance_ip" {
  description = "Public IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.instance.public_ip_address
}

output "connection_name" {
  description = "Cloud SQL connection name (project:region:instance)"
  value       = google_sql_database_instance.instance.connection_name
}

output "database_url" {
  description = "Full PostgreSQL connection string"
  value       = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.instance.public_ip_address}:5432/${var.db_name}"
  sensitive   = true
}
