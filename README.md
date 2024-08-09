# Hello-World UI Service

## Project Description
#### Overview
The Hello World UI service project is designed to deploy a Node.js web application using Google Kubernetes Engine (GKE) and manage it with Prometheus and Grafana for monitoring. The project utilizes Docker for containerization and Google Artifact Registry (GAR) for storing Docker images. It integrates with Kubernetes for application deployment and uses Helm for managing Prometheus and Grafana installations.

#### Goals
- **Deploy Node.js Application:** Containerize and deploy a Node.js web application to a GKE cluster.
- **Manage Docker Images:** Use Google Artifact Registry to store and manage Docker images.
- **Enable Monitoring:** Implement Prometheus and Grafana for monitoring application metrics and visualizing data.
- **Secure Access:** Configure Kubernetes secrets for database credentials and Docker image access.

## Tool Decisions
#### Docker
- Reason for Choice: Docker is used for containerizing the Node.js application, ensuring consistent deployment across different environments.
- Advantages:
   - Encapsulates application dependencies and environment.
   - Facilitates reproducible builds and deployment.
#### Google Artifact Registry (GAR)
- Reason for Choice: GAR is used to store and manage Docker images securely.
- Advantages:
   - Integration with GCP services for seamless authentication and authorization.
   - Supports immutable tags to prevent overwriting of images.
#### Google Kubernetes Engine (GKE)
- Reason for Choice: GKE provides a managed Kubernetes environment, simplifying the deployment and scaling of containerized applications.
- Advantages:
   - Managed Kubernetes service with automated updates and scaling.
   - Integration with GCP’s security, logging, and monitoring services.
#### Prometheus
- Reason for Choice: Prometheus is used for collecting and storing metrics from the Node.js application and Kubernetes components.
- Advantages:
   - Powerful querying language (PromQL) for metric analysis.
   - Integration with Kubernetes for service discovery and monitoring.
#### Grafana
- Reason for Choice: Grafana provides a flexible platform for visualizing metrics from Prometheus.
- Advantages:
   - Customizable dashboards for visualizing a wide range of metrics.
   - Supports various data sources, including Prometheus.
#### Helm
- Reason for Choice: Helm is used for managing Kubernetes applications, making it easier to deploy and configure Prometheus and Grafana.
- Advantages:
   - Simplifies the management of Kubernetes resources with pre-configured charts.
   - Facilitates version control and updates.

## Architecture Diagram

<img width="1033" alt="image" src="https://github.com/user-attachments/assets/53c21b25-4494-46b0-83c3-f8196166a8f7">

## Setup Instructions

### 1. Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/thunderbirdgit/hw-ui-service.git
```

### 2. Create Google Artifact Registry
If you don't have a Google Artifact Registry, create one and ensure immutable tags are enabled to prevent overwriting the same image.

   <img width="472" alt="image" src="https://github.com/user-attachments/assets/e02c5f0a-46c8-43e4-99e2-6e613a63e7bd">
   
### 3. Build, Tag, and Push Docker Image
Authenticate Docker with Google Artifact Registry, then build, tag, and push the Docker image:
```
gcloud auth configure-docker us-central1-docker.pkg.dev
docker build -t hello-world-fe-ab12n1o-develop:latest .
docker tag hello-world-fe-ab12n1o-develop:latest us-central1-docker.pkg.dev/nonprod-app-cluster/nonprod/hello-world-fe-ab12n1o-develop:latest
docker push us-central1-docker.pkg.dev/nonprod-app-cluster/nonprod/hello-world-fe-ab12n1o-develop:latest
```

### 4. Enable GitGuardian
Enable GitGuardian checks to monitor and alert if any sensitive information is committed to the repository.
   <img width="632" alt="image" src="https://github.com/user-attachments/assets/1e5a88de-ac17-4678-8407-d08dec8c42de">

### 5. Verify Artifacts in Google Artifact Registry
Ensure your Docker images are correctly pushed to Google Artifact Registry.
<img width="667" alt="image" src="https://github.com/user-attachments/assets/5acbed15-91e6-40b1-9219-06f401a19e40">

### 6. Create a Service Account for Docker Image Access
Create a service account to pull Docker images during deployments and avoid using credentials directly in configuration files:
 ```
 $ gcloud iam service-accounts create app-docker-image-puller --description="Service account for pulling Docker images" --display-name="Docker Image Puller"   

 $ gcloud projects add-iam-policy-binding nonprod-app-cluster --member="serviceAccount:app-docker-image-puller@nonprod-
 app-cluster.iam.gserviceaccount.com" --role="roles/artifactregistry.reader"
 ```

### 7. Update IAM Policy for Artifact Access
Generate a key for the service account and create a Kubernetes secret for Docker registry access:
 ```
 $ gcloud iam service-accounts keys create app-docker-read-key.json --iam-account=app-docker-image-puller@nonprod-app-cluster.iam.gserviceaccount.com   

 $ kubectl create secret docker-registry regcred --docker-server=us-central1-docker.pkg.dev --docker-username=_json_key --docker-password="$(cat app-docker-read-key.json)" --docker-email=<email>

 $ gcloud projects add-iam-policy-binding nonprod-app-cluster --member="serviceAccount:app-docker-image-puller@nonprod-app-cluster.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
 ```

### 8. Create Database Credentials for Dev Environment
Store database credentials in Kubernetes secrets for runtime access:
```
kubectl create secret generic dev-db-credentials --from-literal=host=<DATABASE_SERVER_IP> --from-literal=port=5432 --from-literal=user=<DB_USERNAME> --from-literal=password=<DB_PASSWORD> --from-literal=database=<DB_NAME>
```

### 9. Prepare Kubernetes Manifests
Prepare Kubernetes manifests for deployment:
- deployment.yaml: Contains deployment details, including image, container ports, resource configuration, and DB secrets.
- service.yaml: Configures a LoadBalancer service for the application with HTTP port 3080 and metrics port 3081.
- ingress.yaml: Configures Ingress to host dev.helloworld.com with path prefixes for the application and metrics server.
- prometheus-service.yaml: Service file to access the Prometheus monitoring server.
- servicemonitor.yaml: Configuration to monitor metrics server endpoints.
- prometheus/: Contains Prometheus monitoring server installation files with configurations for LoadBalancer and scrape_configs.
- grafana/: Contains Grafana monitoring dashboard installation files with LoadBalancer configuration.

### 10. Connect and deploy to Kubernetes Manifests

- Connect to Kubernetes dev cluster 
```
gcloud container clusters get-credentials dev-gke-cluster --region=us-central1
Fetching cluster endpoint and auth data.
kubeconfig entry generated for dev-gke-cluster.
```

- Apply the manifest files to create the deployment, service, Ingress, ServiceMonitor, and other resources: `kubectl apply -f manifests/`
    
### 11. Deploy Ingress Controller

<img width="772" alt="image" src="https://github.com/user-attachments/assets/be191d3a-cd3c-4e45-b7b2-b989ac74e8b3">

### 12. Verify Pods, Service, and Ingress
Ensure that the services are using LoadBalancer instead of ClusterIP to enable traffic routing through the Ingress Controller.

<img width="733" alt="image" src="https://github.com/user-attachments/assets/2bda5dcf-d324-4772-9c87-788c2c854b25">

<img width="975" alt="image" src="https://github.com/user-attachments/assets/c4678a47-cece-4ba2-88de-3cdb0f376d9d">

<img width="684" alt="image" src="https://github.com/user-attachments/assets/c7ba6e70-02e3-4c85-b0d6-2fda634301d5">

### 13. Access the Application
In real world, dev.helloworld.com will be registered through the Domain registration providers. For the purposes of this exercise, modify the `/etc/hosts` file on your laptop or other device to access `http://dev.helloworld.com` through Ingress IP. 

<img width="345" alt="image" src="https://github.com/user-attachments/assets/b56530fb-7bd2-469a-8579-0357389e7e20">

 <img width="424" alt="image" src="https://github.com/user-attachments/assets/6f2871e4-fba1-4f1b-88e9-90b5b2606cce">

### 14. Monitor Ingress Logs
Ingress access logs can be accessed by running `kubectl logs -f <ingress_controller> --namespace ingress-nginx`
    
<img width="785" alt="image" src="https://github.com/user-attachments/assets/acafb9e3-899f-4a04-9fd1-9365bdf5ab25">

### 15. Access Node.js Application Metrics
Metrics can be accessed from the /metrics endpoint of your application. This data can be integrated with Prometheus and Grafana for monitoring and analytics.

<img width="779" alt="image" src="https://github.com/user-attachments/assets/c397797b-2ee3-42f9-be69-32c416926d00">

### 16. Install Prometheus
Install Prometheus using Helm:
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts    
helm repo update
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.52.0/example/prometheus-operator-crd/monitoring.coreos.com_prometheuses.yaml --force-conflicts=true --server-side
helm install prometheus prometheus-community/prometheus
helm pull prometheus-community/prometheus --untar # Pull prometheus installation folder
# Modify values.yaml file from ClusterIP to LoadBalancer
helm upgrade prometheus prometheus-community/prometheus -f values.yaml
```
    
### 17. Access Prometheus
Prometheus can be accessed from the LoadBalancer IP.

<img width="964" alt="image" src="https://github.com/user-attachments/assets/36ac33da-06a7-4e9b-a88c-db5bd783de82">

### 18. Update Prometheus Scrape Configurations
Add scrape configurations to values.yaml and restart Prometheus to scrape metrics from the hello-world-fe service:
```
scrape_configs:
      - job_name: 'hello-world-fe'
        scrape_interval: 15s
        static_configs:
          - targets: ['hello-world-fe:3081']  
```

After applying the changes and restarting prometheus server, hello-world-fe metrics data can be accessed from Prometheus server

```
helm upgrade prometheus prometheus-community/prometheus -f values.yaml
kubectl rollout restart deployment prometheus-server
```
    
<img width="1119" alt="image" src="https://github.com/user-attachments/assets/31e891e4-937b-4d03-a90a-5787897f841a">

 Display HTTP Requests Total
 
 <img width="1408" alt="image" src="https://github.com/user-attachments/assets/c53cf186-d0c5-484c-a288-d4f0cda6ad6a">

Although Promotheus can be used for monitoring and alerting, Grafana can be the best tool for data visualization. Data from Prometheus can be used as a data source for Grafana to create dashboards

### 19. Install Grafana
Install Grafana using Helm:
```
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana 
helm pull grafana/grafana --untar
# Change from ClusterIP to LoadBalancer in values.yaml and reapply
helm upgrade grafana grafana/grafana -f values.yaml
```
    
20. Access Grafana
Grafana can be accessed from the LoadBalancer IP. Add Prometheus as a data source and configure dashboards.
<img width="739" alt="image" src="https://github.com/user-attachments/assets/464923f8-e1d1-439c-8517-d2435756eb3a">

<img width="763" alt="image" src="https://github.com/user-attachments/assets/64c4bf4c-6cac-4562-82d3-aa287a05c67a">

<img width="716" alt="image" src="https://github.com/user-attachments/assets/9796b1b9-4962-4d87-98cf-333f4d370c8f">

<img width="752" alt="image" src="https://github.com/user-attachments/assets/0f6c0a2f-dd89-4fe6-87d6-ff406baf185e">

### 21. Verify All Pods
Ensure all pods are healthy:

```
$ kubectl get pods
NAME                                                 READY   STATUS    RESTARTS   AGE
grafana-846f7fdf6-g2n25                              1/1     Running   0          45m
hello-world-fe-5f49c88f84-bsgx9                      1/1     Running   0          106m
prometheus-alertmanager-0                            1/1     Running   0          98m
prometheus-kube-state-metrics-6b6cdbf965-b4r4r       1/1     Running   0          98m
prometheus-operator-755897dcb6-mnxmm                 1/1     Running   0          92m
prometheus-prometheus-node-exporter-4cqgh            1/1     Running   0          98m
prometheus-prometheus-node-exporter-5mr4v            1/1     Running   0          98m
prometheus-prometheus-node-exporter-nj7d2            1/1     Running   0          98m
prometheus-prometheus-pushgateway-57c548bd6f-qrgzk   1/1     Running   0          98m
prometheus-server-7cb8cd8fd5-mfrz8                   2/2     Running   0          98m
```

### 22. Create Grafana Dashboards
Now Grafana is ready to display dashboards with visualizations based on the metrics collected from Prometheus.    
```
# Example Dashboard Creation Steps
# 1. Navigate to Grafana web UI
# 2. Create a new dashboard
# 3. Add Prometheus as a data source
# 4. Create panels for different metrics
```

<img width="554" alt="image" src="https://github.com/user-attachments/assets/49395306-7d98-49e7-8869-73e979493083">

### Cleanup
```
kubectl delete service hello-world-fe 
kubectl delete ingress hello-world-fe
kubectl delete deployment hello-world-fe
```

## Lessons Learned
- Effective Containerization: Docker streamlined the deployment process, making it easy to manage and deploy the application consistently.
- Integration Challenges: Configuring Prometheus and Grafana required careful attention to service discovery and metric scraping configurations.
- Security and Access Control: Proper management of Kubernetes secrets and IAM roles was crucial for maintaining security and access control.
