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


const getSum = (starting, ending, increment) => {
    starting = parseInt(starting);
    ending = parseInt(ending);
    increment= parseInt(increment);

    var x = starting;
    var m = ending
    var z = increment

    while (z < m) {
        z = z + increment;
        x = x + z;
        console.log(x);
        console.log("this is z " + z)
        
    }
        return {
            sum: x
        }
}
    

    // do {
    //     if (i === 0) {
    //         x = starting;
    //         i = i + 1;
    //     } else {
    //         x = x + z;
    //         z = z + increment;
    //         i = i + 1;
    //     }
    //     console.log(x)

    // }
    // while (z < ending)


const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM book";
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
    sql = "SELECT * FROM book ORDER BY total_pages"
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
    sql = "SELECT * FROM book ORDER BY isbn DESC"
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
    sql = "SELECT * FROM book ORDER BY RANDOM() LIMIT 3"
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


const findbook = (book) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM book WHERE true";

    // Check data provided and build query as necessary
    if (book.book_id !== "") {
        params.push(parseInt(book.book_id));
        sql += ` AND book_id = $${i}`;
        i++;
    };
    if (book.title !== "") {
        params.push(`${book.title}%`);
        sql += ` AND UPPER(title) LIKE UPPER($${i})`;
        i++;
    };
    if (book.total_pages !== "") {
        params.push(parseInt(book.total_pages));
        sql += ` AND total_pages >=  $${i}`;
        i++;
    };
    if (book.rating !== "") {
        params.push(parseInt(book.rating));
        sql += ` AND rating >= $${i}`;
        i++;
    };
    if (book.isbn !== "") {
        params.push(parseFloat(book.isbn));
        sql += ` AND isbn = $${i}`;
        i++;
    };
    if (book.published_date !== "") {
        params.push(book.published_date);
        sql += ` AND published_date = $${i}`;
        i++;
    };

    sql += ` ORDER BY book_id`;
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


const createbook = (book) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "INSERT INTO book ( ";

    // Check data provided and build query as necessary
    if (book.book_id !== "") {
        params.push(parseInt(book.book_id));
        sql += `book_id `;
        i++;
    };
    if (book.title !== "") {
        params.push(book.title);
        sql += `, title `;
        i++;
    };
    if (book.total_pages !== "") {
        params.push(book.total_pages);
        sql += `, total_pages `;
        i++;
    };
    if (book.rating !== "") {
        params.push(book.rating);
        sql += `, rating `;
        i++;
    };
    if (book.isbn !== "") {
        params.push(parseFloat(book.isbn));
        sql += `, isbn `;
        i++;
    };
    if (book.published_date !== "") {
        params.push(parseFloat(book.published_date));
        sql += `, published_date`;
        i++;
    };

    sql += `) VALUES (`;

    if (book.book_id !== "") {
        sql += `$${i} `;
        i++;
    };
    if (book.title !== "") {
        sql += `, $${i} `;
        i++;
    };
    if (book.total_pages !== "") {
        sql += `, $${i} `;
        i++;
    };
    if (book.rating !== "") {
        sql += `, $${i} `;
        i++;
    };
    if (book.isbn !== "") {
        sql += `, $${i}  `;
        i++;
    };
    if (book.published_date !== "") {
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


const createImport = (k) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables

    var i = 1;
    const sql = "INSERT INTO book (book_id, title, total_pages, rating, isbn, published_date) VALUES ($1, $2, $3, $4, $5, $6)";

    // for debugging
     console.log("sql: " + sql);

    return pool.query(sql, k)
        .then(result => {
            return { 
                id: "",
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                id: "Book ID: " +  k[0] + " - ",
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};



// Add towards the bottom of the page
module.exports.findbook = findbook;
module.exports.createbook = createbook;
module.exports.findReportA = findReportA;
module.exports.findReportB = findReportB;
module.exports.findReportC = findReportC;
module.exports.createImport = createImport;
module.exports.getSum = getSum;