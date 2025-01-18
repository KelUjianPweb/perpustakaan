import React, { useReducer, useState, useEffect } from "react";
import { Clock, Edit2, Facebook, Instagram, Mail, MapPin, Phone, Twitter, User, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import untuk navigasi
import "./App.css";

// Define reducer actions and logic
const BORROW_BOOK = "BORROW_BOOK";
const RETURN_BOOK = "RETURN_BOOK";
const UPDATE_BORROWER = "UPDATE_BORROWER";

const bookReducer = (state, action) => {
  switch (action.type) {
    case BORROW_BOOK:
      return {
        ...state,
        recommendedBooks: state.recommendedBooks.map((book) =>
          book.id === action.payload.id
            ? { ...book, stock: book.stock - 1 }
            : book
        ),
        borrowedBooks: [...state.borrowedBooks, action.payload],
      };

    // case RETURN_BOOK:
    //   return {
    //     ...state,
    //     recommendedBooks: state.recommendedBooks.map((book) =>
    //       book.id === action.payload.id
    //         ? { ...book, stock: book.stock + 1 }
    //         : book
    //     ),
    //     borrowedBooks: state.borrowedBooks.filter(
    //       (book) => book.id !== action.payload.id
    //     ),
    //   };
    case RETURN_BOOK:
            return {
                ...state,
                recommendedBooks: action.payload.recommendedBooks,
                borrowedBooks: action.payload.borrowedBooks,
            };

    case UPDATE_BORROWER:
      return {
        ...state,
        borrowedBooks: state.borrowedBooks.map((book) =>
          book.id === action.payload.id
            ? { ...book, ...action.payload }
            : book
        ),
      };
    
    case "FETCH_BORROWED_BOOKS":
      return {
        ...state,
        borrowedBooks: action.payload, // Update dengan data dari backend
      };

    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(bookReducer, {
    recommendedBooks: [
      { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", stock: 5 },
      { id: 2, title: "1984", author: "George Orwell", stock: 3 },
      { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", stock: 4 },
      { id: 4, title: "Pride and Prejudice", author: "Jane Austen", stock: 2 },
      { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", stock: 6 },
      { id: 6, title: "Moby-Dick", author: "Herman Melville", stock: 5 },
      { id: 7, title: "War and Peace", author: "Leo Tolstoy", stock: 3 },
      { id: 8, title: "The Odyssey", author: "Homer", stock: 4 },
      { id: 9, title: "The Divine Comedy", author: "Dante Alighieri", stock: 2 },
      { id: 10, title: "Crime and Punishment", author: "Fyodor Dostoevsky", stock: 5 },
      { id: 11, title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", stock: 4 },
      { id: 12, title: "The Hobbit", author: "J.R.R. Tolkien", stock: 7 },
    ],
    borrowedBooks: [],
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    regulationsAccepted: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const navigate = useNavigate();

  const toggleProfileMenu = () => {
    setIsProfileMenuVisible((prev) => !prev);
  };

  useEffect(() => {
    let isMounted = true;
  
    const fetchBorrowedBooks = async () => {
      try {
        const response = await fetch("http://localhost:5000/borrowed-books");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
  
        if (isMounted) {
          console.log("Data buku yang dipinjam:", data);
          dispatch({
            type: "FETCH_BORROWED_BOOKS",
            payload: data,
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal mengambil data buku yang dipinjam:", err);
        }
      }
    };
  
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      fetchBorrowedBooks();
    } else {
      navigate("/login");
    }
  
    const timer = setInterval(() => {
      if (isMounted) {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    }, 1000);
  
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [dispatch, navigate]);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("isLoggedIn");
    setTimeout(() => navigate("/login", { replace: true }), 500); // Tambahkan sedikit delay
  };
  
  if (isLoggingOut) {
    return <div>Logging out...</div>; // Fallback UI
  }

  const filteredBooks = state.recommendedBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBorrow = (book) => {
    if (selectedBooks.length < 2 && book.stock > 0) {
      setSelectedBooks((prev) => [...prev, book]);
      setEditMode(null); // Reset edit mode when borrowing
      setFormData({
        name: "",
        email: "",
        address: "",
        phone: "",
        regulationsAccepted: false,
      });
      setFormVisible(true);
    } else if (book.stock === 0) {
      alert("Stok buku habis.");
    } else {
      alert("Anda hanya bisa meminjam maksimal 2 buku.");
    }
  };

  // const handleReturn = (book) => {
  //   dispatch({ type: RETURN_BOOK, payload: book });
  //   setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
  // };

  const handleReturn = async (book) => {
    try {
        const response = await fetch("http://localhost:5000/return-book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                book_id: book.book_id,
                borrower_id: book.borrower_id,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert("Buku berhasil dikembalikan!");

        // Perbarui daftar buku yang dipinjam di backend
        const updatedBorrowedBooks = state.borrowedBooks.filter(
            (b) => b.book_id !== book.book_id || b.borrower_id !== book.borrower_id
        );

        // Perbarui stok buku di recommendedBooks
        const updatedRecommendedBooks = state.recommendedBooks.map((b) =>
            b.id === book.book_id ? { ...b, stock: b.stock + 1 } : b
        );

        dispatch({
            type: "RETURN_BOOK",
            payload: {
                borrowedBooks: updatedBorrowedBooks,
                recommendedBooks: updatedRecommendedBooks,
            },
        });
    } catch (err) {
        console.error("Gagal mengembalikan buku:", err);
        alert("Gagal mengembalikan buku.");
    }
};


  const handleEdit = (book) => {
    setEditMode(book.book_id); // Menggunakan book_id dari database, bukan book.id
    setSelectedBooks([{
      id: book.book_id,
      title: book.title,
      author: book.author
    }]);
    setFormData({
      name: book.name || "",
      email: book.email || "",
      address: book.address || "",
      phone: book.phone || "",
      regulationsAccepted: true,
    });
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Edit mode:", editMode); // Untuk debugging

    if (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.address.trim() &&
      formData.phone.trim() &&
      formData.regulationsAccepted
    ) {
      try {
        // Tentukan endpoint dan method berdasarkan mode
        const endpoint = editMode 
          ? `http://localhost:5000/borrow/${editMode}`
          : "http://localhost:5000/borrow";
        
        const method = editMode ? "PUT" : "POST";
        
        console.log("Using method:", method); // Untuk debugging
        console.log("Endpoint:", endpoint); // Untuk debugging

        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            borrower_id: editMode, // Tambahkan borrower_id saat edit
            name: formData.name,
            email: formData.email,
            address: formData.address,
            phone: formData.phone,
            books: selectedBooks.map((book) => ({
              id: book.id,
              title: book.title,
              author: book.author,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Tampilkan pesan berdasarkan mode
        alert(editMode ? "Data peminjam berhasil diperbarui!" : "Buku berhasil dipinjam!");

        // Reset form
        setFormVisible(false);
        setFormData({
          name: "",
          email: "",
          address: "",
          phone: "",
          regulationsAccepted: false,
        });
        setSelectedBooks([]);
        setEditMode(null);

        // Refresh daftar buku yang dipinjam
        const borrowedResponse = await fetch("http://localhost:5000/borrowed-books");
        const borrowedData = await borrowedResponse.json();
        dispatch({
          type: "FETCH_BORROWED_BOOKS",
          payload: borrowedData,
        });

      } catch (err) {
        console.error("Gagal menyimpan data:", err);
        alert("Gagal menyimpan data.");
      }
    } else {
      alert("Harap lengkapi semua data dan setujui regulasi.");
    }
  };
  

  return (
    <div className={`app-container ${formVisible ? "content-shifted" : ""}`}>
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1>PERPUSTAKAAN DIGITAL</h1>
            <div className="header-right">
              <div className="header-time">
                <Clock className="icon" />
                <p>Jam Operasional Online: 24 jam/ 7 hari | Waktu Saat ini: {currentTime}</p>
              </div>
              <div className="profile-section">
                <User className="icon" onClick={toggleProfileMenu} />
                {isProfileMenuVisible && (
                  <div className="profile-menu">
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={`main-content ${formVisible ? "shifted" : ""}`}>
        <div className="container">
          {/* Search and Recommended Books Section */}
          <section className="search-recommendation-box">
            <div className="search-section">
              <h2>Cari Buku</h2>
              <input
                type="text"
                placeholder="Cari buku atau pengarang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="recommendation-section">
              <h2>Rekomendasi Buku</h2>
              <div className="book-grid">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="book-card">
                    <div className="book-card-inner">
                      <div className="book-card-front">
                        <img src="./images/book.jpg" className="book-image" />
                        <div className="book-info">
                          <h3>{book.title}</h3>
                          <p className="author">oleh {book.author}</p>
                          <p className="stock">Stok: {book.stock}</p>
                        </div>
                      </div>
                      <div className="book-card-back">
                        <div className="description">
                          <p>
                            Buku ini adalah salah satu karya terbaik dari {book.author}.
                            Deskripsi lebih lanjut dapat ditambahkan di sini.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="borrow-button-container">
                      <button
                        onClick={() => handleBorrow(book)}
                        className="borrow-button"
                        disabled={book.stock === 0}
                      >
                        {book.stock === 0 ? "Stok Habis" : "Pinjam"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Borrowed Books Section */}
          <section className="borrowed-section">
          <h2>Buku yang Dipinjam</h2>
          <div className="borrowed-list">
            {state.borrowedBooks.length > 0 ? (
              state.borrowedBooks.map((book, index) => (
                <div key={index} className={`borrowed-item ${book.is_edited ? 'edited' : ''}`}>
                  <div className="borrowed-info">
                    <div className="book-header">
                      <h3>{book.title}</h3>
                      {book.is_edited && (
                        <span className="edit-badge">
                          <AlertCircle className="icon" size={16} />
                          Diedit
                        </span>
                      )}
                    </div>
                    <p>oleh {book.author}</p>
                    <p>Peminjam: {book.name}</p>
                    <p>
                      Tanggal Pinjam: {book.borrow_date} | Kembali: {book.return_date}
                    </p>
                  </div>
                  <div className="borrowed-actions">
                    <button
                      onClick={() => handleEdit(book)}
                      className="edit-button"
                    >
                      <Edit2 className="icon" />
                    </button>
                    <button
                      onClick={() => handleReturn(book)}
                      className="return-button"
                    >
                      Kembalikan
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">-kosong-</p>
            )}
          </div>
        </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>Alamat</h3>
              <div className="contact-info">
                <div><MapPin className="icon" /> Jl. Perpustakaan No. 123, Jakarta</div>
                <div><Phone className="icon" /> +62 123-456-789</div>
                <div><Mail className="icon" /> info@perpustakaan.com</div>
              </div>
            </div>
            <div className="footer-section">
              <h3>Jam Operasional</h3>
              <p>Senin - Jumat: 08:00 - 20:00</p>
              <p>Sabtu: 09:00 - 17:00</p>
              <p>Minggu: 10:00 - 15:00</p>
            </div>
            <div className="footer-section">
              <h3>Media Sosial</h3>
              <div className="social-links">
                <a href="#"><Facebook className="icon" /></a>
                <a href="#"><Twitter className="icon" /></a>
                <a href="#"><Instagram className="icon" /></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Perpustakaan Online. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Borrow Form Modal */}
      {formVisible && (
        <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>{editMode ? "Edit Data Peminjam" : "Form Peminjaman"}</h2>
            <button
              onClick={() => {
                setFormVisible(false);
                setEditMode(null);
                setSelectedBooks([]);
                setFormData({
                  name: "",
                  email: "",
                  address: "",
                  phone: "",
                  regulationsAccepted: false,
                });
              }}
              className="close-button"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="borrow-form">
              <div className="form-group">
                <label>Buku yang Dipinjam</label>
                <ol>
                  {selectedBooks.map((book, index) => (
                    <li key={book.id}>
                      {index + 1}. {book.title}
                      {/* Tombol Sampah untuk Menghapus Buku */}
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(book.id)}
                        className="remove-book-button"
                        aria-label="Hapus Buku"
                      >
                        <Trash className="icon" />
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Nomor Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.regulationsAccepted}
                    onChange={(e) =>
                      setFormData({ ...formData, regulationsAccepted: e.target.checked })
                    }
                  />
                  Saya menyetujui ketentuan peminjaman :
                  <ul>
                    <li>- Buku harus dikembalikan dalam waktu 7 hari.</li>
                    <li>- Buku yang hilang atau rusak akan dikenakan biaya ganti.</li>
                    <li>- Peminjaman hanya dapat dilakukan untuk satu buku dalam satu waktu.</li>
                  </ul>
                </label>
              </div>
              <button type="submit" className="submit-button">
                {editMode ? "Perbarui" : "Pinjam"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;