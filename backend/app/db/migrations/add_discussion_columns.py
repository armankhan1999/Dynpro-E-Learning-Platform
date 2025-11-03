"""
Migration script to add missing columns to discussions table
"""

from sqlalchemy import text
from app.db.session import engine

def run_migration():
    """Execute the migration to add missing columns."""
    print("Starting migration to add missing columns to discussions table...")

    with engine.begin() as conn:
        # Check if columns exist and add them if they don't
        migrations = [
            {
                "name": "category",
                "sql": "ALTER TABLE discussions ADD COLUMN category VARCHAR(100);"
            },
            {
                "name": "is_resolved",
                "sql": "ALTER TABLE discussions ADD COLUMN is_resolved BOOLEAN DEFAULT FALSE;"
            },
            {
                "name": "upvotes_count",
                "sql": "ALTER TABLE discussions ADD COLUMN upvotes_count INTEGER DEFAULT 0;"
            },
            {
                "name": "replies_count",
                "sql": "ALTER TABLE discussions ADD COLUMN replies_count INTEGER DEFAULT 0;"
            },
            {
                "name": "user_id (rename from author_id)",
                "sql": "ALTER TABLE discussions RENAME COLUMN author_id TO user_id;"
            },
            {
                "name": "user_id in replies (rename from author_id)",
                "sql": "ALTER TABLE discussion_replies RENAME COLUMN author_id TO user_id;"
            },
            {
                "name": "course_id nullable",
                "sql": "ALTER TABLE discussions ALTER COLUMN course_id DROP NOT NULL;"
            },
            {
                "name": "module_id nullable",
                "sql": "ALTER TABLE discussions ALTER COLUMN module_id DROP NOT NULL;"
            }
        ]

        for migration in migrations:
            try:
                print(f"Applying: {migration['name']}...")
                conn.execute(text(migration['sql']))
                print(f"  Success: {migration['name']}")
            except Exception as e:
                error_message = str(e)
                if "already exists" in error_message or "does not exist" in error_message or "cannot be cast" in error_message:
                    print(f"  Skipped: {migration['name']} (already done or not needed)")
                else:
                    print(f"  Error: {migration['name']} - {error_message}")

        print("\nMigration completed!")

if __name__ == "__main__":
    run_migration()
