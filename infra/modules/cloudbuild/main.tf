# Requires a GitHub connection already linked to Cloud Build in GCP Console.
# Connect once at: Cloud Build → Triggers → Connect Repository.
resource "google_cloudbuild_trigger" "trigger" {
  project     = var.project_id
  name        = var.trigger_name
  description = "Build and deploy ${var.github_repo} on push to ${var.branch_pattern}"

  github {
    owner = var.github_owner
    name  = var.github_repo

    push {
      branch = var.branch_pattern
    }
  }

  # Points to the cloudbuild.yaml at the root of the GitHub repository
  filename = "cloudbuild.yaml"

  # These substitutions map to the variables declared in cloudbuild.yaml
  substitutions = {
    _REGION      = var.region
    _REPO_NAME   = var.repository_id
    _GKE_CLUSTER = var.cluster_name
    _GKE_REGION  = var.cluster_region
  }
}
