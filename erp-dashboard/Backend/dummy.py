import mysql.connector
from dotenv import load_dotenv
import os


load_dotenv()
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )

conn = get_db_connection()
cursor = conn.cursor()

dummy_sales = [
    ('Spark Engineers', 'THANE', 'spark@macengineers.co.in', '9823456780', '2022-03-10', '27ABJFS6754R1Z3', 'Partnership'),
    ('Haneet Engineering', '23 Murugan Compound,144 Lake Road,Bhandup west,Mumbai', 'haneet@enggcorp.in', '7001234567', '2022-06-01', '06AAACH4567B1Z2', 'Private Ltd'),
    ('Omega Industries', 'Ring Road, Ahmedabad', 'contact@omegaind.com', '9988776655', '2022-07-12', '24AABCO7890J1Z9', 'Proprietorship'),
    ('Retna', 'Infocity, Hyderabad', 'hello@retna.in', '7654321890', '2022-08-20', '36AAACR1234T1Z5', 'LLP'),
    ('SPM DRILLINGS INDIA', 'Drill Zone, Chennai', 'support@spmdrill.com', '8123456701', '2022-09-05', '33AAACS8901R1Z1', 'Private Ltd'),
    ('Gadson Electronics', 'Electro Park, Bhopal', 'sales@gadsonelec.com', '7000070000', '2022-10-15', '23AAACG1234H1Z6', 'LLP'),
    ('V M TRADERS', 'Market Street, Surat', 'vmtraders@gmail.com', '9600001122', '2022-11-08', '24AABTV6789M1Z4', 'Proprietorship'),
    ('INDIAN ENGI-FAB', 'Sector 18, Gurgaon', 'enquiries@iefab.in', '9876512345', '2022-12-01', '06AAACI5678K1Z8', 'Private Ltd'),
    ('INNVOTECH', 'TechSpace, Kolkata', 'innovate@innvotech.io', '8123456789', '2023-01-05', '19AAACI9012L1Z0', 'LLP'),
    ('Bhavani', 'Main Street, Coimbatore', 'bhavani@support.com', '9898989898', '2023-02-17', '33AAACB1234E1Z7', 'Proprietorship'),
    ('IGNIS CUT', 'Sector 88, Chandigarh', 'cut@ignis.com', '9300011122', '2023-03-12', '04AABCI4567T1Z6', 'LLP'),
    ('macine makers', 'Plot 12, Nashik MIDC', 'hello@macinemakers.com', '8080808080', '2023-04-09', '27AACCM2345H1Z3', 'Partnership')
]



cursor.executemany(
    'INSERT INTO sales (client_name, address,email, phone_no,joined_date,gst_no,company_type) VALUES (%s, %s, %s, %s, %s,%s,%s)',
    dummy_sales
)

conn.commit()
cursor.close()
conn.close()
print("Dummy data inserted!")
