#!/bin/bash
source .env;

echo -e '\033[0;32m''Installing helm on cluster...''\033[0m'
helm init
kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default
kubectl get pods --namespace=kube-system | grep tiller
echo -e '\033[0;32m''Waiting for Tiller Deploy to be ready...(15sec)''\033[0m'
sleep 15
kubectl get pods --namespace=kube-system | grep tiller
echo -e '\033[0;32m''Installing kube-lego...''\033[0m'
helm install stable/kube-lego --set config.LEGO_EMAIL=$LEGO_EMAIL,config.LEGO_URL=https://acme-v01.api.letsencrypt.org/directory,config.LEGO_LOG_LEVEL=debug
echo -e '\033[0;32m''Installing nginx-ingress...''\033[0m'
helm install stable/nginx-ingress --set rbac.create=true

kubectl get pods
kubectl get svc
