import React, { useState, useEffect } from 'react';
import Navbar from "../component/Navbar.jsx"; // Ensure the path is correct
import { Link } from "react-router-dom";

function Search({ account = "", isLoggedIn = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  
  const books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { id: 2, title: "1984", author: "George Orwell" },
    { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
    { id: 6, title: "Moby-Dick", author: "Herman Melville" },
    { id: 7, title: "War and Peace", author: "Leo Tolstoy" },
    { id: 8, title: "The Odyssey", author: "Homer" },
    { id: 9, title: "The Divine Comedy", author: "Dante Alighieri" },
    { id: 10, title: "Crime and Punishment", author: "Fyodor Dostoevsky" },
    { id: 11, title: "The Brothers Karamazov", author: "Fyodor Dostoevsky" },
    { id: 12, title: "The Hobbit", author: "J.R.R. Tolkien" },
  ];

  useEffect(() => {
    setFilteredBooks(books); // Initialize filtered books
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const booksToDisplay = searchQuery ? filteredBooks : books;

  return (
    <div>
      <Navbar account={account} isLoggedIn={isLoggedIn} />
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-100 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white">
                Cari Buku
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                <div>
                  <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Masukkan Judul atau Pengarang
                  </label>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="bg-gray-50 border border-gray-300 text-lg text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full sm:w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Cari buku atau pengarang..."
                    required
                    aria-label="Search books by title or author"
                  />
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Buku</h2>
                  <div className="flex flex-wrap mt-4 gap-4">
                    {booksToDisplay.length > 0 ? (
                      booksToDisplay.map((book) => (
                        <div
                          key={book.id}
                          className="bg-gray-50 p-4 rounded-lg shadow dark:bg-gray-700 w-60 flex-shrink-0"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{book.title}</h3>
                          <p className="text-md text-gray-500 dark:text-gray-400">oleh {book.author}</p>
                          <Link to={`/book/${book.id}`} className="text-blue-500 hover:underline">
                            Lihat Detail
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-lg text-gray-500 dark:text-gray-400">Tidak ada buku yang ditemukan.</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Search;
