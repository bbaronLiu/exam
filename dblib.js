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
    sql = "SELECT COUNT(*) FROM customer";
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



const findCustomer = (customer) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
    if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += ` AND cusid = $${i}`;
        i++;
    };
    if (customer.cusfname !== "") {
        params.push(`${customer.cusfname}%`);
        sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(`${customer.cuslname}%`);
        sql += ` AND UPPER(cuslname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusstate !== "") {
        params.push((`${customer.cusstate}`));
        sql += ` AND UPPER(cusstate) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cussalesytd !== "") {
        params.push(`${customer.cussalesytd}`);
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(`${customer.cussalesprev}`);
        sql += ` AND cussalesprev >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusID`;
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
module.exports.findCustomer = findCustomer;