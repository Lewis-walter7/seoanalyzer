#!/bin/bash

# Configuration
PROJECT_ID="${PROJECT_ID}"
TOKEN="${TOKEN}"
REFRESH_TOKEN="${REFRESH_TOKEN}"
API_URL="http://localhost:3001/v1/projects/${PROJECT_ID}"
TIMEOUT_SECONDS=120  # 2 minutes
POLL_INTERVAL=3      # Poll every 3 seconds

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: PROJECT_ID environment variable is not set"
    exit 1
fi

if [ -z "$TOKEN" ]; then
    echo "ERROR: TOKEN environment variable is not set"
    exit 1
fi

if [ -z "$REFRESH_TOKEN" ]; then
    echo "ERROR: REFRESH_TOKEN environment variable is not set"
    exit 1
fi

# Function to refresh access token
refresh_access_token() {
    echo "Access token expired, refreshing..."
    local refresh_response=$(curl -s -X POST "http://localhost:3001/auth/refresh" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
    
    local new_token=$(echo "$refresh_response" | jq -r '.accessToken // empty')
    
    if [ -n "$new_token" ] && [ "$new_token" != "null" ]; then
        TOKEN="$new_token"
        echo "Access token refreshed successfully"
        return 0
    else
        echo "ERROR: Failed to refresh access token"
        echo "Response: $refresh_response"
        return 1
    fi
}

echo "Starting analysis status polling..."
echo "Project ID: $PROJECT_ID"
echo "Timeout: ${TIMEOUT_SECONDS} seconds"
echo "Poll interval: ${POLL_INTERVAL} seconds"
echo "----------------------------------------"

start_time=$(date +%s)

while true; do
    current_time=$(date +%s)
    elapsed_time=$((current_time - start_time))
    
    # Check if timeout reached
    if [ $elapsed_time -ge $TIMEOUT_SECONDS ]; then
        echo "TIMEOUT: Analysis did not complete within ${TIMEOUT_SECONDS} seconds"
        echo "Test FAILED: Analysis is still processing after timeout"
        exit 1
    fi
    
    echo "Polling... (elapsed: ${elapsed_time}s)"
    
    # Make API request with authentication
    response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL")
    
    # Check if curl command was successful
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to make API request"
        exit 1
    fi
    
    # Check if we got a 401 Unauthorized response (token expired)
    if echo "$response" | grep -q "Unauthorized\|expired\|invalid token" && echo "$response" | grep -q "401\|statusCode.*:.*401"; then
        echo "Received 401 Unauthorized, attempting to refresh token..."
        if refresh_access_token; then
            echo "Retrying request with new token..."
            response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL")
            if [ $? -ne 0 ]; then
                echo "ERROR: Failed to make API request after token refresh"
                exit 1
            fi
        else
            echo "ERROR: Could not refresh access token"
            exit 1
        fi
    fi
    
    # Extract status from response
    status=$(echo "$response" | jq -r '.status // empty')
    
    # Check if jq command was successful and status exists
    if [ -z "$status" ] || [ "$status" = "null" ]; then
        # Check if this is an error response
        error_message=$(echo "$response" | jq -r '.message // empty')
        if [ -n "$error_message" ] && [ "$error_message" != "null" ]; then
            echo "API Error: $error_message"
            echo "Response: $response"
            exit 1
        else
            echo "ERROR: Could not extract status from response"
            echo "Response: $response"
            exit 1
        fi
    fi
    
    echo "Current status: $status"
    
    # Check if analysis is completed
    if [ "$status" = "COMPLETED" ] || [ "$status" = "completed" ] || [ "$status" = "FINISHED" ] || [ "$status" = "finished" ]; then
        echo "SUCCESS: Analysis completed!"
        echo "Final response:"
        echo "$response" | jq '.'
        exit 0
    fi
    
    # Check for failed status
    if [ "$status" = "FAILED" ] || [ "$status" = "failed" ] || [ "$status" = "ERROR" ] || [ "$status" = "error" ]; then
        echo "FAILED: Analysis failed with status: $status"
        echo "Response: $response"
        exit 1
    fi
    
    # Wait before next poll
    sleep $POLL_INTERVAL
done
