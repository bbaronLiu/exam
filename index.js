// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");
const path = require('path')
const { Pool } = require('pg');
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
    // pool.query('SELECT * from customer', (err, result) => {
    //     if (err) {
    //       return console.error('Error executing query', err.stack)
    //     }
    //     console.log(result) // brianc
    //   })
    
    res.render("index");
});

// GET /create
app.get("/create", (req, res) => {
    res.render("create", { model: {},
    type: "get" });
  });

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM customer WHERE cusid = $1";
    pool.query(sql, [id], (err, result) => {
        if (err) {
            return console.error(err.message);
          }
      res.render("edit", { model: result.rows[0] });
    });
  });

app.get("/report", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("report");
});

app.get("/export", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("export");
});

app.get("/manage", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  //Create an empty customer object (To populate form with values)
  const customer = {
      cusid: "",
      cusfname: "",
      cuslname: "",
      cusstate: "",
      cussalesytd: "",
      cussalesprev: ""
  };
  res.render("manage", {
      type: "get",
      totRecs: totRecs.totRecords,
      customer: customer
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
    const sql = "SELECT * FROM customer WHERE cusid = $1";
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
    //Create an empty customer object (To populate form with values)
    const customer = {
        cusid: "",
        cusfname: "",
        cuslname: "",
        cusstate: "",
        cussalesytd: "",
        cussalesprev: ""
    };
    res.render("import", {
        type: "get",
        totRecs: totRecs.totRecords,
        customer: customer
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
    const sql = "INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)";
    const customer = [req.body.cusid, req.body.cusfname, req.body.cuslname, req.body.cusstate, req.body.cussalesytd, req.body.cussalesprev];
    const customers = req.body;

    try {
      const result = await pool.query(sql, customer);
      res.render("create", {
        type: "POST",
        model: customers,
        // rowCount is a part of the export interface QueryResultBase which I can use as an identifier
        // for my /create page to create a success message
        result: result.rowCount,
      });
    } catch (err) {
      res.render("create", {
        type: "POST",
        model: customers,
        result: err.message,
      })
    }
});

// POST /delete/5
app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM customer WHERE cusid = $1";
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
        model: customers,
        result: err.message,
      })
    }

});  

app.post("/manage", async (req, res) => {
  // Omitted validation check
  //  Can get this from the page rather than using another DB call.
  //  Add it as a hidden form value.
  const totRecs = await dblib.getTotalRecords();

  dblib.findCustomer(req.body)
      .then(result => {
          res.render("manage", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: result,
              customer: req.body
          })
      })
      .catch(err => {
          res.render("manage", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: `Unexpected Error: ${err.message}`,
              customer: req.body
          });
      });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const customer = [req.body.cusid, req.body.cusfname, req.body.cuslname, req.body.cusstate, req.body.cussalesytd, req.body.cussalesprev];
    const sql = "UPDATE customer SET cusfname = $2, cuslname = $3, cusstate = $4, cussalesytd = $5, cussalesprev = $6 WHERE (cusid = $1)";
    pool.query(sql, customer, (err, result) => {
        if (err) {
          console.log(customer)
            return console.error(err.message);
          }
      res.redirect("/manage");
    });
  });


app.post("/searchajax", upload.array(), async (req, res) => {
  dblib.findCustomer(req.body)
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));

});