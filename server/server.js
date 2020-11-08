const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

const express = require("express");
const app = express();

const port = new SerialPort("/COM17", { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: "\n" }));

var latestData = 23;

// Read the port data
port.on("open", () => {
  console.log("serial port open");
});

parser.on("data", (data) => {
  latestData = data;
  console.log("Data from Arduino:", data);
});

app.get("/getSensorReading", (req, res) => {
  res.json(latestData);
});

app.listen(5000, () => console.log("server started, listening on port 5000"));
