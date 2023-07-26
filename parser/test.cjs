const fs = require('fs');
const _ = require('lodash'); // If using lodash

const file1Data = fs.readFileSync('result.json', 'utf8');
const file2Data = fs.readFileSync('result/final.json', 'utf8');

const json1 = JSON.parse(file1Data);
const json2 = JSON.parse(file2Data);
      
const areEqual = JSON.stringify(json1) === JSON.stringify(json2);
console.log(areEqual); // true if equal, false otherwise


const areEqual2 = _.isEqual(json1, json2);
console.log("#########  " +areEqual2 )
