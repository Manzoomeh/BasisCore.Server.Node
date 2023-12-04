import ContextBase from "../../renderEngine/Context/ContextBase";
import JsonSource from "../../renderEngine/Source/JsonSource";
import ObjectToken from "../../renderEngine/Token/ObjectToken";
import SimpleTokenElement from "../../renderEngine/Token/SimpleTokenElement";
import ValueToken from "../../renderEngine/Token/ValueToken";


const dataArray = [
  { id: 1, name: "Pizza", cuisine: "Italian", price: 12.99, rating: 4.5 },
  { id: 2, name: "Sushi", cuisine: "Japanese", price: 24.99, rating: 4.8 },
  { id: 3, name: "Salad", cuisine: "Various", price: 8.99, rating: 3.9 },
  { id: 4, name: "Tacos", cuisine: "Mexican", price: 10.99, rating: 4.2 },
  { id: 5, name: "Fried Chicken", cuisine: "American", price: 16.99, rating: 4.0 },
  { id: 6, name: "Chocolate Cake", cuisine: "Dessert", price: 7.99, rating: 4.7 },
  { id: 7, name: "Pasta", cuisine: "Italian", price: 14.99, rating: 4.1 },
  { id: 8, name: "Burger", cuisine: "American", price: 9.99, rating: 4.3 },
  { id: 9, name: "Ice Cream", cuisine: "Dessert", price: 5.99, rating: 4.6 },
  { id: 10, name: "Steak", cuisine: "Various", price: 19.99, rating: 4.4 },
]
const context = new ContextBase(dataArray,"sourceExample.memberExample");

describe("token", () => {
  test("value token", () => {
    let t1 = new ValueToken("hi");
    expect(t1).toEqual({ value: "hi" });
  });
  test("test simple token element in correcty defiend source member",async()=>{
    const example = new SimpleTokenElement("sourceExample","memberExample","id")
    expect(example).toEqual({
      column: "id",
      member: "memberExample",
      source: "sourceExample",
      value: undefined,
    });
  })
});
