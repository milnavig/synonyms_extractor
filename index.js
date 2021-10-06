const fs = require('fs');

let strict = true; // set to false for html-mode
let toggle_title = false;
let toggle_text = false;
let current_object = {};
let arr = [];
 
// stream usage
// takes the same options as the parser
let saxStream = require("sax").createStream(strict, false);
saxStream.on("error", function (e) {
    // unhandled errors will throw, since this is a proper node
    // event emitter.
    console.error("error!", e);
    // clear the error
    this._parser.error = null;
    this._parser.resume();
});

saxStream.on("opentag", function (node) {
    // same object as above
    if (node.name === 'title') {
        toggle_title = true;
    }
    if (node.name === 'text') {
        toggle_text = true;
    }
});

saxStream.on("text", function (text) {
    // same object as above
    if (toggle_title) {
        current_object.word = text;
        toggle_title = false;
    }
    if (toggle_text) {
        if (text.includes('==== Синоніми ====')) {
            let words = text.split('==== Синоніми ====')[1].split('====')[0].match(/\[\[.{1,10}\]\]/gi);
            if (words) {
                current_object.synonyms = words.map(s => s.slice(2, -2));
                arr.push({...current_object});
            }
        }
        toggle_text = false;
    }
})

saxStream.on("end", function (text) {
    // same object as above
    fs.writeFileSync('./res.json', JSON.stringify(arr, null, 4));
})

// pipe is supported, and it's readable/writable
// same chunks coming in also go out.
fs.createReadStream("ukwiktionary-20211001-pages-meta-current.xml")
  .pipe(saxStream);
  