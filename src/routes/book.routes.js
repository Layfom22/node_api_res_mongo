// Importación de módulos necesarios
const express = require("express"); // Framework para crear el servidor
const router = express.Router(); // Módulo de Express para crear rutas
const Book = require("../models/book.models"); // Modelo de datos para los libros

// Middleware para obtener un libro por su ID
const getBook = async (req, res, next) => {
  let book;
  const { id } = req.params; // Obtiene el ID de los parámetros de la solicitud

  // Verifica si el ID tiene el formato correcto de MongoDB (24 caracteres hexadecimales)
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      message: "El ID del libro no es válido",
    });
  }

  try {
    // Intenta encontrar el libro por su ID en la base de datos
    book = await Book.findById(id);
    if (!book) {
      // Si no se encuentra el libro, devuelve un error 404
      return res.status(404).json({
        message: "El Libro no fue encontrado",
      });
    }
  } catch (error) {
    // Si ocurre un error en la búsqueda, devuelve un error 500
    return res.status(500).json({
      message: error.message,
    });
  }

  // Si se encuentra el libro, lo adjunta a la respuesta y pasa al siguiente middleware
  res.book = book;
  next();
};

// ******************Ruta GET para obtener todos los libros******************
router.get("/", async (req, res) => {
  try {
    // Busca todos los libros en la base de datos
    const books = await Book.find();
    console.log("GET ALL", books);

    // Si no hay libros, devuelve un status 204 (No Content) con un array vacío
    if (books.length === 0) {
      return res.status(204).json([]);
    }

    // Si hay libros, los devuelve en formato JSON
    res.json(books);
  } catch (error) {
    // Si ocurre un error, devuelve un status 500 con el mensaje de error
    res.status(500).json({ message: error.message });
  }
});

// ******************Ruta POST para crear un nuevo libro******************
router.post("/", async (req, res) => {
  // Extrae los datos del cuerpo de la solicitud
  const { title, author, genre, publication_date } = req?.body;

  // Verifica que todos los campos requeridos estén presentes
  if (!title || !author || !genre || !publication_date) {
    return res.status(400).json({
      message: "Los campos titulo, autor, genero y fecha son obligatorios",
    });
  }

  // Crea una nueva instancia del modelo Book con los datos proporcionados
  const book = new Book({
    title,
    author,
    genre,
    publication_date,
  });

  try {
    // Intenta guardar el nuevo libro en la base de datos
    const newBook = await book.save();
    console.log(newBook);

    // Si se guarda correctamente, devuelve el nuevo libro con un status 201 (Created)
    res.status(201).json(newBook);
  } catch (error) {
    // Si ocurre un error al guardar, devuelve un status 400 con el mensaje de error
    console.log("MENSAJE DE ERROR");
    res.status(400).json({
      message: error.message,
    });
  }
});

// ******************Ruta GET para obtener un libro específico por su ID******************
router.get("/:id", getBook, async (req, res) => {
  // Devuelve el libro encontrado por el middleware getBook
  res.json(res.book);
});

// ******************Ruta PUT para actualizar un libro específico por su ID******************
router.put("/:id", getBook, async (req, res) => {
  try {
    const book = res.book;

    // Actualiza los campos del libro si se proporcionan en la solicitud
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    // Guarda los cambios en la base de datos
    const updateBook = await book.save();

    // Devuelve el libro actualizado
    res.json(updateBook);
  } catch (error) {
    // Si ocurre un error al actualizar, devuelve un status 400 con el mensaje de error
    res.status(400).json({
      message: error.message,
    });
  }
});

// ******************Ruta PATCH para actualizar parcialmente un libro por su ID******************
router.patch("/:id", getBook, async (req, res) => {
  // Condicional para saber si no llega ningún campo en el body
  if (
    !req.body.title &&
    !req.body.author &&
    !req.body.genre &&
    !req.body.publication_date
  ) {
    res.status(400).json({
      message:
        "Al menos uno de estos campos debe ser enviado: Titulo, Autor, genero o Fecha de publicación",
    });
  }

  try {
    const book = res.book;

    // Actualiza los campos del libro si se proporcionan en la solicitud
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    // Guarda los cambios en la base de datos
    const updateBook = await book.save();

    // Devuelve el libro actualizado
    res.json(updateBook);
  } catch (error) {
    // Si ocurre un error al actualizar, devuelve un status 400 con el mensaje de error
    res.status(400).json({
      message: error.message,
    });
  }
});

// ******************Ruta DELETE para eliminar un libro específico por su ID******************
router.delete("/:id", getBook, async (req, res) => {
  try {
    const book = res.book;
    await book.deleteOne({
      _id: book._id
    });
    res.json({
      message: `El libro ${book.title} fue eliminado correctamente`
    });
  } catch (error) {
    // Si ocurre un error al eliminar, devuelve un status 500 con el mensaje de error
    res.status(500).json({
      message: error.message,
    });
  }
});

// Exporta el router para su uso en otras partes de la aplicación
module.exports = router;
