"""add role column

Revision ID: 1b2f3c4d5e6f
Revises: 70923ce915b5
Create Date: 2025-06-17 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1b2f3c4d5e6f'
down_revision = '70923ce915b5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('role', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'role')
