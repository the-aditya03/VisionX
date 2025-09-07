// Background service worker for Chrome Extension
// This handles extension lifecycle and background tasks

console.log('Background script loaded');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);

    if (details.reason === 'install') {
        console.log('Extension installed for the first time');

        // Set default configuration
        chrome.storage.sync.set({
            apiUrl: 'https://backend-0s46.onrender.com'
        });

        // Optional: Open options page on first install
        // chrome.runtime.openOptionsPage();
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);

    switch (request.action) {
        case 'checkAuth':
            checkAuthStatus().then(sendResponse);
            return true; // Will respond asynchronously

        case 'logout':
            handleLogout().then(sendResponse);
            return true;

        case 'getConfig':
            getConfig().then(sendResponse);
            return true;

        default:
            console.log('Unknown action:', request.action);
            sendResponse({ error: 'Unknown action' });
    }
});

// Authentication status check
async function checkAuthStatus() {
    try {
        const result = await chrome.storage.local.get(['authToken']);
        return {
            isAuthenticated: !!result.authToken,
            token: result.authToken
        };
    } catch (error) {
        console.error('Failed to check auth status:', error);
        return { isAuthenticated: false, error: error.message };
    }
}

// Handle logout from background
async function handleLogout() {
    try {
        await chrome.storage.local.remove(['authToken']);
        console.log('User logged out from background');
        return { success: true };
    } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
    }
}

// Get configuration
async function getConfig() {
    try {
        const result = await chrome.storage.sync.get(['apiUrl']);
        return {
            apiUrl: result.apiUrl || 'http://localhost:5000'
        };
    } catch (error) {
        console.error('Failed to get config:', error);
        return { error: error.message };
    }
}

// Periodic token validation (optional)
// This could be used to automatically logout users with expired tokens
async function validateStoredToken() {
    try {
        const authResult = await checkAuthStatus();
        if (authResult.isAuthenticated) {
            const config = await getConfig();

            // Verify token with server
            const response = await fetch(`${config.apiUrl}/api/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authResult.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log('Token is invalid, logging out user');
                await handleLogout();
            }
        }
    } catch (error) {
        console.error('Token validation failed:', error);
    }
}

// Optional: Set up periodic token validation
// chrome.alarms.create('validateToken', { periodInMinutes: 30 });
// chrome.alarms.onAlarm.addListener((alarm) => {
//     if (alarm.name === 'validateToken') {
//         validateStoredToken();
//     }
// });

// Handle browser action click (if popup is disabled)
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked');
    // This won't be called if popup is set in manifest
});

// Network request interceptor (optional)
// This could be used to add authentication headers to specific requests
// chrome.webRequest.onBeforeSendHeaders.addListener(
//     (details) => {
//         // Add authentication headers to requests if needed
//         return { requestHeaders: details.requestHeaders };
//     },
//     { urls: ["<all_urls>"] },
//     ["requestHeaders"]
// );

console.log('Background script initialization complete');
