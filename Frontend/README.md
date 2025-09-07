# VisionX - X (Twitter) Feed Sharing Extension

A Chrome extension that enables secure sharing and viewing of X (Twitter) feeds between friends through an authenticated system.

## Features

### Core Functionality
- **Feed Sharing**: Share your X timeline with selected friends
- **Feed Viewing**: View feeds shared by your friends directly in your X timeline
- **Cookie Management**: Secure extraction and management of X.com authentication cookies
- **Real-time Injection**: Seamlessly inject friend's tweets into your timeline

### Authentication System
- **User Registration & Login**: Secure account creation and authentication
- **Profile Management**: View and manage user profile information
- **Account Deletion**: Complete account removal with password confirmation
- **Token-based Security**: JWT authentication with automatic token validation

### Social Features
- **Friend Management**: Add and remove friends who can view your feed
- **Access Control**: Granular control over who can access your feed
- **Feed Restoration**: Easily restore original timeline view
- **Share Status Tracking**: Monitor who has access to your feed

## Technical Architecture

### Frontend (Chrome Extension)
- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Seamless integration with X.com
- **Background Service Worker**: Handles authentication and lifecycle events
- **Responsive UI**: Modern gradient design with mobile-friendly interface

### Backend Integration
- **Flask API**: RESTful backend service
- **PostgreSQL Database**: Secure user and relationship data storage
- **Cookie Security**: Encrypted storage and transmission of authentication data
- **CORS Support**: Cross-origin resource sharing for extension communication

## Installation

### Prerequisites
- Google Chrome browser
- Active X (Twitter) account

### Setup Steps
1. **Clone the repository**

git clone https://github.com/ss-prady/VisionX-Chrome-Extension.git
cd VisionX-Chrome-Extension


2. **Load Extension in Chrome**
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the project directory

3. **Backend Configuration**
- The extension connects to `https://backend-0s46.onrender.com` by default
- For local development, update the API URL in the extension settings

## Usage

### Getting Started
1. **Register/Login**: Create an account or login with existing credentials
2. **Cookie Extraction**: Click "Fetch Cookies" while logged into X.com
3. **Share Feed**: Add friends by username to share your feed
4. **View Friends' Feeds**: Load and view feeds from friends who have shared with you

### Managing Access
- **Add Friends**: Enter username and click "Share Feed"
- **Remove Access**: Use the remove button next to shared users
- **View Permissions**: See who has access to your feed and whose feeds you can access

### Feed Operations
- **Load Feed**: Inject friend's tweets into your timeline
- **Restore Feed**: Return to your original timeline view
- **Real-time Updates**: Tweets appear seamlessly integrated with X's design

## Security & Privacy

### Data Protection
- **Encrypted Storage**: All sensitive data encrypted in transit and at rest
- **Token Expiration**: Automatic token validation and refresh
- **Secure Cookies**: X.com cookies handled with enterprise-level security
- **No Data Persistence**: Tweets not stored permanently on servers

### Privacy Controls
- **Granular Permissions**: Control exactly who can see your feed
- **Instant Revocation**: Remove access immediately
- **Audit Trail**: Track who has accessed your feed
- **Local Storage**: Sensitive data stored locally when possible

## UI/UX Features

### Design Elements
- **Modern Gradient UI**: Purple-blue gradient design system
- **Responsive Layout**: Works seamlessly across different screen sizes
- **Loading States**: Smooth loading animations and progress indicators
- **Error Handling**: Comprehensive error messages and recovery options

### User Experience
- **One-Click Operations**: Simple interface for complex operations
- **Real-time Feedback**: Instant success/error notifications
- **Intuitive Navigation**: Clear flow between authentication and main features
- **Accessibility**: Keyboard navigation and screen reader support

## Development

### Project Structure

Visionx-Chrome-Extension/
├── manifest.json # Extension configuration
├── background.js # Service worker for background tasks
├── content.js # Content script for X.com injection
├── popup.html # Extension popup interface
├── popup.js # Popup functionality and API calls
├── popup.css # Styling and responsive design
└── icon.png # Extension icon

### Key Components
- **Authentication Flow**: Complete user management system
- **Cookie Extraction**: Secure X.com authentication data handling
- **Feed Injection**: Dynamic tweet rendering with X's styling
- **API Integration**: RESTful communication with backend services

### Configuration
The extension supports configurable API endpoints for development and production environments.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This extension requires an active X (Twitter) account and appropriate permissions to function properly. Always ensure you're logged into X.com before using feed sharing features.