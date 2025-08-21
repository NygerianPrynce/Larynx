# Larynx AI

An AI email assistant that learns your writing style and automates business email responses with contextual intelligence.

**[Watch Demo Video](https://youtu.be/JIBxHBGxJAs)**

## Project Overview

Larynx AI is a sophisticated email automation platform that integrates with Gmail to monitor incoming business communications and generate authentic, personalized responses. The system analyzes user writing patterns to maintain voice consistency while incorporating relevant business context including inventory data and pricing information.

This project addresses a significant pain point for small business owners who spend excessive time crafting repetitive email responses. The solution automates routine communications while preserving the authentic voice and personality that customers expect.

## System Architecture

The platform operates through several integrated components:

1. **Gmail Integration** - Utilizes Google OAuth 2.0 for secure authentication and Gmail API for email access
2. **Style Analysis Engine** - Processes historical email data to extract linguistic patterns and communication preferences
3. **Email Monitoring System** - Implements continuous inbox monitoring with intelligent filtering for business communications
4. **Response Generation** - Leverages OpenAI GPT-4 with custom prompt engineering to create contextually appropriate responses
5. **Draft Management** - Seamlessly integrates generated responses into Gmail's draft system for user review

## Technology Implementation

**Backend Architecture:**
- **FastAPI** - Asynchronous Python framework providing high-performance API endpoints
- **Supabase** - PostgreSQL database with real-time capabilities and built-in authentication
- **OpenAI GPT-4** - Advanced language model for natural response generation
- **Google APIs** - Gmail API integration and OAuth 2.0 authentication flows

**Frontend Development:**
- **React 18** - Component-based architecture with modern hooks patterns
- **Custom CSS** - Responsive design with advanced animations and transitions
- **React Router** - Client-side routing with protected authentication flows

**Data Processing Pipeline:**
- **NLTK** - Natural language processing for linguistic analysis and tokenization
- **Pandas** - Structured data manipulation for inventory and analytics processing
- **Beautiful Soup** - Web content extraction for brand voice analysis
- **FuzzyWuzzy** - Intelligent string matching algorithms for product recognition

## Core Capabilities

**Intelligent Email Processing**
- Automated detection and filtering of genuine business communications versus automated messages
- Advanced content extraction that removes forwarded text and signatures
- Context analysis to identify specific product or service inquiries
- Real-time processing with robust error handling and retry mechanisms

**Linguistic Pattern Analysis**
- Comprehensive analysis of vocabulary patterns, sentence structure, and tone preferences
- Statistical modeling of communication formality and directness levels
- Identification of frequently used phrases and signature expressions
- Behavioral pattern recognition for consistent voice replication

**Business Context Integration**
- Dynamic inventory management with intelligent product matching algorithms
- Automated pricing integration and availability checking
- Brand voice extraction through website content analysis
- Configurable business rules and response guidelines

**Response Generation & Management**
- GPT-4 powered response creation with custom prompt engineering
- Style-consistent draft generation that maintains authentic voice characteristics
- Seamless Gmail integration with proper email threading
- Comprehensive review and editing capabilities before sending

## Technical Challenges Addressed

**Asynchronous Email Monitoring**
Developed a robust monitoring system that handles continuous Gmail polling without overwhelming API rate limits. Implemented exponential backoff strategies and circuit breaker patterns to ensure reliable operation during service disruptions.

**Natural Language Style Transfer**
Created a sophisticated pipeline that extracts quantifiable linguistic features from email communications, then uses these patterns to guide AI response generation. This involved extensive experimentation with prompt engineering and feature extraction methodologies.

**Intelligent Product Recognition**
Built advanced matching algorithms using fuzzy string similarity, token-based comparison, and semantic analysis to accurately identify products despite variations in customer terminology, spelling inconsistencies, and contextual ambiguity.

**Secure OAuth Integration**
Implemented comprehensive Google OAuth 2.0 flows with automatic token refresh, secure session management, and proper scope handling to ensure ongoing access while maintaining user security and privacy.

## Database Architecture & Design

The system employs a normalized relational schema optimized for performance:
- **Users** - Account management with encrypted credential storage
- **Tone Profiles** - Serialized linguistic analysis data with version control
- **Inventory** - Product catalog with advanced search indexing
- **Drafts** - Generated responses with performance tracking and A/B testing capabilities
- **Analytics** - Comprehensive usage metrics and system performance monitoring

## Development Insights

This project provided extensive experience with:
- **API Integration Patterns** - Managing complex OAuth flows and handling third-party service limitations
- **Natural Language Processing** - Implementing statistical analysis of communication patterns
- **Asynchronous System Design** - Building responsive systems that handle concurrent processing
- **User Experience Design** - Creating intuitive interfaces for complex automated workflows
- **Data Security Implementation** - Handling sensitive email content with appropriate encryption and access controls

The most significant technical challenge involved developing reliable style matching algorithms. This required deep analysis of linguistic features and extensive testing to achieve consistent results across different communication styles and business contexts.

## Future Development Roadmap

**Immediate Enhancements**
- Implementation of webhook-based email monitoring for improved efficiency
- Advanced machine learning model fine-tuning for enhanced personalization
- Real-time analytics dashboard with comprehensive performance metrics

**Long-term Objectives**
- Multi-platform email provider support beyond Gmail
- Enterprise-grade team collaboration features
- Mobile application development for iOS and Android
- Integration capabilities with popular CRM and business management systems

## Development Environment

**Requirements:**
- Python 3.8+ with modern async/await support
- Node.js 16+ for frontend development
- PostgreSQL database with Supabase integration
- Valid Google Cloud Platform credentials for Gmail API access
- OpenAI API access for GPT-4 integration

The codebase maintains clear architectural separation between backend API services and frontend presentation layers, facilitating independent development and deployment strategies.

---

Developed as an exploration of AI integration in business automation, demonstrating full-stack development capabilities and advanced system design principles.
