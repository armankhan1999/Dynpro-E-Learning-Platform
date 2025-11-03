"""
Manual migration script to update discussions schema

Run this script to update the discussions tables schema
"""

from sqlalchemy import text
from app.db.session import engine

def run_migration():
    """Execute the migration."""
    with engine.begin() as conn:
        print("Starting discussions schema migration...")

        # Update discussions table
        print("Updating discussions table...")

        # Rename author_id to user_id if it exists
        try:
            conn.execute(text("""
                ALTER TABLE discussions
                RENAME COLUMN author_id TO user_id;
            """))
            print("✓ Renamed author_id to user_id")
        except Exception as e:
            print(f"  Note: author_id may already be renamed or doesn't exist: {e}")

        # Add missing columns to discussions
        columns_to_add = [
            ("category", "VARCHAR(100)"),
            ("is_resolved", "BOOLEAN DEFAULT FALSE"),
            ("upvotes_count", "INTEGER DEFAULT 0"),
            ("replies_count", "INTEGER DEFAULT 0"),
        ]

        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"""
                    ALTER TABLE discussions
                    ADD COLUMN IF NOT EXISTS {col_name} {col_type};
                """))
                print(f"✓ Added column {col_name}")
            except Exception as e:
                print(f"  Note: Column {col_name} may already exist: {e}")

        # Make course_id nullable
        try:
            conn.execute(text("""
                ALTER TABLE discussions
                ALTER COLUMN course_id DROP NOT NULL;
            """))
            print("✓ Made course_id nullable")
        except Exception as e:
            print(f"  Note: course_id may already be nullable: {e}")

        # Update discussion_replies table
        print("\nUpdating discussion_replies table...")

        # Rename author_id to user_id if it exists
        try:
            conn.execute(text("""
                ALTER TABLE discussion_replies
                RENAME COLUMN author_id TO user_id;
            """))
            print("✓ Renamed author_id to user_id in replies")
        except Exception as e:
            print(f"  Note: author_id may already be renamed: {e}")

        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
