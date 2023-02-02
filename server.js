const express = require("express");
const bodyParser = require("body-parser");
const mqtt = require('mqtt');
const path = require('path');
const app = express();
var mysql = require('mysql');
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('public/images', express.static('images'));

// --------------------------------------------------------------------------------------

app.listen(2222, () => {
  console.log(`Server is running on port 2222.`);
  // access mysql
  con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "pD12&^51@!adad",
    database: "iot"
  });
});

// --------------------------------------------------------------------------------------

app.get('/intro', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/intro.html"));
  // intro page - static
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/dashboard.html"));
  // state of device - get data by call api
});

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/main.html"));
  // traffic light state - get data by call api
});

app.get('/charts', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/charts.html"));
  // show data by chart - get data by call api
});

app.get('/logs', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/logs.html"));
  // show data by logs - get data by call api
});

// --------------------------------------------------------------------------------------

app.get('/api/getState', (req, res) => {
  con.query("select * from current_state;",
    function (err, result, fields) {
      if (err) throw err;
      else {
        res.send({ "state": result[0].state })
      }
    })
})

app.post('/api/state1', (req, res) => {
  res.send({
    "state": req.body.state // receive from client, sen to client :p
  });
  // publish MQTT message to let Y go
  client.publish("/esp8266/states", "1", { qos: 0, retain: true }, (error) => {
    if (error) {
      console.error(error)
    } else {
      console.log("state change to 1")
    }
  })
  //
  con.query("UPDATE current_state set state = 1, timeStamp = CURRENT_TIMESTAMP",
    function (err, result, fields) {
      if (err) throw err;
      else {
        //console.log(result.message)
      }
    })
})

app.post('/api/state2', (req, res) => {
  res.send({
    "state": req.body.state
  });
  // publish MQTT message to let Y go
  client.publish("/esp8266/states", "2", { qos: 0, retain: true }, (error) => {
    if (error) {
      console.error(error)
    } else {
      console.log("state change to 2")
    }
  })
  //
  con.query("UPDATE current_state set state = 2, timeStamp = CURRENT_TIMESTAMP",
    function (err, result, fields) {
      if (err) throw err;
      else {
        //console.log(result.message)
      }
    })
})

app.post('/api/state3', (req, res) => {
  res.send({
    "state": req.body.state
  });
  // publish MQTT message to let Y go
  client.publish("/esp8266/states", "3", { qos: 0, retain: true }, (error) => {
    if (error) {
      console.error(error)
    } else {
      console.log("state change to 3")
    }
  })
  //
  con.query("UPDATE current_state set state = 3, timeStamp = CURRENT_TIMESTAMP",
    function (err, result, fields) {
      if (err) throw err;
      else {
        //console.log(result.message)
      }
    })
})

app.post('/api/dashboard', (req, res) => {
  con.query("select * from traffic_logs order by ID desc LIMIT 1",
    function (err, result, fields) {
      if (err) throw err;
      else {
        //console.log(result)
        res.send(result)
      }
    })
})

app.post('/api/logs', (req, res) => {
  con.query("select * from traffic_logs order by ID desc LIMIT 50",
    function (err, result, fields) {
      if (err) throw err;
      else {
        //console.log(result)
        res.send(result)
      }
    })
})

app.post('/api/charts', (req, res) => {
  con.query("select * from traffic_logs order by ID desc LIMIT 10",
    function (err, result, fields) {
      if (err) throw err;
      else {
        //console.log(result)
        res.send(result)
      }
    })
})


// --------------------------------------------------------------------------------------

const host = 'broker.emqx.io'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `mqtt://${host}:${port}`
// mqtt://broker.emqx.io:1883
const client = mqtt.connect(connectUrl, {
  keepalive: 0,
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})
const topic = '/mqtt/traffic_logs'
client.on('connect', () => {
  console.log('Connected to mqtt')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
  client.publish(topic, '{"Server on" : "yes"}', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
})

client.on('message', (topic, payload) => {
  try {
    i = payload.toString();
    i = JSON.parse(i)
  } catch (e) {
    console.log("invalid input")
    return;
  }
  if (Object.keys(i).length === 0) {
    console.log('Received Message:', i);
  } else if (i.count_traffic_ == null) {
    console.log('Received Message:', i);
  }
  else {
    console.log('Received Message:', i);
    var sql = "INSERT INTO traffic_logs (count_traffic_, timeStamp) VALUES (" + i.count_traffic_ + ", CURRENT_TIMESTAMP)";
    con.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result.affectedRows + " record(s) updated");
    });
  }

})

// /mqtt/traffic_logs
// {"count_traffic_":5}

// /esp8266/states
// 1
// 2
// 3
