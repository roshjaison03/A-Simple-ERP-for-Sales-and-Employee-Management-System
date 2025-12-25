from flask import Flask, jsonify,request
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
# import request

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )

@app.route('/api/sales', methods=['GET'])
def get_sales():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, client_name FROM sales')
    sales = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(sales)

@app.route('/api/clientdata', methods=['GET'])
@app.route('/api/clientdata/<int:client_id>', methods=['GET'])
def get_sales_data(client_id=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if client_id is not None:
            query = """
            SELECT client_name, address, email, phone_no, joined_date,gst_no,company_type
            FROM sales
            WHERE id = %s;
            """
            cursor.execute(query, (client_id,))
            result = cursor.fetchone()

            if result:
                return jsonify(result)
            else:
                return jsonify({'message': f'No client found with id {client_id}'}), 404

        # No client_id provided: return all records
        query = """
        SELECT client_name, address, email, phone_no, joined_date,gst_no,company_type
        FROM sales;
        """
        cursor.execute(query)
        results = cursor.fetchall()
        return jsonify(results)

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/add-client', methods=['POST'])
def add_client():
    try:
        data = request.get_json()

        client_name = data.get('client_name')
        address = data.get('address')
        email = data.get('email')
        phone_no = data.get('phone_no')
        joined_date = data.get('joined_date')  # Format: 'YYYY-MM-DD'
        company_type = data.get('company_type')
        gst_no = data.get('gst_no')

        # Basic validation
        if not all([client_name, address, email, phone_no, joined_date,company_type,gst_no]):
            return jsonify({'error': 'All fields except created_at are required.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO sales (client_name, address, email, phone_no, joined_date,company_type,gst_no)
        VALUES (%s, %s, %s, %s, %s,%s,%s);
        """
        cursor.execute(insert_query, (client_name,address, email, phone_no, joined_date,company_type,gst_no))
        conn.commit()

        return jsonify({'message': 'Client added successfully!', 'inserted_id': cursor.lastrowid}), 201

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/clientbills/<int:client_id>', methods=['GET'])
def get_total_bills_by_client_id(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Total bills and total amount
        query_total = """
        SELECT 
            COUNT(*) AS total_bills,
            COALESCE(SUM(total_amount), 0) AS total_amount
        FROM bills
        WHERE sales_id = %s;
        """
        cursor.execute(query_total, (client_id,))
        result = cursor.fetchone()

        total_bills = result['total_bills']
        total_amount = result['total_amount']

        # Count of unpaid bills
        query_unpaid = """
        SELECT 
            COUNT(*) AS unpaid_count
        FROM bills
        WHERE sales_id = %s AND payment_status = 'unpaid';
        """
        cursor.execute(query_unpaid, (client_id,))
        unpaid_result = cursor.fetchone()
        unpaid_count = unpaid_result['unpaid_count']

        return jsonify({
            "total_bills": total_bills,
            "total_amount": float(total_amount),
            "unpaid_bills": unpaid_count
        })

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()


        
@app.route('/api/delete-client/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if client exists
        cursor.execute("SELECT * FROM sales WHERE id = %s", (client_id,))
        client = cursor.fetchone()
        if not client:
            return jsonify({'error': f'No client found with ID {client_id}'}), 404

        # Delete the client
        cursor.execute("DELETE FROM sales WHERE id = %s", (client_id,))
        conn.commit()

        return jsonify({'message': f'Client with ID {client_id} deleted successfully'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/bills', methods=['GET'])
def get_bills():
    sales_id = request.args.get('sales_id', type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if sales_id is not None:
        cursor.execute('''
            SELECT 
                id, 
                bill_no, 
                job_name, 
                total_amount, 
                payment_status, 
                date_billed, 
                sales_id 
            FROM bills
            WHERE sales_id = %s
        ''', (sales_id,))
    else:
        cursor.execute('''
            SELECT 
                id, 
                bill_no, 
                job_name, 
                total_amount, 
                payment_status, 
                date_billed, 
                sales_id 
            FROM bills
        ''')

    bills = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(bills)

@app.route('/api/employees', methods=['GET'])
def get_employees():
    emp_id = request.args.get('id', type=int)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if emp_id:
        cursor.execute("SELECT id,Fullname FROM employee_data WHERE id = %s", (emp_id,))
        employee = cursor.fetchone()
        cursor.close()
        conn.close()

        if employee:
            return jsonify(employee)
        else:
            return jsonify({"error": "Employee not found"}), 404
    else:
        cursor.execute("SELECT id,Fullname FROM employee_data")
        employees = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(employees)


@app.route('/api/attendance_save', methods=['POST'])
def save_attendance():
    data = request.get_json()

    employee = data.get('employee')
    date = data.get('date')              # e.g. "15-07-2025"
    status = data.get('status')
    working_hours = data.get('workingHours')
    notes = data.get('notes', '')
    employee_id = data.get('employee_id')

    print(employee,date,status,working_hours,notes,employee_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO attendance (
                employee,
                date,
                status,
                workingHours,
                notes,
                employee_id
            ) VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            employee,
            date,
            status,
            working_hours,
            notes,
            employee_id
        ))

        conn.commit()
        return jsonify({"message": "Attendance record saved successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/employee_attendance', methods=['GET'])
def get_employees_attendance():
    emp_id = request.args.get('id')  # Note: string match with employeeId

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if emp_id:
            cursor.execute("SELECT * FROM attendance WHERE employee_Id = %s", (emp_id,))
            employees = cursor.fetchall()
        else:
            cursor.execute("SELECT * FROM attendance")
            employees = cursor.fetchall()

        return jsonify(employees if employees else {"message": "No records found"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/add-bill/', methods=['POST'])
def add_bill():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        data = request.get_json()
        bill_no = data.get('bill_no')
        job_name = data.get('job_name')
        total_amount = data.get('total_amount')
        payment_status = data.get('payment_status')
        date_billed = data.get('date_billed')
        sales_id = data.get('sales_id')
        if not all([bill_no, job_name, total_amount, payment_status, date_billed, sales_id]):
            return jsonify({'error': 'All fields are required.'}), 400

        insert_query = '''
        INSERT INTO bills (bill_no, job_name, total_amount, payment_status, date_billed, sales_id)
        VALUES (%s, %s, %s, %s, %s, %s);
        '''
        cursor.execute(insert_query, (bill_no, job_name, total_amount, payment_status, date_billed, sales_id))
        conn.commit()
        return jsonify({'message': 'Bill added successfully!', 'inserted_id': cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/clients/<int:client_id>/edit', methods=['PUT'])
def edit_client_info(client_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        data = request.get_json()

        # Fields allowed to update
        editable_fields = {
            "client_name": "client_name",
            "address": "address",
            "email": "email",
            "phone": "phone",
            "gst_no": "gst_no",
            "company_type": "company_type",
            "joined": "joined"  # Must be in 'YYYY-MM-DD' format
        }

        updates = []
        values = []

        for field, column in editable_fields.items():
            if field in data:
                updates.append(f"{column} = %s")
                values.append(data[field])

        if not updates:
            return jsonify({"error": "No editable fields provided."}), 400

        values.append(client_id)

        query = f"UPDATE sales SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": "Client information updated successfully."}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/api/bills/<int:bill_id>/payment-status', methods=['PUT'])
def update_bill_payment_status(bill_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        data = request.get_json()
        status = data.get("payment_status")

        if not status:
            return jsonify({"error": "Missing 'payment_status' in request body."}), 400

        # Step 1: Check if bill exists
        check_query = "SELECT bill_no FROM bills WHERE bill_no = %s"
        cursor.execute(check_query, (bill_id,))
        bill = cursor.fetchone()

        if not bill:
            return jsonify({"error": f"No bill found with ID {bill_id}."}), 404

        # Step 2: Update payment status
        update_query = "UPDATE bills SET payment_status = %s WHERE bill_no = %s"
        cursor.execute(update_query, (status, bill_id))
        conn.commit()

        return jsonify({"message": f"Payment status updated to '{status}' for bill ID {bill_id}."}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.route('/api/delete-bill/<int:bill_id>', methods=['DELETE'])
def delete_bill(bill_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM bills WHERE id = %s', (bill_id,))
        bill = cursor.fetchone()
        if not bill:
            return jsonify({'error': f'No bill found with ID {bill_id}'}), 404
        cursor.execute('DELETE FROM bills WHERE id = %s', (bill_id,))
        conn.commit()
        return jsonify({'message': f'Bill with ID {bill_id} deleted successfully'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8001)
