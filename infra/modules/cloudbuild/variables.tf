variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "trigger_name" {
  description = "Name for the Cloud Build trigger"
  type        = string
  default     = "deploy-on-push"
}

variable "github_owner" {
  description = "GitHub username or organization"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "branch_pattern" {
  description = "Branch regex pattern that fires the trigger"
  type        = string
  default     = "^master$"
}

variable "region" {
  description = "GCP region — passed as _REGION substitution to cloudbuild.yaml"
  type        = string
}

variable "repository_id" {
  description = "Artifact Registry repository ID — passed as _REPO_NAME substitution"
  type        = string
}

variable "cluster_name" {
  description = "GKE cluster name — passed as _GKE_CLUSTER substitution"
  type        = string
}

variable "cluster_region" {
  description = "GKE cluster region — passed as _GKE_REGION substitution"
  type        = string
}
