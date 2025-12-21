import os
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv, find_dotenv
from supabase import Client, create_client

# Ensure we load the project-level env file(s) even if the process starts inside backend/.
env_paths = [
    find_dotenv(filename=".env", raise_error_if_not_found=False),
    find_dotenv(filename="env.local", raise_error_if_not_found=False),
]
for path in env_paths:
    if path:
        load_dotenv(path, override=False)


class MissingSupabaseConfig(RuntimeError):
    """Raised when the .env file is missing required keys."""


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise MissingSupabaseConfig(
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment "
            "(see showroom-supabase-react/env.example)."
        )

    return create_client(url, key)


def get_backend_port() -> int:
    port_value: Optional[str] = os.environ.get("BACKEND_PORT", "5050")
    try:
        return int(port_value)
    except ValueError as exc:
        raise RuntimeError("BACKEND_PORT must be an integer") from exc

