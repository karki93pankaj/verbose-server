
STAGE=''
KUBE_CERTIFICATE=''
KUBE_CONFIG=''

if [ "$TRAVIS_BRANCH" = "develop" ]
then
  STAGE=staging
  KUBE_CERTIFICATE=$KUBE_CLUSTER_CERTIFICATE_STAGING
  KUBE_CONFIG=kube.staging.config
else
  STAGE=prod
  KUBE_CERTIFICATE=$KUBE_CLUSTER_CERTIFICATE_PROD
  KUBE_CONFIG=kube.prod.config
fi

# Install kubectl
curl -O "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
export PATH=$PATH:$HOME/.local/bin

# Set kubectl config
curl -o config "https://$GITHUB_ACCESS_TOKEN@raw.githubusercontent.com/ratecity/rc-devops/master/k8s/$KUBE_CONFIG"
mkdir ${HOME}/.kube
cp config ${HOME}/.kube/config
kubectl config set clusters.kubernetes-$STAGE.certificate-authority-data $KUBE_CERTIFICATE

# Install awscli
pip install --user awscli
mkdir ${HOME}/.aws
echo "[default]"> ${HOME}/.aws/credentials
echo "region = ap-southeast-2">> ${HOME}/.aws/credentials
echo "output=json" >> ${HOME}/.aws/credentials

# setup aws-iam-authenticator
curl -Lo aws-iam-authenticator "https://amazon-eks.s3-us-west-2.amazonaws.com/1.12.7/2019-03-27/bin/linux/amd64/aws-iam-authenticator"
chmod +x aws-iam-authenticator
sudo mv ./aws-iam-authenticator /usr/local/bin

# login to ECR
eval $(aws ecr get-login --no-include-email --region ap-southeast-2)
# build images
docker build -t 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/content-server:latest -t 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/content-server:$SHA -f ./Dockerfile ./

# push images
docker push 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/content-server:latest
docker push 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/content-server:$SHA

# update the tag
sed -i "s/:TAG/:$SHA/g" k8s/deployment.yaml
sed -i "s/\/STAGE/\/$STAGE/g" k8s/deployment.yaml

# apply new changes
kubectl apply -f k8s/deployment.yaml
