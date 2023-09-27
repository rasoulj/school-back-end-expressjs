const fs = require('fs');
const readline = require('readline');

const Model = require("./app/api/models/word");

console.log('in db config');
const mongoose = require('mongoose');
const {getDocs} = require("./utils/api_helper");

const mongoDB = 'mongodb://school_db_admin:123sallam@157.90.207.53/school_db';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });




async function deleteWords(simple = 2) {
    await Model.deleteMany({simple});
    console.log("All simples has been deleted.");
}

async function filter5() {
    const fileStream = fs.createReadStream('distinct_words_2.txt');
    let list = [];
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    for await (const text of rl) {
        if(text.length === 5) {
            list.push(text);
            //count++;
            //console.log(count, text);
        }

        if(list.length === 8000) {

            await fs.writeFile(`./all5-${count}.txt`, list.join("\n"), err => {
                if (err) {
                    console.error(err);
                }
                // file written successfully
            });

            list = [];
            count ++;

        }
    }

    await fs.writeFile(`./all5-${count}.txt`, list.join("\n"), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });

}

async function insertWordsMany() {
    const fileStream = fs.createReadStream('all_simples_1.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    let list = [];
    let count = 0;


    for await (const text of rl) {
        list.push({text, simple: 1, length: (text || "").length});
        if (list.length === 1000) {
            await Model.insertMany(list);
            // await Model.insertMany(list);
            count += list.length;
            console.log(`${count} words has been inserted`);
            count++;
            list = [];
        }
    }
    await Model.insertMany(list, {upsert: true});
    count += list.length;
    console.log(`${count} words has been inserted`);


}

async function insertWord(text) {
    try {
        await Model.findOneAndUpdate({text}, {text, simple: 1, length: (text || "").length}, { upsert: true });
        // await Model.create({text});
    } catch (e) {
        console.log(e.toString());
    }
}


async function insertWords() {
    const fileStream = fs.createReadStream('all_simples_22.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    for await (const text of rl) {
        await insertWord(text);
        console.log(`${++count} ${text}`);
    }


}

// processLineByLine();


// async function deleteAll() {
//     try {
//         await Model.deleteMany({});
//     } catch (e) {
//         console.log(e.toString());
//     }
// }

async function showAllSimples(simple = 1) {
    const words = getDocs(await Model.find({simple, report: {"$ne": 2}}).sort({text: 1})).map(e => e.text);
    const writeStream = fs.createWriteStream(`all_simples_${simple}.txt`);

    let old = "";
    for(const word of words) {
        if(word !== old) {
            writeStream.write(word + "\n");
        }
        old = word;
        // console.log(word);
    }
}

filter5().then(() => {
    console.log("DONE");
});

// showAllSimples(1).then(() => {
//     console.log("Done");
// });

// insertWords().then(() => {
//     console.log("All words has been inserted");
// });

// deleteWords(1).then(() => {
//     console.log("all words has been deleted: ");
// });
// insertWordsMany().then(() => {
//     console.log("all words has been deleted: ");
// });

// deleteAll().then(() => {
//     console.log("all data has been deleted");
// });