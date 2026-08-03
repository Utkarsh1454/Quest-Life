from datetime import datetime, timedelta, timezone
import logging
import os
import hashlib
import hmac

from app.config import settings

logger = logging.getLogger(__name__)

# Password Hashing using Argon2 or Salted PBKDF2-HMAC-SHA256
try:
    from pwdlib import PasswordHash
    from pwdlib.hashers.argon2 import Argon2Hasher
    _pwd_hash = PasswordHash((Argon2Hasher(),))

    def hash_password(password: str) -> str:
        return _pwd_hash.hash(password)

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return _pwd_hash.verify(plain_password, hashed_password)

except ImportError:
    try:
        from argon2 import PasswordHasher
        from argon2.exceptions import VerifyMismatchError
        _ph = PasswordHasher()

        def hash_password(password: str) -> str:
            return _ph.hash(password)

        def verify_password(plain_password: str, hashed_password: str) -> bool:
            try:
                return _ph.verify(hashed_password, plain_password)
            except VerifyMismatchError:
                return False
            except Exception:
                return False

    except ImportError:
        logger.warning("Neither pwdlib nor argon2-cffi available. Using salted PBKDF2-HMAC-SHA256 for password security.")

        def hash_password(password: str) -> str:
            salt = os.urandom(16)
            key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
            return f"pbkdf2_sha256$100000${salt.hex()}${key.hex()}"

        def verify_password(plain_password: str, hashed_password: str) -> bool:
            try:
                parts = hashed_password.split('$')
                if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
                    return False
                iterations = int(parts[1])
                salt = bytes.fromhex(parts[2])
                expected_key = bytes.fromhex(parts[3])
                computed_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
                return hmac.compare_digest(computed_key, expected_key)
            except Exception:
                return False


# Strict JWT Authentication using PyJWT
try:
    import jwt
    from jwt.exceptions import PyJWTError

    def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def create_refresh_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def decode_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except PyJWTError as e:
            raise ValueError(f"Invalid token: {e}")

except ImportError as err:
    raise RuntimeError(
        "Critical Security Error: 'PyJWT' package is required for secure JWT token signing. "
        "Unsigned token fallbacks are strictly prohibited."
    ) from err
