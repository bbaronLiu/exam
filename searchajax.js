// Function to display results
const displayResults = (result) => {
    const divElement = document.getElementById("output");
    // Reset output at each call
    divElement.innerHTML = "";

    if (result.trans === "Error") {
        divElement.innerHTML += `
        <h2>Application Error</h2><br>
        <p>${result.result}</p>
        `
    } else {
        if (result.result.length === 0) {
            divElement.innerHTML += `<h3>No records found!</h3>`;
        } else {
            var tdText = "";
            result.result.forEach(product => { 
                tdText += `
                <tr>
                    <td>${product.prod_id}</td>
                    <td>${product.prod_name}</td>
                    <td>${product.prod_desc}</td>
                    <td>${product.prod_price}</td>
                </tr>
             `
            });
           //divElement.innerHTML = "Test";
           divElement.innerHTML += `
           <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Desc</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${tdText}
            </tbody>
          </table>           
        `
        };
    };
};


// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
    // Cancel default behavior of sending a synchronous POST request
    e.preventDefault();
    // Create a FormData object, passing the form as a parameter
    const formData = new FormData(e.target);
    fetch("/searchajax", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            displayResults(result);
        })
        .catch(err => {
            console.error(err.message);
        });
});