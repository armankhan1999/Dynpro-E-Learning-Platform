"""Add category text field to courses

Revision ID: cc234567890b
Revises: bb123456789a
Create Date: 2025-11-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc234567890b'
down_revision: Union[str, None] = 'bb123456789a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add category text column to courses table
    op.add_column('courses', sa.Column('category', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Remove category column
    op.drop_column('courses', 'category')
