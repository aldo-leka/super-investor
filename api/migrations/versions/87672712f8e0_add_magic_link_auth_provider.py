"""add magic link auth provider

Revision ID: 87672712f8e0
Revises: 623445334d72
Create Date: 2025-03-30 14:31:30.623607

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import Enum


# revision identifiers, used by Alembic.
revision: str = '87672712f8e0'
down_revision: Union[str, None] = '623445334d72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create a temporary table
    op.execute("CREATE TYPE auth_provider_new AS ENUM ('EMAIL', 'GOOGLE', 'MAGIC_LINK')")
    
    # Update existing enum type
    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN auth_provider TYPE auth_provider_new 
        USING auth_provider::text::auth_provider_new
    """)
    
    # Drop old enum type
    op.execute("DROP TYPE IF EXISTS auth_provider")
    
    # Rename new enum type to the original name
    op.execute("ALTER TYPE auth_provider_new RENAME TO auth_provider")


def downgrade() -> None:
    """Downgrade schema."""
    # Create a temporary table
    op.execute("CREATE TYPE auth_provider_old AS ENUM ('EMAIL', 'GOOGLE')")
    
    # Update existing enum type
    op.execute("""
        ALTER TABLE users 
        ALTER COLUMN auth_provider TYPE auth_provider_old 
        USING (
            CASE 
                WHEN auth_provider = 'MAGIC_LINK' THEN 'EMAIL'
                ELSE auth_provider::text
            END
        )::auth_provider_old
    """)
    
    # Drop new enum type
    op.execute("DROP TYPE IF EXISTS auth_provider")
    
    # Rename old enum type to the original name
    op.execute("ALTER TYPE auth_provider_old RENAME TO auth_provider")
