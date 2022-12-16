class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }
}

class UI {
  static displayBooks() {
    const books = Store.getBooks();
    const list = document.querySelector("#book-list");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    books.forEach((book) => UI.addBookToList(book));
  }

  static addBookToList(book) {
    const list = document.querySelector("#book-list");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td id="isbnNum">${book.isbn}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
    `;
    list.appendChild(row);
  }

  static deleteBook(el) {
    if (el.classList.contains("delete")) {
      const isbn = el.parentElement.previousElementSibling.textContent;
      Store.removeBook(isbn);
      UI.displayBooks();
    }
  }

  static showAlert(message, className) {
    if (!document.querySelector(".alert")) {
      const div = document.createElement("div");
      div.className = `alert alert-${className}`;
      div.appendChild(document.createTextNode(message));
      const container = document.querySelector(".container");
      const form = document.querySelector("#book-form");
      container.insertBefore(div, form);

      setTimeout(() => {
        div.remove();
      }, 3000);
    }
  }

  static clearFields() {
    document.querySelector("#title").value = "";
    document.querySelector("#author").value = "";
    document.querySelector("#isbn").value = "";
  }
}

class Store {
  static getBooks() {
    return JSON.parse(localStorage.getItem("books")) ?? [];
  }

  static addBook(book) {
    const savedBooks = Store.getBooks();
    if (savedBooks) {
      const existingBook = savedBooks.find((saved) => saved.isbn === book.isbn);
      if (existingBook) {
        const books = savedBooks.map((savedBook) => {
          if (savedBook.isbn === book.isbn) {
            return {
              ...existingBook,
              title: book.title,
              author: book.author,
            };
          }
          return savedBook;
        });
        localStorage.setItem("books", JSON.stringify(books));
        return false;
      } else {
        const books = [...savedBooks, book];
        localStorage.setItem("books", JSON.stringify(books));
        return true;
      }
    } else {
      const books = [book];
      localStorage.setItem("books", JSON.stringify(books));
      return true;
    }
  }

  static removeBook(isbn) {
    const books = Store.getBooks();
    const newBooks = books.filter((book) => book.isbn !== isbn);
    localStorage.setItem("books", JSON.stringify(newBooks));
  }
}

document.addEventListener("DOMContentLoaded", UI.displayBooks);

document.querySelector("#book-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.querySelector("#title").value;
  const author = document.querySelector("#author").value;
  const isbn = document.querySelector("#isbn").value;

  if (title === "" || author === "" || isbn === "") {
    UI.showAlert("Please fill in all fields", "danger");
  } else {
    const book = new Book(title, author, isbn);
    const newBookAdded = Store.addBook(book);
    if (newBookAdded) {
      UI.addBookToList(book);
      UI.showAlert("Book added", "success");
    } else {
      UI.displayBooks();
      UI.showAlert("Book updated", "success");
    }
    UI.clearFields();
  }
});

document.querySelector("#book-list").addEventListener("click", (e) => {
  UI.deleteBook(e.target);
  UI.showAlert("Book removed", "success");
});
