import convertToNestedStructure from "../modules/convertToNestedObject.js";
const array = [
  { "_root.Data__11.sample01": "test01" },
  { "_root.Data__12.sample02": "test02" },
  { "_root.Data__13.sample03": "test03" },
  { "_root.Data__13.Question__131.sample031": "test03_1" },
  { "_root.Data__13.Question__132.sample032": "test03_2" },
  { "_root.Data__13.Question__132.Answer__132.sample0321": "test03_2_1" },
  { "_root.Data__13.Question__132.Answer__132.sample0322": "test03_2_2" },
  { "_root.Data__13.Question__132.Answer__132.sample0323": "test03_2_3" },
  { "_root.Data__13.Question__133.sample033": "test03_3" },
  { "_root.Data__14.sample04": "test04" },
  { "_root.Data__15.sample05": "test05" },
];

console.log(convertToNestedStructure(array))