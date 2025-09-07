# VisionX – Twitter (X) Feed Sharing System  

A full-stack system enabling secure sharing and viewing of Twitter/X feeds among friends.  
Built with a **Flask-based backend** and a **Chrome extension frontend**, VisionX combines enterprise-level security with seamless user experience.  

---

## Features  

### Authentication & Security  
- JWT-based authentication with bcrypt password hashing  
- Secure cookie extraction and storage  
- Input validation, SQL injection protection, and rate limiting  
- Encrypted transmission of sensitive data  

### Feed Sharing & Social Features  
- Share your X timeline with selected friends  
- View feeds shared by your friends directly in your timeline  
- Granular access control with instant revocation  
- Track who has access to your feed and whose feeds you can access  

### Tweet Operations  
- Asynchronous tweet fetching with media support  
- Real-time injection of friend’s tweets into your timeline  
- 1-hour caching system for performance optimization  
- Restore original timeline view anytime  

### System & Performance  
- PostgreSQL with connection pooling  
- Async tweet fetching with `asyncio` + thread pool  
- Automatic expired data cleanup  
- Comprehensive logging with rotation  
- Graceful error handling and recovery  

---

## 🛠 Tech Stack  

- **Frontend**: Chrome Extension (Manifest V3, content scripts, service worker)  
- **Backend**: Flask (Python), asyncio, ThreadPoolExecutor  
- **Database**: PostgreSQL (psycopg3 + connection pooling)  
- **Authentication**: JWT tokens, bcrypt password hashing  
- **Twitter API**: [twikit](https://pypi.org/project/twikit/)  
- **Security**: CORS, input sanitization, encrypted cookie management  

---

## Project Structure

```plaintext
project-folder/
├── frontend/
│   ├── background.js
│   ├── content.js
│   ├── icon.png
│   ├── manifest.json
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js
├── backend/
│   ├── server.py 
│   ├── requirements.txt
└── README.md
```

---

## Installation

### Backend Setup

**Prerequisites**
- Python 3.8+  
- PostgreSQL 12+  
- X.com account cookies  

**Local Development**
```bash
git clone https://github.com/<your-username>/VisionX.git
cd VisionX/backend
pip install -r requirements.txt
python server.py
```

**Environment Variables**
DATABASE_URL=postgresql://user:password@localhost:5432/visionx
SECRET_KEY=your_jwt_secret
PORT=5000


**Render.com Deployment (Recommended)**
- Connect GitHub repo to Render  
- Add environment variables  
- Enable auto-deploy  

### Chrome Extension Setup
- Clone repo and go to `extension/`  
- Open Chrome → chrome://extensions/  
- Enable Developer Mode  
- Click **Load unpacked** → select `extension/` folder  
- Update API URL in settings (local or deployed backend)  

---

## API Endpoints

### Authentication
- `POST /api/register` – Register new user  
- `POST /api/login` – User login  
- `POST /api/logout` – User logout  
- `GET /api/verify` – Verify JWT token  

### User Management
- `GET /api/user/profile` – Get profile  
- `DELETE /api/user/delete` – Delete account  

### Feed Sharing
- `POST /api/share-feed` – Share feed  
- `GET /api/shared-users` – Get users you’ve shared with  
- `GET /api/fetch-users` – Get users who shared with you  
- `DELETE /api/unshare-feed/<username>` – Revoke access  

### Tweet Operations
- `POST /api/save-cookies` – Save cookies  
- `POST /api/fetch-feed/<username>` – Fetch shared feed  

### System
- `GET /health` – Health check  
- `POST /api/cleanup-expired-tweets` – Cleanup cache  

---

## Usage

1. Register/Login in the Chrome extension  
2. Fetch Cookies while logged into X.com  
3. Share Feed with friends by username  
4. View Shared Feeds directly in your timeline  
5. Restore Feed anytime to return to your original view  

---

## Security & Privacy

- Passwords stored with bcrypt hashing + salt  
- Encrypted cookie storage & transmission  
- Tokens expire automatically for safety  
- Tweets cached only temporarily (not stored permanently)  
- Full compliance with secure coding practices  

---

## Database Schema

```sql
-- Users
users (id, username, password_hash, email, created_at, last_login, is_active)

-- Feed sharing
feed_shares (owner_id, shared_with_id, created_at)
feed_fetches (user_id, fetch_from_id, created_at)

-- Cookie storage
user_cookies (user_id, cookies, updated_at)

-- Tweet caching
user_tweets (user_id, fetched_from_id, tweets_data, fetched_at, expires_at)
```

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m "Add feature"`)  
4. Push (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  

---

## License

This project is licensed under the MIT License – see the [LICENSE](License) file.

---

## Disclaimer

This tool is for educational purposes only. Ensure compliance with Twitter/X Terms of Service and local laws before use.

---

✨ With VisionX, securely share and explore Twitter feeds with friends — all within your own timeline.



