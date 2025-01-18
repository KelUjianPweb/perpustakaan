from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Konfigurasi database MySQL
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'library_db'
}

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not all(k in data for k in ('nama', 'email', 'alamat', 'tel', 'password')):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Hash password sebelum disimpan
        hashed_password = generate_password_hash(data['password'], method='sha256')

        query = """
            INSERT INTO users (name, email, address, phone, password)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (data['nama'], data['email'], data['alamat'], data['tel'], hashed_password))
        connection.commit()

        return jsonify({"message": "Signup successful!"}), 201
    except mysql.connector.Error as err:
        print("Database error:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not all(k in data for k in ('email', 'password')):
        return jsonify({"error": "Missing email or password"}), 400
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Periksa email di database
        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (data['email'],))
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], data['password']):
            return jsonify({"message": "Login successful!", "name": user['name']}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except mysql.connector.Error as err:
        print("Database error:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# Endpoint untuk menyimpan data peminjaman
@app.route('/borrow', methods=['POST'])
def borrow_books():
    data = request.json
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Query untuk menyimpan data ke tabel `borrowers`
        query_borrower = """
            INSERT INTO borrowers (name, email, address, phone, borrow_date, return_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        borrow_date = datetime.now()
        return_date = borrow_date + timedelta(days=7)

        cursor.execute(query_borrower, (
            data['name'],
            data['email'],
            data['address'],
            data['phone'],
            borrow_date.strftime('%Y-%m-%d'),
            return_date.strftime('%Y-%m-%d'),
        ))
        borrower_id = cursor.lastrowid  # Mendapatkan ID peminjam yang baru saja dimasukkan

        # Query untuk menyimpan data ke tabel `borrowed_books`
        query_books = """
            INSERT INTO borrowed_books (borrower_id, book_id, title, author)
            VALUES (%s, %s, %s, %s)
        """
        for book in data['books']:  # Iterasi setiap buku yang dipinjam
            cursor.execute(query_books, (
                borrower_id,
                book['id'],
                book['title'],
                book['author']
            ))

        connection.commit()
        return jsonify({"message": "Buku berhasil dipinjam!"}), 200
    
    except mysql.connector.Error as err:
        print("Database error:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/borrowed-books', methods=['GET'])
def get_borrowed_books():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Query untuk mengambil data peminjam dan buku yang dipinjam
        query = """
            SELECT b.id AS borrower_id, b.name, b.email, b.address, b.phone,
                   b.borrow_date, b.return_date, bb.book_id, bb.title, bb.author
            FROM borrowers b
            JOIN borrowed_books bb ON b.id = bb.borrower_id
            ORDER BY b.borrow_date DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()

        print("Data buku yang dipinjam dari database:", results)

        return jsonify(results), 200
    except mysql.connector.Error as err:
        print("Database error:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/return-book', methods=['POST'])
def return_book():
    data = request.json
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Hapus buku dari tabel `borrowed_books`
        delete_borrowed_query = """
            DELETE FROM borrowed_books
            WHERE book_id = %s AND borrower_id = %s
        """
        cursor.execute(delete_borrowed_query, (data['book_id'], data['borrower_id']))

        connection.commit()
        return jsonify({"message": "Buku berhasil dikembalikan!"}), 200
    except mysql.connector.Error as err:
        print("Database error:", err)
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/borrow/<int:borrower_id>', methods=['PUT'])
def update_borrower(borrower_id):
    data = request.json
    print(f"Received update request for borrower {borrower_id}")
    print("Request data:", data)
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Begin transaction
        connection.start_transaction()

        # Update data peminjam di tabel borrowers
        update_borrower_query = """
            UPDATE borrowers 
            SET name = %s, email = %s, address = %s, phone = %s
            WHERE id = %s
        """
        cursor.execute(update_borrower_query, (
            data['name'],
            data['email'],
            data['address'],
            data['phone'],
            borrower_id
        ))
        print(f"Updated borrower data. Rows affected: {cursor.rowcount}")

        # Update data buku yang dipinjam jika ada perubahan
        if 'books' in data and len(data['books']) > 0:
            for book in data['books']:
                update_book_query = """
                    UPDATE borrowed_books 
                    SET title = %s, author = %s
                    WHERE borrower_id = %s AND book_id = %s
                """
                cursor.execute(update_book_query, (
                    book['title'],
                    book['author'],
                    borrower_id,
                    book['id']
                ))
                print(f"Updated book data. Rows affected: {cursor.rowcount}")

        # Commit transaction
        connection.commit()
        print("Transaction committed successfully")

        # Verify the update
        verify_query = """
            SELECT * FROM borrowers WHERE id = %s
        """
        cursor.execute(verify_query, (borrower_id,))
        updated_data = cursor.fetchone()
        print("Verified updated data:", updated_data)

        return jsonify({
            "message": "Data peminjam berhasil diperbarui!",
            "borrower_id": borrower_id,
            "updated_data": updated_data
        }), 200

    except mysql.connector.Error as err:
        print("Database error:", err)
        # Rollback in case of error
        if 'connection' in locals():
            connection.rollback()
        return jsonify({"error": f"Gagal memperbarui data: {str(err)}"}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()


if __name__ == '__main__':
    app.run(debug=True)