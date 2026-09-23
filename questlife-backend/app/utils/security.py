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

    def decode_clerk_token(token: str) -> dict:
        """
        Securely verifies and decodes a Clerk JWT token using RS256 signature verification.
        Requires CLERK_PEM_PUBLIC_KEY, CLERK_JWKS_URL, or CLERK_ISSUER to be configured.
        Unverified token fallbacks are strictly prohibited.
        """
        if settings.CLERK_PEM_PUBLIC_KEY:
            try:
                payload = jwt.decode(
                    token,
                    settings.CLERK_PEM_PUBLIC_KEY,
                    algorithms=["RS256"],
                    issuer=settings.CLERK_ISSUER or None,
                    options={"verify_aud": False},
                )
                return payload
            except PyJWTError as e:
                raise ValueError(f"Invalid Clerk token: {e}")

        jwks_url = settings.CLERK_JWKS_URL
        if not jwks_url and settings.CLERK_ISSUER:
            jwks_url = f"{settings.CLERK_ISSUER.rstrip('/')}/.well-known/jwks.json"

        if jwks_url:
            try:
                jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    issuer=settings.CLERK_ISSUER or None,
                    options={"verify_aud": False},
                )
                return payload
            except PyJWTError as e:
                raise ValueError(f"Invalid Clerk token: {e}")
            except Exception as e:
                raise ValueError(f"Failed to verify Clerk token via JWKS: {e}")

        raise ValueError("Clerk verification disabled: missing CLERK_PEM_PUBLIC_KEY, CLERK_JWKS_URL, or CLERK_ISSUER.")

except ImportError as err:
    raise RuntimeError(
        "Critical Security Error: 'PyJWT' package is required for secure JWT token signing. "
        "Unsigned token fallbacks are strictly prohibited."
    ) from err
