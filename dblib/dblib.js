const findProducts = (product) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM product WHERE true";

    // Check data provided and build query as necessary
    if (product.prod_id !== "") {
        params.push(parseInt(product.prod_id));
        sql += ` AND prod_id = $${i}`;
        i++;
    };
    if (product.prod_name !== "") {
        params.push(`${product.prod_name}%`);
        sql += ` AND UPPER(prod_name) LIKE UPPER($${i})`;
        i++;
    };
    if (product.prod_desc !== "") {
        params.push(`${product.prod_desc}%`);
        sql += ` AND UPPER(prod_desc) LIKE UPPER($${i})`;
        i++;
    };
    if (product.prod_price !== "") {
        params.push(parseFloat(product.prod_price));
        sql += ` AND prod_price >= $${i}`;
        i++;
    };

    sql += ` ORDER BY prod_id`;
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
module.exports.findProducts = findProducts;