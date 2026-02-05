#!/bin/bash

# Quick diagnostic using curl for Redis REST API

REDIS_URL="${KV_REST_API_URL}"
REDIS_TOKEN="${KV_REST_API_TOKEN}"

echo "🔍 DIAGNOSING GIFTS #366, #367, #365"
echo "======================================================================"

echo -e "\n📦 GIFT #366 (Gift ID: 389):"
echo "----------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $REDIS_TOKEN" "$REDIS_URL/hgetall/gift:detail:389" | jq '.result | to_entries | map({key: .[0], value: .[1]}) | from_entries | {email_encrypted, email_hmac, email_plain, education_score_correct, education_score_total}'

echo -e "\n📦 GIFT #367 (Gift ID: 390):"
echo "----------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $REDIS_TOKEN" "$REDIS_URL/hgetall/gift:detail:390" | jq '.result | to_entries | map({key: .[0], value: .[1]}) | from_entries | {email_encrypted, email_hmac, email_plain, education_score_correct, education_score_total}'

echo -e "\n📦 GIFT #365 (Gift ID: 388) - REFERENCE:"
echo "----------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $REDIS_TOKEN" "$REDIS_URL/hgetall/gift:detail:388" | jq '.result | to_entries | map({key: .[0], value: .[1]}) | from_entries | {email_encrypted, email_hmac: (.email_hmac[:16] + "..."), email_plain, education_score_correct, education_score_total}'

echo -e "\n✅ DIAGNOSIS COMPLETE"
