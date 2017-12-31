#!/bin/bash
source .env;

echo -e '\033[0;32m''Getting master node ip...''\033[0m'
MASTER_IP=$(head -n 1 ./targets.cfg)
echo $MASTER_IP
echo -e '\033[0;32m''Copying certificates and keys from master node...''\033[0m'
scp -pr root@$MASTER_IP:/etc/kubernetes/ssl ./cluster_access/$BASE_NAME
echo -e '\033[0;32m''Configuring kubectl...''\033[0m'
echo -e '\033[0;32m''Setting cluster...''\033[0m'
kubectl config set-cluster $BASE_NAME --server=https://$MASTER_IP:6443 --certificate-authority=./cluster_access/$BASE_NAME/ca.pem
echo -e '\033[0;32m''Setting credentials...''\033[0m'
kubectl config set-credentials $BASE_NAME-admin \
--certificate-authority=./cluster_access/$BASE_NAME/ca.pem \
--client-key=./cluster_access/$BASE_NAME/admin-node1-key.pem \
--client-certificate=./cluster_access/$BASE_NAME/admin-node1.pem
echo -e '\033[0;32m''Setting context...''\033[0m'
kubectl config set-context $BASE_NAME --cluster=$BASE_NAME --user=$BASE_NAME-admin
echo -e '\033[0;32m''Switching context''\033[0m'
kubectl config use-context $BASE_NAME
echo -e '\033[0;32m''Current context is now set to:' $(kubectl config current-context)'\033[0m'
kubectl cluster-info
kubectl get nodes
