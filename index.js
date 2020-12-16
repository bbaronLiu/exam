// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");
const path = require('path')
const { Pool } = require('pg');

var fileupload = require("express-fileupload");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));
// Adding bootstrap
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use(fileupload());

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //testing pool.query 
    //res.send("Root resource - Up and running!")
    // pool.query('SELECT * from book', (err, result) => {
    //     if (err) {
    //       return console.error('Error executing query', err.stack)
    //     }
    //     console.log(result) // brianc
    //   })
    
    res.render("index");
});

app.get("/sum", (req, res) => {
  const number = {
    starting: null,
    ending: null,
    increment: null
  }
  res.render("sum", {
  number: number,
  type: "get" 
  });
});

// /post sum
app.post("/sum",  (req, res) => {
  let checker = "";
  let sum = ""
  const number = {
    starting: req.body.starting,
    ending: req.body.ending,
    increment: req.body.increment
  }
  var starting = req.body.starting
  var ending = req.body.ending
  var increment = req.body.increment
  if (ending > starting) {
    const result = dblib.getSum(starting, ending, increment);
    sum = result.sum
  } else {
    checker = "no"
  }

  res.render("sum", {
    type: "post",
    sum: sum,
     number: number,
     result: sum,
     checker: checker
     
  });
});

// GET /create
app.get("/create", (req, res) => {
    res.render("create", { model: {},
    type: "get" });
  });

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM book WHERE book_id = $1";
    pool.query(sql, [id], (err, result) => {
        if (err) {
            return console.error(err.message);
          }
      res.render("edit", { model: result.rows[0] });
    });
  });

  app.get("/report", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    res.render("report", {
        type: "get",
        totRecs: totRecs.totRecords,
        dropdownVals: "",
        a: "",
        b: "",
        c: ""
    });
  });

  app.get("/export", (req, res) => {
    var message = "";
    res.render("export",{ message: message });
  });

  app.post("/export", (req, res) => {
    const sql = "SELECT book_id, title, total_pages, rating, isbn, published_date FROM book ORDER BY book_id"; 1000.00 
    pool.query(sql, [], (err, result) => {
        var message = "";
        if(err) {
            message = `Error - ${err.message}`;
            res.render("export", { message: message })
        } else {
            var output = "";
            result.rows.forEach(book => {
                output += `${book.book_id},${book.title},${book.total_pages},${book.rating},${book.isbn},${book.published_date}\r\n`;
            });
            String.prototype.trim = function() {
              return this.replace(/^\s+|\s+$/g, "");
            };
            output = output.trim();
            res.header("Content-Type", "text/txt");
            res.attachment("export.txt");
            return res.send(output);
        };
    });
});

app.get("/manage", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  //Create an empty book object (To populate form with values)
  const book = {
      book_id: "",
      title: "",
      total_pages: "",
      rating: "",
      isbn: "",
      published_date: ""
  };
  res.render("manage", {
      type: "get",
      totRecs: totRecs.totRecords,
      book: book
  });
});

app.get("/searchajax", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("searchajax", {
      totRecs: totRecs.totRecords,
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM book WHERE book_id = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("delete", { model: result.rows[0],
        type: "get"
      });
    });
  });

app.get("/import", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty book object (To populate form with values)
    const book = {
        book_id: "",
        title: "",
        total_pages: "",
        rating: "",
        isbn: "",
        published_date: ""
    };
    res.render("import", {
        type: "get",
        totRecs: totRecs.totRecords,
        book: book
    });
  });
  
  app.get("/searchajax", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    res.render("searchajax", {
        totRecs: totRecs.totRecords,
    });
  });

  // POST /create
app.post("/create", async (req, res) => {
    const sql = "INSERT INTO book (book_id, title, total_pages, rating, isbn, published_date) VALUES ($1, $2, $3, $4, $5, $6)";
    const book = [req.body.book_id, req.body.title, req.body.total_pages, req.body.rating, req.body.isbn, req.body.published_date];
    const books = req.body;

    try {
      const result = await pool.query(sql, book);
      res.render("create", {
        type: "POST",
        model: books,
        // rowCount is a part of the export interface QueryResultBase which I can use as an identifier
        // for my /create page to create a success message
        result: result.rowCount,
      });
    } catch (err) {
      res.render("create", {
        type: "POST",
        model: books,
        result: err.message,
      })
    }
});

// POST /delete/5
app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM book WHERE book_id = $1";
    try {
      const result = await pool.query(sql, [id], (err, result) => {
        // if (err) ...
        res.render("delete", { model: result,
          type: "POST",
          result: result.rowCount
        });
      });
    } 
    
    catch (err) {
      res.render("delete", {
        type: "POST",
        model: books,
        result: err.message,
      })
    }

});  

app.post("/manage", async (req, res) => {
  // Omitted validation check
  //  Can get this from the page rather than using another DB call.
  //  Add it as a hidden form value.
  const totRecs = await dblib.getTotalRecords();

  dblib.findbook(req.body)
      .then(result => {
          res.render("manage", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: result,
              book: req.body
          })
      })
      .catch(err => {
          res.render("manage", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: `Unexpected Error: ${err.message}`,
              book: req.body
          });
      });
});

app.post("/import",  async (req, res) => {

  (async () => {
    const x = req.files.databasefile.data;
    const y = x.toString()
    const books = y.split(/\r?\n/);
    var i = 0;
    var numFailed = 0;
    var numInserted = 0;
    var errorMessage = "";
    const sql = "INSERT INTO book (book_id, title, total_pages, rating, isbn, published_date) VALUES ($1, $2, $3, $4, $5, $6)";

    console.log("--- STEP 1: Pre-Loop");
    for (book in books ) {
      var m = books[i]
      var k = m.split(",")
      var i = i + 1;
      if (k[5] === "Null") {
        k[5] = null;
      }
      console.log("--- STEP 2: In-Loop Before Insert");
      const result = await dblib.createImport(k);
      console.log("--- STEP 3: In-Loop After Insert");
      console.log("result is: ", result);
      if (result.trans === "success") {
        numInserted++;
      } else {
        numFailed++;
        errorMessage += `${result.result} \r\n`;
      };
      console.log("--- STEP 4: After-Loop");
      console.log(`Records processed: ${numInserted + numFailed}`);
      console.log(`Records successfully inserted: ${numInserted}`);
      console.log(`Records with insertion errors: ${numFailed}`);
      if(numFailed > 0) {
          console.log("Error Details:");
          console.log(errorMessage);
        }
      };
      const totRecs = await dblib.getTotalRecords();
      res.render("import", {
        type: "post",
        processed: numInserted + numFailed,
        inserted: numInserted,
        notInserted: numFailed,
        errorMessage: errorMessage,
        totRecs: totRecs.totRecords
    })
    })()

  // (async () => {
  //   console.log("--- STEP 1: Pre-Loop");
  //   for (book in books ) {
  //     console.log("--- STEP 2: In-Loop Before Insert");
  //     const result = await dblib.createbook(book);
  //     console.log("--- STEP 3: In-Loop After Insert");
  //     console.log("result is: ", result);
  //     if (result.trans === "success") {
  //       numInserted++;
  //     } else {
  //       numFailed++;
  //       errorMessage += `${result.msg} \r\n`;
  //     };
  //     console.log("--- STEP 4: After-Loop");
  //     console.log(`Records processed: ${numInserted + numFailed}`);
  //     console.log(`Records successfully inserted: ${numInserted}`);
  //     console.log(`Records with insertion errors: ${numFailed}`);
  //     if(numFailed > 0) {
  //         console.log("Error Details:");
  //         console.log(errorMessage);
  //       }
  //     };
  //   })()
});



app.post("/report", async (req, res) => {
  // Omitted validation check
  //  Can get this from the page rather than using another DB call.
  //  Add it as a hidden form value.
  const totRecs = await dblib.getTotalRecords();
  const drop = req.body.report;
  console.log(drop);
  if (drop === "alllname") {

      console.log("does this work")
      const result = await dblib.findReportA();
      res.render("report", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: result,
        book: req.body,
        a: "selected",
        b: "",
        c: "",
        lucky: ""
      });
  }

  if (drop === "allsalesd") {

      console.log("does this work")
      const result = await dblib.findReportB();
      res.render("report", {
        type: "post",
        totRecs: totRecs.totRecords,
        result: result,
        book: req.body,
        dropdownVals: req.body.report,
        a: "",
        b: "selected",
        c: "",
        lucky: ""
      });
    };
  
  if (drop === "threerandom") {
    console.log("does this work")
    const result = await dblib.findReportC();
    res.render("report", {
      type: "post",
      totRecs: totRecs.totRecords,
      result: result,
      book: req.body,
      a: "",
      b: "",
      c: "selected",
      lucky: "lucky"
    });
  }
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const book = [req.body.book_id, req.body.title, req.body.total_pages, req.body.rating, req.body.isbn, req.body.published_date];
    const sql = "UPDATE book SET title = $2, total_pages = $3, rating = $4, isbn = $5, published_date = $6 WHERE (book_id = $1)";
    pool.query(sql, book, (err, result) => {
        if (err) {
          console.log(book)
            return console.error(err.message);
          }
      res.redirect("/manage");
    });
  });
