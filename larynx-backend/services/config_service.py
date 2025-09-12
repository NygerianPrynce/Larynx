"""
Centralized configuration management
Eliminates scattered environment variable access
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ConfigService:
    """Centralized configuration management"""
    
    # Database Configuration
    @staticmethod
    def get_supabase_url() -> str:
        return os.getenv("SUPABASE_URL", "")
    
    @staticmethod
    def get_supabase_key() -> str:
        return os.getenv("SUPABASE_KEY", "")
    
    @staticmethod
    def get_supabase_anon_key() -> str:
        return os.getenv("SUPABASE_ANON_KEY", "")
    
    # Google OAuth Configuration
    @staticmethod
    def get_google_client_id() -> str:
        return os.getenv("GOOGLE_CLIENT_ID", "")
    
    @staticmethod
    def get_google_client_secret() -> str:
        return os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    @staticmethod
    def get_google_redirect_uri() -> str:
        return os.getenv("GOOGLE_REDIRECT_URI", "")
    
    # OpenAI Configuration
    @staticmethod
    def get_openai_api_key() -> str:
        return os.getenv("OPENAI_API_KEY", "")
    
    # Application Configuration
    @staticmethod
    def get_secret_key() -> str:
        return os.getenv("SECRET_KEY", "")
    
    @staticmethod
    def get_frontend_url() -> str:
        return os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    @staticmethod
    def get_api_url() -> str:
        return os.getenv("VITE_API_URL", "http://localhost:8000")
    
    # Validation
    @staticmethod
    def validate_required_config() -> list[str]:
        """
        Validate that all required configuration is present
        Returns list of missing configuration keys
        """
        required_configs = [
            ("SUPABASE_URL", ConfigService.get_supabase_url()),
            ("SUPABASE_KEY", ConfigService.get_supabase_key()),
            ("GOOGLE_CLIENT_ID", ConfigService.get_google_client_id()),
            ("GOOGLE_CLIENT_SECRET", ConfigService.get_google_client_secret()),
            ("OPENAI_API_KEY", ConfigService.get_openai_api_key()),
            ("SECRET_KEY", ConfigService.get_secret_key()),
        ]
        
        missing = []
        for key, value in required_configs:
            if not value:
                missing.append(key)
        
        return missing
