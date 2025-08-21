# Larynx AI 📧

> AI-powered email assistant that learns your communication style and automates personalized responses

## Overview

Larynx AI is an intelligent email automation platform that integrates with Gmail to provide personalized email drafting capabilities. The system analyzes your writing patterns, understands your business context, and generates authentic responses that match your communication style.

## 🌟 Key Features

### Intelligent Email Analysis
- **Writing Style Learning**: Analyzes your sent emails to understand tone, vocabulary, and communication patterns
- **Automated Email Monitoring**: Continuously watches Gmail inbox for new business inquiries
- **Smart Bot Detection**: Filters out automated emails and focuses on genuine customer communications

### Business Intelligence Integration
- **Inventory Management**: Maintains product/service catalog with pricing
- **Smart Product Matching**: Automatically identifies relevant inventory items in customer inquiries
- **Brand Context Awareness**: Learns your business profile through website analysis or manual input

### Personalized Response Generation
- **Style-Matched Drafts**: Generates emails that sound authentically like you
- **Context-Aware Responses**: Incorporates inventory data, pricing, and business rules
- **Signature Integration**: Maintains consistent professional signatures

### Analytics & Insights
- **Performance Tracking**: Monitors email response patterns and time savings
- **Activity Analytics**: Tracks drafts generated, inventory updates, and system usage
- **Communication Patterns**: Analyzes your email effectiveness and response trends

## 🛠 Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Supabase**: PostgreSQL database with real-time capabilities
- **OpenAI GPT-4**: Advanced language model for email generation
- **Google Gmail API**: Email integration and monitoring
- **Google OAuth 2.0**: Secure authentication and authorization

### Frontend
- **React**: Modern component-based UI library
- **React Router**: Client-side routing
- **Vanilla CSS**: Custom styling with animations and responsive design

### Key Libraries & Tools
- **Talon**: Email content cleaning and signature extraction
- **NLTK**: Natural language processing for writing style analysis
- **Beautiful Soup**: Web scraping for brand context extraction
- **Pandas**: Data processing for inventory management
- **FuzzyWuzzy**: Intelligent product matching algorithms

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Gmail account with API access
- Supabase account
- OpenAI API key

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/larynx-ai.git
   cd larynx-ai
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Create a `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SECRET_KEY=your_session_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations (SQL files provided in /database)
   # Set up tables: users, tokens, inventory, drafts, analytics, tone_profiles, filtered_emails
   ```

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗 Architecture

### System Flow
1. **User Onboarding**: Google OAuth → Email analysis → Brand profiling → Inventory setup
2. **Email Monitoring**: Continuous Gmail monitoring → Bot detection → Customer inquiry identification
3. **Response Generation**: Context gathering → Style matching → Draft creation → Gmail integration
4. **Analytics Tracking**: Performance monitoring → Usage analytics → Improvement insights

### Key Components

#### Email Processing Pipeline
```
Incoming Email → Bot Detection → Content Cleaning → Style Analysis → 
Inventory Matching → Draft Generation → Gmail Draft Creation
```

#### Authentication Flow
```
Google OAuth → Token Management → Session Handling → API Authorization
```

#### Data Architecture
- **Users**: Account management and preferences
- **Tone Profiles**: Writing style analysis and patterns
- **Inventory**: Product/service catalog with pricing
- **Drafts**: Generated responses and performance tracking
- **Analytics**: Usage metrics and insights

## 🎯 Usage

### Initial Setup
1. **Sign Up**: Authenticate with Google account
2. **Business Profile**: Enter brand information or provide website URL for analysis
3. **Style Learning**: Allow email analysis or use default professional tone
4. **Inventory Setup**: Add products/services with pricing
5. **Enable Monitoring**: Activate automated email watching

### Daily Operation
1. **Automatic Monitoring**: System watches for new emails
2. **Smart Filtering**: Bot detection filters out automated messages
3. **Draft Generation**: AI creates personalized responses
4. **Review & Send**: Check drafts in Gmail and send when ready

### Management
- **Settings**: Update brand information, signature, and preferences
- **Inventory**: Manage product catalog and pricing
- **Analytics**: Track performance and time savings

## 🔧 Configuration

### Email Monitoring
- Configurable check intervals (default: 5 minutes)
- Customizable bot detection rules
- Flexible customer classification

### Response Generation
- Adjustable tone and style parameters
- Custom business rules and instructions
- Inventory integration settings

### Security
- Encrypted data storage
- Secure token management
- User privacy controls

## 📊 API Endpoints

### Authentication
- `GET /auth` - Google OAuth initialization
- `GET /auth/callback` - OAuth callback handling
- `POST /logout` - Session termination

### Email Management
- `GET /crawl-emails` - Analyze user's email style
- `POST /start-monitoring` - Enable email monitoring
- `POST /stop-monitoring` - Disable email monitoring
- `GET /recent-drafts` - Retrieve generated drafts

### Inventory
- `GET /inventory` - Retrieve inventory items
- `POST /inventory/add` - Add new inventory item
- `POST /inventory/bulk-upload` - CSV/Excel bulk import
- `PUT /inventory/edit/{id}` - Update inventory item

### Analytics
- `GET /analytics` - Performance metrics
- `GET /monitoring-status` - System status

## 🧪 Testing

### Backend Tests
```bash
pytest tests/
```

### Frontend Tests
```bash
npm run test
```

### Integration Tests
```bash
# Test email monitoring pipeline
python tests/test_email_processing.py

# Test draft generation
python tests/test_draft_creation.py
```

## 🚀 Deployment

### Backend Deployment
1. Configure production environment variables
2. Set up Supabase production database
3. Deploy to cloud provider (Railway, Heroku, etc.)
4. Configure domain and SSL certificates

### Frontend Deployment
1. Build production assets: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables for production API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email fadhillawal06@gmail.com or create an issue in the GitHub repository.

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Basic email monitoring and draft generation
- ✅ Inventory integration
- ✅ Style learning and matching

### Phase 2 (Planned)
- 📧 Advanced email templates
- 🤖 Improved AI models
- 📊 Enhanced analytics dashboard
- 🔗 CRM integrations

### Phase 3 (Future)
- 📱 Mobile applications
- 🌐 Multi-language support
- 🔄 Workflow automation
- 🎯 Advanced personalization

## 💡 Technical Highlights

- **Real-time Processing**: Efficient email monitoring with minimal latency
- **Scalable Architecture**: Designed for growth with modular components
- **Privacy-First**: Secure handling of sensitive email data
- **Intelligent Matching**: Advanced algorithms for product/service recognition
- **Style Preservation**: Maintains authentic communication voice

---

**Built with ❤️ for small businesses seeking intelligent email automation**
