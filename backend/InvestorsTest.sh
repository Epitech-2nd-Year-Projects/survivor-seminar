#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080"
API_PREFIX="/api/v1"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
CREATED_INVESTOR_ID=""
TOTAL_TESTS=0
PASSED_TESTS=0

echo -e "${BLUE}🧪 Test complet des endpoints Investors${NC}"
echo "=============================================="

# Fonction pour afficher un test
print_test() {
    local test_number=$1
    local description=$2
    echo -e "\n${YELLOW}Test $test_number: $description${NC}"
    echo "-------------------------------------------"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5

    echo -e "${BLUE}➤ $method $url${NC}"

    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" 2>/dev/null)
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$url" 2>/dev/null)
    fi

    body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    status=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ SUCCESS ($status)${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))

        # Extraire l'ID si c'est une création d'investor
        if [ "$method" = "POST" ] && [ "$status" -eq "201" ]; then
            CREATED_INVESTOR_ID=$(echo $body | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
            if [ -n "$CREATED_INVESTOR_ID" ]; then
                echo -e "${BLUE}📝 Created investor ID: $CREATED_INVESTOR_ID${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ FAILED (Expected: $expected_status, Got: $status)${NC}"
    fi

    # Afficher la réponse formatée si possible
    if command -v jq &> /dev/null; then
        echo -e "${BLUE}Response:${NC}"
        echo $body | jq . 2>/dev/null || echo $body
    else
        echo -e "${BLUE}Response:${NC} $body"
    fi

    sleep 0.3
}

# ===========================================
# CRÉATION INITIALE DE 10 INVESTISSEURS
# ===========================================

echo -e "\n${BLUE}➤ Création de 10 investisseurs de test${NC}"

for i in {1..10}; do
    DATA="{
      \"name\": \"Investor Test $i\",
      \"email\": \"investor$i@test.com\",
      \"legal_status\": \"SARL\",
      \"address\": \"${i} Rue de Paris\",
      \"phone\": \"+3312345678$i\",
      \"description\": \"Investisseur numéro $i\",
      \"investor_type\": \"Business Angel\",
      \"investment_focus\": \"Tech, SaaS\"
    }"
    test_endpoint "POST" "${BASE_URL}${API_PREFIX}/admin/investors" "$DATA" 201 "Create investor $i"
done

# ===========================================
# TESTS DES ENDPOINTS PUBLICS
# ===========================================

print_test "1" "Récupérer tous les investisseurs"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/investors" "" 200 "Get all investors"

print_test "2" "Récupérer les investisseurs avec pagination"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/investors?page=1&per_page=5" "" 200 "Get investors with pagination"

print_test "3" "Récupérer avec tri par nom"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/investors?sort=name&order=asc" "" 200 "Sort by name ascending"

print_test "4" "Récupérer un investisseur spécifique (ID=1)"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/investors/1" "" 200 "Get investor by ID"

print_test "5" "Récupérer un investisseur inexistant"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/investors/99999" "" 404 "Get non-existent investor"

# ===========================================
# TESTS DES ENDPOINTS ADMIN (CRUD)
# ===========================================

print_test "6" "Créer un nouvel investisseur"
NEW_INVESTOR='{
  "name": "Special Investor",
  "email": "special@test.com",
  "legal_status": "SA",
  "address": "100 Avenue des Champs",
  "phone": "+33987654321",
  "description": "Investisseur spécial pour test",
  "investor_type": "VC",
  "investment_focus": "AI, Blockchain"
}'
test_endpoint "POST" "${BASE_URL}${API_PREFIX}/admin/investors" "$NEW_INVESTOR" 201 "Create special investor"

print_test "7" "Mettre à jour un investisseur (ID créé)"
if [ -n "$CREATED_INVESTOR_ID" ]; then
    UPDATE_DATA='{
      "description": "Investisseur mis à jour",
      "phone": "+33999999999"
    }'
    test_endpoint "PATCH" "${BASE_URL}${API_PREFIX}/admin/investors/${CREATED_INVESTOR_ID}" "$UPDATE_DATA" 200 "Update investor"
fi

print_test "8" "Mettre à jour un investisseur inexistant"
UPDATE_FAIL='{"name":"Ghost"}'
test_endpoint "PATCH" "${BASE_URL}${API_PREFIX}/admin/investors/99999" "$UPDATE_FAIL" 404 "Update non-existent investor"

print_test "9" "Mettre à jour sans champs"
EMPTY_UPDATE='{}'
test_endpoint "PATCH" "${BASE_URL}${API_PREFIX}/admin/investors/1" "$EMPTY_UPDATE" 400 "Update with no fields"

print_test "10" "Mettre à jour avec email invalide"
BAD_EMAIL_UPDATE='{"email":"not-an-email"}'
test_endpoint "PATCH" "${BASE_URL}${API_PREFIX}/admin/investors/1" "$BAD_EMAIL_UPDATE" 400 "Update with invalid email"

print_test "11" "Supprimer un investisseur existant"
if [ -n "$CREATED_INVESTOR_ID" ]; then
    test_endpoint "DELETE" "${BASE_URL}${API_PREFIX}/admin/investors/${CREATED_INVESTOR_ID}" "" 200 "Delete investor"
fi

print_test "12" "Supprimer un investisseur inexistant"
test_endpoint "DELETE" "${BASE_URL}${API_PREFIX}/admin/investors/99999" "" 404 "Delete non-existent investor"

# ===========================================
# RÉSUMÉ FINAL
# ===========================================

echo -e "\n=============================================="
echo -e "${BLUE}Résultats des tests Investors:${NC}"
echo -e "Total: $TOTAL_TESTS | ${GREEN}Passés: $PASSED_TESTS${NC} | ${RED}Échoués: $((TOTAL_TESTS-PASSED_TESTS))${NC}"
echo "=============================================="