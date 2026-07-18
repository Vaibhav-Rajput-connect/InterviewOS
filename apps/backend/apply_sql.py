import psycopg2
import os

def main():
    db_url = "postgresql://neondb_owner:npg_CIMUGT2RoW9g@ep-red-sun-avkjhc1e.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    with open("schema.sql") as f:
        sql = f.read()
        
    print("Connecting to Neon...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Executing schema SQL...")
    for statement in sql.split(';'):
        statement = statement.strip()
        if not statement:
            continue
        try:
            cursor.execute(statement)
        except psycopg2.errors.DuplicateTable:
            pass
        except psycopg2.errors.DuplicateObject:
            pass
        except Exception as e:
            print(f"Error on: {statement[:50]}... -> {e}")
            
    print("Done!")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
