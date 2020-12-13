const { default: parseMoney } = require("parse-money");
const parsemoney = require("parse-money");
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

const findReportA = () => {
    console.log()
    sql = "SELECT * FROM customer ORDER BY cuslname"
    return pool.query(sql)
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
}

const findReportB = () => {
    console.log()
    sql = "SELECT * FROM customer ORDER BY cussalesytd DESC"
    return pool.query(sql)
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
}


const findReportC = () => {
    console.log()
    sql = "SELECT * FROM customer ORDER BY RANDOM() LIMIT 3"
    return pool.query(sql)
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
}


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
        params.push(parseFloat(customer.cussalesytd));
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(parseFloat(customer.cussalesprev));
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


const createCustomer = (customer) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "INSERT INTO customer ( ";

    // Check data provided and build query as necessary
    if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += `cusid `;
        i++;
    };
    if (customer.cusfname !== "") {
        params.push(customer.cusfname);
        sql += `, cusfname `;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(customer.cuslname);
        sql += `, cuslname `;
        i++;
    };
    if (customer.cusstate !== "") {
        params.push(customer.cusstate);
        sql += `, cusstate `;
        i++;
    };
    if (customer.cussalesytd !== "") {
        params.push(parseFloat(customer.cussalesytd));
        sql += `, cussalesytd `;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(parseFloat(customer.cussalesprev));
        sql += `, cussalesprev`;
        i++;
    };

    sql += `) VALUES (`;

    if (customer.cusid !== "") {
        sql += `$${i} `;
        i++;
    };
    if (customer.cusfname !== "") {
        sql += `, $${i} `;
        i++;
    };
    if (customer.cuslname !== "") {
        sql += `, $${i} `;
        i++;
    };
    if (customer.cusstate !== "") {
        sql += `, $${i} `;
        i++;
    };
    if (customer.cussalesytd !== "") {
        sql += `, $${i}  `;
        i++;
    };
    if (customer.cussalesprev !== "") {
        sql += `, $${i} `;
        i++;
    };

    sql += `)`;


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
module.exports.createCustomer = createCustomer;
module.exports.findReportA = findReportA;
module.exports.findReportB = findReportB;
module.exports.findReportC = findReportC;