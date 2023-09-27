// const readXlsxFile = require('read-excel-file/node');
//
// // File path.
// readXlsxFile('data/defs.xlsx').then((rows) => {
//     for(const row of rows.slice(1))
//     console.log(row);
//     // `rows` is an array of rows
//     // each row being an array of cells.
// });


function randCode(len = 6) {
    const x10 = Math.pow(10, len-1);
    return (Math.floor(Math.random() * 9 * x10) + x10)+"";
}


const createWid = require("./app/api/models/users");

const len = 8;
for(var i=0; i<100000; i++) {
    let code = randCode(len);
    if(code.length !== len) console.log(code);
}
