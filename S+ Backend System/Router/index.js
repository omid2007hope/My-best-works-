const Health = require("./server/Health");
const Port = require("./server/Port");

const list = [
  {
    id: 1,
    router: Health,
    method: "GET",
    path: "/health",
  },
  {
    id: 2,
    router: Port,
    method: "GET",
    path: "/port",
  },
];

module.exports = list;
