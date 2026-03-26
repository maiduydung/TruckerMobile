#!/bin/bash
# Deploy Trucker PWA to Azure Static Web Apps (Free tier)
# Usage: ./scripts/deploy.sh
set -e

STATIC_WEB_APP_NAME="nhutin-trucker"
EXPECTED_URL="https://proud-desert-0efdc0a00.4.azurestaticapps.net"

echo "=== Building PWA ==="
bash scripts/build-pwa.sh

echo ""
echo "=== Fetching deployment token ==="
TOKEN=$(az staticwebapp secrets list --name "$STATIC_WEB_APP_NAME" --query "properties.apiKey" -o tsv)
if [ -z "$TOKEN" ]; then
  echo "ERROR: Could not fetch deployment token. Make sure you're logged into Azure (az login)."
  exit 1
fi

echo ""
echo "=== Deploying to Azure Static Web Apps ==="
npx --yes @azure/static-web-apps-cli deploy ./dist \
  --deployment-token "$TOKEN" \
  --env production

echo ""
echo "=== Verifying deployment ==="
sleep 5
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$EXPECTED_URL")
if [[ "$STATUS" == "200" ]]; then
  echo "Live at $EXPECTED_URL"
else
  echo "Got HTTP $STATUS — may need a moment to propagate"
fi
