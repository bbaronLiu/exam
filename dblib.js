// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM car";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;



const findCar = (car) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM car WHERE true";

    // Check data provided and build query as necessary
    if (car.carvin !== "") {
        params.push(parseInt(car.carvin));
        sql += ` AND carvin = $${i}`;
        i++;
    };
    if (car.carmake !== "") {
        params.push(`${car.carmake}%`);
        sql += ` AND UPPER(carmake) LIKE UPPER($${i})`;
        i++;
    };
    if (car.carmodel !== "") {
        params.push(`${car.carmodel}%`);
        sql += ` AND UPPER(carmodel) LIKE UPPER($${i})`;
        i++;
    };
    if (car.carmileage !== "") {
        params.push(parseFloat(car.carmileage));
        sql += ` AND carmileage <= $${i}`;
        i++;
    };

    sql += ` ORDER BY carvin`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

// Add towards the bottom of the page
module.exports.findCar = findCar;