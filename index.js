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


app.get("/", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  //Create an empty car object (To populate form with values)
  const car = {
      carvin: "",
      carmake: "",
      carmodel: "",
      carmileage: ""
  };
  res.render("index", {
      type: "get",
      totRecs: totRecs.totRecords,
      car: car
  });
});

app.get("/searchajax", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("searchajax", {
      totRecs: totRecs.totRecords,
  });
});

app.post("/", async (req, res) => {
  // Omitted validation check
  //  Can get this from the page rather than using another DB call.
  //  Add it as a hidden form value.
  const totRecs = await dblib.getTotalRecords();

  dblib.findCar(req.body)
      .then(result => {
          res.render("index", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: result,
              car: req.body
          })
      })
      .catch(err => {
          res.render("index", {
              type: "post",
              totRecs: totRecs.totRecords,
              result: `Unexpected Error: ${err.message}`,
              car: req.body
          });
      });
});

app.post("/searchajax", upload.array(), async (req, res) => {
  dblib.findCar(req.body)
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));

});