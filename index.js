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
  

app.post("/import",  async (req, res) => {

  (async () => {
    let id = "";
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

        errorMessage += result.id + `${result.result} \r\n`;
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
        new: numInserted + totRecs.totRecords,
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



