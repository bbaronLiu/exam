// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

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
    //res.send("Root resource - Up and running!")
    res.render("index");
});

app.get("/create", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("create");
});

app.get("/report", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("report");
});

app.get("/export", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("export");
});

app.get("/import", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("import");
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

app.post("/searchajax", upload.array(), async (req, res) => {
  dblib.findCustomer(req.body)
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));

});