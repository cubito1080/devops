locals {
  env          = "dev"
  repo_id      = "geography-api"
  cluster_name = "geography-cluster-${local.env}"
}

# ─── Enable required GCP APIs ────────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ─── Network ─────────────────────────────────────────────────────────────────
module "network" {
  source = "../../modules/network"

  project_id    = var.project_id
  region        = var.region
  network_name  = "geography-vpc-${local.env}"
  subnet_name   = "geography-subnet-${local.env}"
  subnet_cidr   = "10.0.0.0/24"
  pods_cidr     = "10.4.0.0/14"
  services_cidr = "10.0.32.0/20"

  depends_on = [google_project_service.apis]
}

# ─── GKE Cluster ─────────────────────────────────────────────────────────────
module "gke" {
  source = "../../modules/gke"

  project_id     = var.project_id
  region         = var.region
  cluster_name   = local.cluster_name
  network        = module.network.network_name
  subnetwork     = module.network.subnet_name
  pods_range     = module.network.pods_range_name
  services_range = module.network.services_range_name

  node_count   = 1
  machine_type = "e2-medium"
  min_nodes    = 1
  max_nodes    = 2
}

# ─── Cloud SQL ────────────────────────────────────────────────────────────────
module "cloudsql" {
  source = "../../modules/cloudsql"

  project_id    = var.project_id
  region        = var.region
  instance_name = "geography-db-${local.env}"
  db_name       = "geography_db"
  db_user       = "jero"
  db_password   = var.db_password
  tier          = "db-f1-micro"

  depends_on = [google_project_service.apis]
}

# ─── Artifact Registry ───────────────────────────────────────────────────────
module "artifact_registry" {
  source = "../../modules/artifact_registry"

  project_id    = var.project_id
  region        = var.region
  repository_id = local.repo_id

  depends_on = [google_project_service.apis]
}

# ─── Cloud Build Trigger ─────────────────────────────────────────────────────
# NOTE: Requires GitHub connection to be established manually in GCP Console
# (Cloud Build > Repositories > Connect Repository) before this can be applied.
# Uncomment after connecting GitHub.
# module "cloudbuild" {
#   source = "../../modules/cloudbuild"
#
#   project_id     = var.project_id
#   trigger_name   = "deploy-on-push-${local.env}"
#   github_owner   = var.github_owner
#   github_repo    = var.github_repo
#   branch_pattern = "^master$"
#   region         = var.region
#   repository_id  = local.repo_id
#   cluster_name   = local.cluster_name
#   cluster_region = var.region
#
#   depends_on = [module.artifact_registry, module.gke]
# }

# ─── K8s Bootstrap ───────────────────────────────────────────────────────────
# Runs once after GKE and Cloud SQL are ready.
# Creates the namespace and the DB secret so Cloud Build can deploy the app.
# Run terraform from this directory: infra/environments/dev/
resource "null_resource" "k8s_bootstrap" {
  triggers = {
    cluster = module.gke.cluster_name
    db_ip   = module.cloudsql.instance_ip
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command     = <<-EOT
      gcloud container clusters get-credentials ${module.gke.cluster_name} \
        --region ${var.region} --project ${var.project_id} && \
      kubectl apply -f ../../../k8s/namespace.yaml && \
      kubectl create secret generic geography-api-secret \
        --namespace geography-api \
        --from-literal=DATABASE_URL='postgresql://jero:${nonsensitive(var.db_password)}@${module.cloudsql.instance_ip}:5432/geography_db' \
        --dry-run=client -o yaml | kubectl apply -f -
    EOT
  }

  depends_on = [module.gke, module.cloudsql]
}

# ─── Outputs ─────────────────────────────────────────────────────────────────
output "cluster_name" {
  description = "GKE cluster name"
  value       = module.gke.cluster_name
}

output "registry_url" {
  description = "Artifact Registry URL for Docker images"
  value       = module.artifact_registry.repository_url
}

output "db_instance_ip" {
  description = "Cloud SQL public IP"
  value       = module.cloudsql.instance_ip
}

# output "cloudbuild_trigger" {
#   description = "Cloud Build trigger name"
#   value       = module.cloudbuild.trigger_name
# }
