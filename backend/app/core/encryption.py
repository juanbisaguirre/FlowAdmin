import base64
from cryptography.fernet import Fernet
from app.core.config import settings

# In a real production environment, this key should be loaded from env and kept secret!
# For MVP we'll use a derived key from the secret key
def _get_fernet() -> Fernet:
    # Ensure key is 32 url-safe base64-encoded bytes
    # Pad or truncate the secret key to 32 bytes
    key_bytes = settings.SECRET_KEY.encode('utf-8')
    padded_key = key_bytes.ljust(32, b'0')[:32]
    fernet_key = base64.urlsafe_b64encode(padded_key)
    return Fernet(fernet_key)

def encrypt(text: str) -> str:
    if not text:
        return text
    f = _get_fernet()
    return f.encrypt(text.encode('utf-8')).decode('utf-8')

def decrypt(encrypted_text: str) -> str:
    if not encrypted_text:
        return encrypted_text
    f = _get_fernet()
    return f.decrypt(encrypted_text.encode('utf-8')).decode('utf-8')
