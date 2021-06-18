const fetch = require("node-fetch");

class Equip {
  constructor(id, name, posData, statusData) {
    this.id = id;
    this.name = name;
    this.posData = posData;
    this.statusData = statusData;
  }
}

class Value {
  constructor(timeStamp, value) {
    this.timeStamp = timeStamp;
    this.value = value;
  }
}

class Position {
  constructor(x, y, z, u, v, w, gripper, action) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.u = u;
    this.v = v;
    this.w = w;
    this.gripper = gripper;
    this.action = action;
  }
}

const makeMsg = (name, timeStamp, value) => {
  return {
    equip: new Equip(null, name, null, null),
    data: new Value(timeStamp, value),
  };
};

const res = [
  //RU->HOME
  makeMsg("Epson_Robot_System_01.Epson1_Axis_X", "1599802615999", "0.160"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Y", "1599802615999", "346.848"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802615999", "510.079"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_U", "1599802615999", "90.189"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_V", "1599802615999", "-0.223"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_W", "1599802615999", "-179.451"),

  //LU
  makeMsg("Epson_Robot_System_01.Epson1_Axis_X", "1599802617794", "-52.143"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Y", "1599802617794", "443.709"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802617794", "179.995"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_U", "1599802617794", "90.658"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_V", "1599802617794", "0.130"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_W", "1599802617794", "-179.150"),

  //LU->LDP
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802619994", "143.945"),

  //RDP->Gr_CLOSE
  makeMsg("Epson_Robot_System_01.Epson1_Gripper_Status", "1599802620994", "1"),

  //Gr_CLOSE->RU
  makeMsg("Epson_Robot_System_01.Epson1_Axis_X", "1599802621999", "49.640"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Y", "1599802621999", "443.551"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802621999", "179.995"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_U", "1599802621999", "90.250"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_V", "1599802621999", "0.167"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_W", "1599802621999", "-179.765"),

  //Ru->RDD
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802622994", "143.549"),

  //RDD->Gr_OPEN
  makeMsg("Epson_Robot_System_01.Epson1_Gripper_Status", "1599802623994", "0"),

  //Gr_OPEN->RU
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802624994", "179.995"),

  //RU->HOME
  makeMsg("Epson_Robot_System_01.Epson1_Axis_X", "1599802626999", "0.160"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Y", "1599802626999", "346.848"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_Z", "1599802626999", "510.079"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_U", "1599802626999", "90.189"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_V", "1599802626999", "-0.223"),
  makeMsg("Epson_Robot_System_01.Epson1_Axis_W", "1599802626999", "-179.451"),
];

// makeMsg("Epson_Robot_System_02.Epson2_Axis_X", "1599802617794", "58.284"),
// makeMsg("Epson_Robot_System_02.Epson2_Axis_Y", "1599802617794", "574.349"),
// makeMsg("Epson_Robot_System_02.Epson2_Axis_Z", "1599802617794", "-39.989"),
// makeMsg("Epson_Robot_System_02.Epson2_Axis_U", "1599802617794", "88.281"),

fetch("http://localhost:8080/api/test", {
  method: "POST",
  body: JSON.stringify(res),
  headers: {
    "Content-Type": "application/json",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
});
