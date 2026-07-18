import time
from functools import wraps
from typing import Any, Callable

def async_ttl_cache(ttl: int = 300) -> Callable:
    """
    A simple in-memory TTL cache for async FastAPI endpoints.
    Uses current_user.id (from kwargs) as part of the cache key if available.
    """
    cache = {}

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Try to extract user_id to isolate cache per user
            user_id = None
            if "current_user" in kwargs:
                user_id = str(kwargs["current_user"].id)
            
            # Simple key: function name + user_id
            key = f"{func.__name__}_{user_id}"
            
            if key in cache:
                value, exp = cache[key]
                if time.time() < exp:
                    return value
                    
            # Compute, cache, and return
            result = await func(*args, **kwargs)
            cache[key] = (result, time.time() + ttl)
            return result
            
        return wrapper
    return decorator


class AsyncCache:
    """Simple in-memory TTL cache for async functions (ephemeral Redis alternative)."""
    def __init__(self, ttl_seconds: int = 3600):
        self.cache = {}
        self.ttl = ttl_seconds

# Global instances for RAG lookups
rag_cache = AsyncCache(ttl_seconds=3600)
