#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080"
API_PREFIX="/api/v1"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables globales
CREATED_USER_ID=""
TOTAL_TESTS=0
PASSED_TESTS=0

echo -e "${BLUE}🧪 Test complet des endpoints Users${NC}"
echo "=============================================="

# Fonction affichage
print_test() {
    local test_number=$1
    local description=$2
    echo -e "\n${YELLOW}Test $test_number: $description${NC}"
    echo "-------------------------------------------"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Fonction test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4

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

        # Extraire l'ID si création user
        if [ "$method" = "POST" ] && [ "$status" -eq "201" ]; then
            CREATED_USER_ID=$(echo $body | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
            if [ -n "$CREATED_USER_ID" ]; then
                echo -e "${BLUE}📝 Created user ID: $CREATED_USER_ID${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ FAILED (Expected: $expected_status, Got: $status)${NC}"
    fi

    if command -v jq &> /dev/null; then
        echo -e "${BLUE}Response:${NC}"
        echo $body | jq . 2>/dev/null || echo $body
    else
        echo -e "${BLUE}Response:${NC} $body"
    fi

    sleep 0.5
}

# ===========================================
# TESTS PUBLICS
# ===========================================

print_test "1" "Lister tous les users"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users" "" 200

print_test "2" "Lister avec pagination"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users?page=1&per_page=2" "" 200

print_test "3" "Récupérer un user par ID (1)"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users/1" "" 200

print_test "4" "Récupérer un user inexistant"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users/99999" "" 404

print_test "5" "Récupérer un user par email"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users/email/test@example.com" "" 200

print_test "6" "Récupérer l'image d'un user (ID=1)"
test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users/1/image" "" 200

# ===========================================
# TESTS ADMIN (CRUD)
# ===========================================

print_test "7" "Créer un nouvel utilisateur"
CREATE_USER='{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "visitor",
  "password": "password123"
}'
test_endpoint "POST" "${BASE_URL}${API_PREFIX}/admin/users" "$CREATE_USER" 201

print_test "8" "Créer un utilisateur invalide (email manquant)"
CREATE_INVALID='{
  "name": "Invalid User",
  "role": "visitor",
  "password": "password123"
}'
test_endpoint "POST" "${BASE_URL}${API_PREFIX}/admin/users" "$CREATE_INVALID" 400

print_test "9" "Mettre à jour un utilisateur créé"
if [ -n "$CREATED_USER_ID" ]; then
    UPDATE_USER='{
      "name": "Updated User",
      "role": "admin"
    }'
    test_endpoint "PATCH" "${BASE_URL}${API_PREFIX}/admin/users/$CREATED_USER_ID" "$UPDATE_USER" 200
else
    echo -e "${YELLOW}⚠️ Skipping update test - no user ID available${NC}"
fi

print_test "10" "Mettre à jour un utilisateur inexistant"
UPDATE_NONEXISTENT='{
  "name": "Ghost User"
}'
test_endpoint "PATCH" "${BASE_URL}${API_PREFIX}/admin/users/99999" "$UPDATE_NONEXISTENT" 404

print_test "11" "Supprimer un utilisateur inexistant"
test_endpoint "DELETE" "${BASE_URL}${API_PREFIX}/admin/users/99999" "" 404

print_test "12" "Supprimer l'utilisateur créé"
if [ -n "$CREATED_USER_ID" ]; then
    test_endpoint "DELETE" "${BASE_URL}${API_PREFIX}/admin/users/$CREATED_USER_ID" "" 200

    print_test "13" "Vérifier que l'utilisateur supprimé n'existe plus"
    test_endpoint "GET" "${BASE_URL}${API_PREFIX}/users/$CREATED_USER_ID" "" 404
else
    echo -e "${YELLOW}⚠️ Skipping delete test - no user ID available${NC}"
fi

# ===========================================
# RÉSUMÉ
# ===========================================

echo -e "\n${BLUE}=============================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=============================================="
echo -e "Total des tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Tests réussis: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests échoués: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}🎉 Tous les tests sont passés avec succès!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Certains tests ont échoué.${NC}"
    exit 1
fi