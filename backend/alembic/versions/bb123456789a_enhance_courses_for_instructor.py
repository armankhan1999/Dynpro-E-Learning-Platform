"""Enhance courses for instructor features

Revision ID: bb123456789a
Revises: aa590a043ce3
Create Date: 2025-11-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bb123456789a'
down_revision: Union[str, None] = 'aa590a043ce3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to courses table
    op.add_column('courses', sa.Column('intro_video_url', sa.String(length=500), nullable=True))
    op.add_column('courses', sa.Column('level', sa.String(length=20), nullable=True, server_default='beginner'))
    op.add_column('courses', sa.Column('language', sa.String(length=50), nullable=True, server_default='English'))
    op.add_column('courses', sa.Column('is_published', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('courses', sa.Column('max_students', sa.Integer(), nullable=True))

    # Make slug nullable (will be auto-generated now)
    op.alter_column('courses', 'slug', nullable=True)


def downgrade() -> None:
    # Remove added columns
    op.drop_column('courses', 'max_students')
    op.drop_column('courses', 'is_published')
    op.drop_column('courses', 'language')
    op.drop_column('courses', 'level')
    op.drop_column('courses', 'intro_video_url')

    # Revert slug to non-nullable
    op.alter_column('courses', 'slug', nullable=False)
