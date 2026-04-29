output "trigger_id" {
  description = "Cloud Build trigger ID"
  value       = google_cloudbuild_trigger.trigger.trigger_id
}

output "trigger_name" {
  description = "Cloud Build trigger name"
  value       = google_cloudbuild_trigger.trigger.name
}
