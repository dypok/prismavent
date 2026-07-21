import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY or "your-supabase-anon-key" in SUPABASE_ANON_KEY:
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def get_supabase_client() -> Client:
    """Helper function to get the initialized Supabase client."""
    if supabase is None:
        raise RuntimeError(
            "Supabase client is not configured. Please set SUPABASE_URL and "
            "SUPABASE_ANON_KEY in your .env file."
        )
    return supabase
# cambios para manejo de tokens
def get_supabase_client_for_user(token: str) -> Client:
    """
    Devuelve un cliente de Supabase autenticado con el JWT del usuario,
    necesario para que las políticas RLS puedan resolver auth.uid().
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise RuntimeError(
            "Supabase client is not configured. Please set SUPABASE_URL and "
            "SUPABASE_ANON_KEY in your .env file."
        )
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.postgrest.auth(token)
    return client
