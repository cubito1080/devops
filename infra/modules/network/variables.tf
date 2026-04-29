variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "network_name" {
  description = "Name for the VPC network"
  type        = string
}

variable "subnet_name" {
  description = "Name for the primary subnet"
  type        = string
}

variable "subnet_cidr" {
  description = "Primary CIDR range for the subnet"
  type        = string
}

variable "pods_cidr" {
  description = "Secondary CIDR range for GKE pods"
  type        = string
}

variable "services_cidr" {
  description = "Secondary CIDR range for GKE services"
  type        = string
}
