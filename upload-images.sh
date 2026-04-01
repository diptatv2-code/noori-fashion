#!/bin/bash
# Upload product images to Supabase Storage
# Run from the noori-fashion project directory

SUPABASE_URL="https://api.diptait.com.bd"
# Get service role key from env or .env.local
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)

if [ -z "$SERVICE_KEY" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
  exit 1
fi

echo "Uploading product images to Supabase Storage..."

for img in public/products/image*.jpeg; do
  filename=$(basename "$img")
  echo -n "  Uploading products/$filename... "
  
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$SUPABASE_URL/storage/v1/object/noori-fashion/products/$filename" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: image/jpeg" \
    --data-binary @"$img"
  
  echo ""
done

echo ""
echo "Uploading banner images..."

for img in public/banner-*.jpg; do
  filename=$(basename "$img")
  echo -n "  Uploading banners/$filename... "
  
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$SUPABASE_URL/storage/v1/object/noori-fashion/banners/$filename" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: image/jpeg" \
    --data-binary @"$img"
  
  echo ""
done

echo ""
echo "Uploading logo..."
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/storage/v1/object/noori-fashion/logo.jpg" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary @"public/logo.jpg"
echo ""

echo "Done! All images uploaded."
echo ""
echo "Now run the image seed SQL:"
echo "  cat noori-fashion-images-seed.sql | sudo docker exec -i supabase-db psql -U postgres"
