output "network_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.subnet.name
}

output "pods_range_name" {
  description = "Secondary range name for GKE pods"
  value       = "${var.subnet_name}-pods"
}

output "services_range_name" {
  description = "Secondary range name for GKE services"
  value       = "${var.subnet_name}-services"
}
