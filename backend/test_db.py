from sqlalchemy import create_engine

try:
    engine = create_engine('postgresql://eduuser:edupass@localhost:5432/edudb')
    conn = engine.connect()
    print('✅ Database connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
