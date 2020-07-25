const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const express = require('express')
const app = express();

const port = new SerialPort('/COM17', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

var latestData;

// Read the port data
port.on("open", () => {
  console.log('serial port open');
});
parser.on('data', data =>{
  latestData = data
  console.log('Data from Arduino:', data);
});

app.get('/getSensorReading', (req, res) => {
  res.send(latestData)
})

app.listen(3000, () => console.log('server started, listening on port 3000'))