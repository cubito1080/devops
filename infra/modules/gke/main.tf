resource "google_container_cluster" "cluster" {
  project  = var.project_id
  name     = var.cluster_name
  location = var.region

  network    = var.network
  subnetwork = var.subnetwork

  # Remove the default node pool immediately and manage a custom one below.
  # This is the recommended pattern — gives full control over node pool config.
  remove_default_node_pool = true
  initial_node_count       = 1

  ip_allocation_policy {
    cluster_secondary_range_name  = var.pods_range
    services_secondary_range_name = var.services_range
  }

  deletion_protection = false
}

resource "google_container_node_pool" "nodes" {
  project  = var.project_id
  name     = "${var.cluster_name}-node-pool"
  location = var.region
  cluster  = google_container_cluster.cluster.name

  initial_node_count = var.node_count

  autoscaling {
    min_node_count = var.min_nodes
    max_node_count = var.max_nodes
  }

  node_config {
    machine_type = var.machine_type
    disk_size_gb = 30

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }
}
