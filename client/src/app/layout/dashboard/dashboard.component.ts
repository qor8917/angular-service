import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
} from "@angular/core";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-materials";
import "babylonjs-loaders";
import "babylonjs-gui";
import { DashboardService } from "../dashboard/dashboard-service.service";
import { CalculateService } from "../../utilities/calculate/calculate.service";
import { stringify } from "@angular/compiler/src/util";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private camera: BABYLON.ArcRotateCamera;
  public scene: BABYLON.Scene;

  private light1: any;
  private light2: any;
  private light3: any;
  private light4: any;

  @ViewChild("rendererCanvas", { static: true })
  public renderCanvas: ElementRef<HTMLCanvasElement>;

  private advancedTexture: any;
  private shadowGenerator: any;
  private highlightLayer: BABYLON.HighlightLayer = null;

  public guiStatus = true;
  public robots;
  public frames = {
    epson1: [],
    epson2: [],
    kuka: [],
    turntable: [],
  };
  private ms = 30;
  private callInterval = 250;

  private meshes: any = {};

  public myClass = ["side_bar"];

  private limit = 10000;

  private geoEpson1 = [
    [100, 0, 320],
    [0, 0, 250],
    [50, 0, 0],
    [200, 0, 0],
    [65, 0, 0],
  ];

  private geoKuka = [
    [-20, 0, 345],
    [0, 0, 260],
    [152, 0, 20],
    [108, 0, 0],
    [75, 0, 0],
  ];

  private libPath = "assets/libs/files/";

  constructor(
    private ngZone: NgZone,
    private DashboardService: DashboardService,
    private CalculateService: CalculateService
  ) {}

  ngOnInit(): void {
    this.renderModelNestfield();

    this.DashboardService.getRobots(
      // e2stop:1603957901746 e2active:1603957214742 e1stop:1603957104547 active1603954952327
      // "1603954952327@1603957901746@1603957915337@1603957902933"'

      // "1603954952327@1603957214742@1603953716121@1603956927737"

      "first" // "first" => 쌓여있는 데이터중에서 맨 뒤의 정보 가져옴
    ).subscribe((res) => {
      this.robots = res;
      this.addFrames(res, "f");
      this.animate();

      // 처음 first를 호출 하고 난 후 설정된 callInterval/ms 후부터 callInterval/ms마다 호출
      setTimeout(() => {
        setInterval(() => {
          this.DashboardService.getRobots(this.getDate()).subscribe((res) => {
            this.addFrames(res, "c");
            this.robots = res;
          });
        }, this.callInterval);
      }, this.callInterval);
    });
  }

  public handleGUIStatus() {
    this.guiStatus = !this.guiStatus;

    if (this.guiStatus === true)
      this.advancedTexture["_linkedControls"].forEach((control) => {
        control.isVisible = true;
        return;
      });

    if (this.guiStatus === false)
      this.advancedTexture["_linkedControls"].forEach((control) => {
        control.isVisible = false;
      });
  }

  // 기계 맨 마지막에 있는 date를 계산 => 이를 다시 서버로 보내 해당시간 이후 데이터를 가져올 것
  private getDate() {
    const e1Date = this.robots.epson1.posData[
      this.robots.epson1.posData.length - 1
    ].date;
    const e2Date = this.robots.epson2.posData[
      this.robots.epson2.posData.length - 1
    ].date;
    const kukaDate = this.robots.kuka.posData[
      this.robots.kuka.posData.length - 1
    ].date;
    const turntableData = this.robots.turntable.data[
      this.robots.turntable.data.length - 1
    ].date;

    return `${e1Date}@${e2Date}@${kukaDate}@${turntableData}`;
  }

  // 클라이언트에서 돌아가고있는 frame 어레이에 가져온 데이터를 push
  private addFrames(response, order) {
    const epson1Arr = response.epson1.posData.map((pos) => {
      return [
        ...this.CalculateService.calculateAngles(
          this.geoEpson1,
          pos.x,
          pos.y,
          pos.z,
          pos.u,
          pos.v,
          pos.w
        ).map((value) => (Math.PI / 180) * value),
        pos.gripper,
        pos.sensor,
        pos.x,
        pos.y,
        pos.z,
        pos.u,
        pos.v,
        pos.w,
      ];
    });

    const kukaArr = response.kuka.posData.map((pos) => {
      return [
        ...this.CalculateService.calculateAngles(
          this.geoKuka,
          pos.x,
          pos.y,
          pos.z,
          180, // => 180으로하면 정상
          pos.v,
          180 // => 180으로 하면 정상
        ).map((value) => (Math.PI / 180) * value),
        pos.gripper,
        pos.sensor,
        pos.x,
        pos.y,
        pos.z,
        180,
        pos.v,
        180,
      ];
    });

    const epson2Arr = response.epson2.posData.map((pos) => {
      return {
        ...this.CalculateService.calculate4robot(pos.x, pos.y, pos.z, pos.u),
        gripper: pos.gripper,
        sensor: pos.sensor,
        sX: pos.x,
        sY: pos.y,
        sZ: pos.z,
        sU: pos.u,
      };
    });

    if (order === "f") {
      this.frames.epson1.push(...epson1Arr);
      this.frames.epson2.push(...epson2Arr);
      this.frames.kuka.push(...kukaArr);
      this.frames.turntable.push(...response.turntable.data);
      return;
    }

    const checkDate = (name: string) => {
      if (name === "turntable")
        return (
          response[name].data[response[name].data.length - 1].date !==
          this.robots[name].data[this.robots[name].data.length - 1].date
        );

      return (
        response[name].posData[response[name].posData.length - 1].date !==
        this.robots[name].posData[this.robots[name].posData.length - 1].date
      );
    };

    if (checkDate("epson1")) this.frames.epson1.push(...epson1Arr);
    if (checkDate("epson2")) this.frames.epson2.push(...epson2Arr);
    if (checkDate("kuka")) this.frames.kuka.push(...kukaArr);
    if (checkDate("turntable"))
      this.frames.turntable.push(...response.turntable.data);

    return;
  }

  private preloadLib(scene: BABYLON.Scene) {
    BABYLON.SceneLoader.ImportMesh(
      "",
      this.libPath,
      "nestfield.glb",
      scene,
      async (newMeshes, particleSystems, skeletons) => {
        newMeshes.sort();

        // newMeshes.forEach((e, i) => console.log(e.name, i));

        // 테이블 바깥 오브젝트
        newMeshes.slice(41, 47).forEach((m) => {
          m.isVisible = false;
        });
        // 테이블 위 오브젝트(아래쪽 2개 제외)
        newMeshes.slice(4, 10).forEach((m) => (m.isVisible = false));

        // c4
        this.meshes.c4 = [];
        this.meshes.c4 = newMeshes.slice(12, 20);
        this.meshes.c4.push(newMeshes[0]);
        this.meshes.c4.forEach((m: BABYLON.AbstractMesh) => {
          m.rotation = new BABYLON.Vector3(-1.5708, 0, 0);
        });
        this.meshes.c4.forEach((m: BABYLON.AbstractMesh, i: number) => {
          if (i === this.meshes.c4.length - 1) {
            m.isVisible = false;
            return;
          }
          m.addChild(this.meshes.c4[i + 1]);
        });

        // kuka
        this.meshes.kuka = [];
        this.meshes.kuka = newMeshes.slice(22, 30);
        this.meshes.kuka.push(newMeshes[1]);

        this.meshes.kuka.forEach((m: BABYLON.AbstractMesh, i) => {
          m.rotation = new BABYLON.Vector3(-1.5708, 0, 0);
        });
        this.meshes.kuka.forEach((m: BABYLON.AbstractMesh, i: number) => {
          if (i === this.meshes.kuka.length - 1) {
            m.isVisible = false;
            return;
          }
          m.addChild(this.meshes.kuka[i + 1]);
        });

        // scara
        this.meshes.scara = [];
        this.meshes.scara = newMeshes.slice(35, 41);
        this.meshes.scara.push(newMeshes[34]);

        this.meshes.scara.forEach((m: BABYLON.AbstractMesh) => {
          m.rotation = new BABYLON.Vector3(-1.5708, 0, 0);
        });
        this.meshes.scara.forEach((m: BABYLON.AbstractMesh, i: number) => {
          if (i === this.meshes.scara.length - 1) {
            m.isVisible = false;
            return;
          }
          m.addChild(this.meshes.scara[i + 1]);
        });

        // turntable
        this.meshes.turntable = [];
        this.meshes.turntable.push(newMeshes[20], ...newMeshes.slice(2, 4));

        this.meshes.turntable.forEach((m: BABYLON.AbstractMesh, i: number) => {
          if (i === 0) {
            m.rotation = new BABYLON.Vector3(-1.5708, 0, 0);
            return;
          }

          // 오른쪽 물체 안보이게(초기설정이 원래 왼쪽에 물체가 존재)
          if (i === this.meshes.turntable.length - 1) m.isVisible = false;

          this.meshes.turntable[0].addChild(m);
        });

        //물체 위치조정
        this.meshes.kuka[0].position = new BABYLON.Vector3(
          0.661699938774109,
          0.990899920463562,
          -0.000549999997019768
        );
        newMeshes[32].position = new BABYLON.Vector3(
          0.661699938774109 + 0.040600061416626,
          0.990899920463562 - 0.183149933815002,
          -0.000549999997019768 - 0.000150000676513
        );
        newMeshes[31].position = new BABYLON.Vector3(
          -0.605800033569336 - 0.040099918842316,
          1.0141499042511 - 0.20639991760254,
          -0.003 - 0.000800000503659
        );
        this.meshes.c4[0].position = new BABYLON.Vector3(
          -0.605800033569336,
          1.0141499042511,
          -0.003
        );
        this.meshes.scara[0].position = new BABYLON.Vector3(
          -0.0120000018402934,
          1.07375001907349,
          0.737450003623962
        );

        this.makeBox(this.meshes.c4[0], false, "Epson1_C4");
        this.makeBox(this.meshes.scara[0], false, "Epson2_Scara");
        this.makeBox(this.meshes.kuka[0], false, "Kuka");
        this.makeBox(this.meshes.turntable[0], true, "Turntable");
      }
    );
  }

  public toggle() {
    this.myClass.push("toggle");
  }

  public close() {
    if (this.myClass.find((c) => c === "toggle"))
      this.myClass = this.myClass.filter((c) => c != "toggle");
    return;
  }

  private setTurntableObjV(
    sensorValue: string,
    turntableMesh: BABYLON.AbstractMesh[]
  ): void {
    if (sensorValue === null) return;
    const res = sensorValue;

    const left = parseInt(res[res.length - 2]);
    const right = parseInt(res[res.length - 1]);

    //left mesh
    if (turntableMesh[1].isVisible !== !!left)
      turntableMesh[1].isVisible = !!left;

    //right mesh
    if (turntableMesh[2].isVisible !== !!right)
      turntableMesh[2].isVisible = !!right;

    return;
  }

  private checkObjectNull(sensorValue: string, gripperValue: string) {
    if (sensorValue === null) return;

    const res = sensorValue;

    const left = parseInt(res[res.length - 2]);
    const right = parseInt(res[res.length - 1]);

    if (left === 0 && right === 0 && +gripperValue === 0) {
      return true;
    }

    return false;
  }

  private animate() {
    let e1Idx = 0;

    setInterval(() => {
      if (e1Idx === this.frames.epson1.length) {
        if (this.frames.epson1.length >= this.limit) {
          const reserved = this.frames.epson1.slice(
            this.limit,
            this.frames.epson1.length
          );
          this.frames.epson1 = reserved;
          e1Idx = 0;
          return;
        }
        return;
      }

      if (!this.meshes.c4) return;
      this.meshes["c4"][1].rotation.z = -1.5807 + this.frames.epson1[e1Idx][0];
      this.meshes["c4"][2].rotation.y = this.frames.epson1[e1Idx][1];
      this.meshes["c4"][3].rotation.y = this.frames.epson1[e1Idx][2];
      this.meshes["c4"][4].rotation.x = this.frames.epson1[e1Idx][3];
      this.meshes["c4"][5].rotation.y = this.frames.epson1[e1Idx][4];
      this.meshes["c4"][6].rotation.x = this.frames.epson1[e1Idx][5];

      const toolVisibility = this.frames.epson1[e1Idx][6];

      if (
        this.checkObjectNull(this.frames.epson1[e1Idx][7], toolVisibility) ===
        false
      ) {
        if (toolVisibility == "1")
          this.meshes.c4[this.meshes.c4.length - 1].isVisible = true;
        if (toolVisibility == "0")
          this.meshes.c4[this.meshes.c4.length - 1].isVisible = false;

        this.setTurntableObjV(
          this.frames.epson1[e1Idx][7],
          this.meshes.turntable
        );
      }

      this.updateGUI("epson1", this.frames.epson1[e1Idx]);

      e1Idx++;
    }, this.ms);

    let kIdx = 0;
    setInterval(() => {
      if (kIdx === this.frames.kuka.length) {
        if (this.frames.kuka.length >= this.limit) {
          const reserved = this.frames.kuka.slice(
            this.limit,
            this.frames.kuka.length
          );
          this.frames.kuka = reserved;
          kIdx = 0;
          return;
        }

        return;
      }

      if (!this.meshes.kuka) return;

      this.meshes["kuka"][1].rotation.z = this.frames.kuka[kIdx][0];
      this.meshes["kuka"][2].rotation.y = -this.frames.kuka[kIdx][1];
      this.meshes["kuka"][3].rotation.y = -this.frames.kuka[kIdx][2];
      this.meshes["kuka"][4].rotation.x = -this.frames.kuka[kIdx][3];
      this.meshes["kuka"][5].rotation.y = -this.frames.kuka[kIdx][4];
      this.meshes["kuka"][6].rotation.x = -this.frames.kuka[kIdx][5];

      const toolVisibility = this.frames.kuka[kIdx][6];

      if (
        this.checkObjectNull(this.frames.kuka[kIdx][7], toolVisibility) ===
        false
      ) {
        if (toolVisibility == "1")
          this.meshes.kuka[this.meshes.kuka.length - 1].isVisible = true;
        if (toolVisibility == "0")
          this.meshes.kuka[this.meshes.kuka.length - 1].isVisible = false;

        this.setTurntableObjV(this.frames.kuka[kIdx][7], this.meshes.turntable);
      }

      this.updateGUI("kuka", this.frames.kuka[kIdx]);

      kIdx++;
    }, this.ms);

    let e2Idx = 0;
    setInterval(() => {
      if (e2Idx === this.frames.epson2.length) {
        if (this.frames.epson2.length >= this.limit) {
          const reserved = this.frames.epson2.slice(
            this.limit,
            this.frames.epson2.length
          );
          this.frames.epson2 = reserved;
          e2Idx = 0;
          return;
        }
        return;
      }

      if (!this.meshes.scara) return;

      this.meshes["scara"][1].rotation.z =
        -1.5807 + this.frames.epson2[e2Idx].theta1 * (Math.PI / 180);
      this.meshes["scara"][2].rotation.z =
        this.frames.epson2[e2Idx].theta2 * (Math.PI / 180);
      this.meshes["scara"][3].position.z =
        this.frames.epson2[e2Idx].z * 0.000011620185923 + 0.00132620185923;
      this.meshes["scara"][4].rotation.z =
        this.frames.epson2[e2Idx].theta3 * (Math.PI / 180);

      const toolVisibility = this.frames.epson2[e2Idx].gripper;

      if (
        this.checkObjectNull(
          this.frames.epson2[e2Idx].sensor,
          toolVisibility
        ) === false
      ) {
        if (toolVisibility == "1")
          this.meshes.scara[this.meshes.scara.length - 1].isVisible = true;
        if (toolVisibility == "0")
          this.meshes.scara[this.meshes.scara.length - 1].isVisible = false;

        if (this.frames.epson2[e2Idx].sensor !== null) {
          this.setTurntableObjV(
            this.frames.epson2[e2Idx].sensor,
            this.meshes.turntable
          );
        }
      }

      this.updateGUI("epson2", this.frames.epson2[e2Idx]);

      e2Idx++;
    }, this.ms);

    let tIdx = 0;

    setInterval(() => {
      if (tIdx === this.frames.turntable.length) {
        if (this.frames.turntable.length >= this.limit) {
          const reserved = this.frames.turntable.slice(
            this.limit,
            this.frames.turntable.length
          );
          this.frames.turntable = reserved;
          tIdx = 0;
          return;
        }
        return;
      }

      if (!this.meshes.turntable) return;

      if (
        this.frames.turntable[tIdx].location * Math.PI * 2 !==
        this.meshes.turntable[0].rotation.y
      )
        this.meshes.turntable[0].rotation.y =
          this.frames.turntable[tIdx].location * Math.PI * 2;

      this.updateGUI("turntable", this.frames.turntable[tIdx]);

      tIdx++;
    }, this.ms);
  }

  private updateGUI(name: string, res) {
    const GUI = this.advancedTexture._linkedControls;

    if (res.length === 0) return;
    if (!GUI.length) return;

    let target;
    if (name === "epson1") target = 0;
    if (name === "epson2") target = 1;
    if (name === "kuka") target = 2;
    if (name === "turntable") target = 3;

    //epson2
    if (target === 1) {
      GUI[target]._children[3].text = `Axis_X: ${res.sX}`;
      GUI[target]._children[4].text = `Axis_Y: ${res.sY}`;
      GUI[target]._children[5].text = `Axis_Z: ${res.sZ}`;
      GUI[target]._children[6].text = `Axis_U: ${res.sU}`;
      GUI[target]._children[7].text = `Sensor: ${res.sensor}`;
      GUI[target]._children[8].text = `Gripper_Status: ${res.gripper}`;
      return;
    }

    //turntable 3~6 e1,e2,kuka,command
    if (target === 3) {
      GUI[target]._children[3].text = `Epson1_Status: ${res.epson1}`;
      GUI[target]._children[4].text = `Epson2_Status: ${res.epson2}`;
      GUI[target]._children[5].text = `Kuka_Status: ${res.kuka}`;
      GUI[target]._children[6].text = `Start_Command: ${res.startCommand}`;
      return;
    }

    //kuka & epson1
    GUI[target]._children[3].text = `Axis_X: ${res[8]}`;
    GUI[target]._children[4].text = `Axis_Y: ${res[9]}`;
    GUI[target]._children[5].text = `Axis_Z: ${res[10]}`;
    GUI[target]._children[6].text = `Axis_U: ${res[11]}`;
    GUI[target]._children[7].text = `Axis_V: ${res[12]}`;
    GUI[target]._children[8].text = `Axis_W: ${res[13]}`;
    GUI[target]._children[9].text = `Sensor: ${res[7]}`;
    GUI[target]._children[10].text = `Gripper_Status: ${res[6]}`;
  }

  private makeBox(
    mesh: BABYLON.AbstractMesh,
    isTurntable: boolean,
    meshName: string
  ) {
    const w = "250px";
    const h = "250px";
    const container = new GUI.Rectangle();

    container.height = h;
    container.width = w;
    this.advancedTexture.addControl(container);
    container.thickness = 0;

    const panelImg = new GUI.Image("pannel", "./assets/imgs/gui.png");
    panelImg.height = h;
    panelImg.width = w;
    panelImg.alpha = 0.7;

    const equipName = new GUI.TextBlock("name");
    equipName.text = meshName;
    equipName.top = "-40%";
    equipName.color = "white";
    equipName.fontSize = "25px";

    const infoLabel = new GUI.TextBlock("infoLabel");
    infoLabel.text = "Robot Administration Shell";
    infoLabel.top = "-30%";
    infoLabel.color = "white";
    infoLabel.fontSize = "13px";

    let labels = [
      "Axis_X",
      "Axis_Y",
      "Axis_Z",
      "Axis_U",
      "Axis_V",
      "Axis_W",
      "Sensor",
      "Gripper_Status",
    ];

    if (isTurntable === true) {
      labels = [
        "Epson1_Status",
        "Epson2_Status",
        "Kuka_Status",
        "Start_Command",
      ];
    }

    if (meshName === "Epson2_Scara") {
      labels = [
        "Axis_X",
        "Axis_Y",
        "Axis_Z",
        "Axis_U",
        "Sensor",
        "Gripper_Status",
      ];
    }

    labels.forEach((label, i) => {
      const l = new GUI.TextBlock(label);
      l.text = `${label}: `;
      let top = -45 + i * 22;

      if (isTurntable === true) top = -45 + i * 25;
      l.top = top;
      l.color = "black";
      l.alpha = 0.8;
      l.zIndex = 10;
      l.left = "20%";
      l.fontSize = "13px";

      l.textHorizontalAlignment = 0;

      container.addControl(l);
    });

    container.addControl(panelImg);
    container.addControl(equipName);
    container.addControl(infoLabel);

    container.linkWithMesh(mesh);
    container.linkOffsetY = -100;
    if (isTurntable === true) {
      container.linkOffsetY = 250;
    }
  }

  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////필요없는부분 접어두기////////////////////////////
  /////////////////////////////////////////////////////////////////////////

  private showAxis(size) {
    var axisX = BABYLON.Mesh.CreateLines(
      "axisX",
      [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, -0.05 * size, 0),
      ],
      this.scene
    );
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = this.makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines(
      "axisY",
      [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(0.05 * size, size * 0.95, 0),
      ],
      this.scene
    );
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = this.makeTextPlane("Z", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines(
      "axisZ",
      [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, 0.05 * size, size * 0.95),
      ],
      this.scene
    );
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = this.makeTextPlane("Y", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
  }
  private makeTextPlane(text, color, size) {
    var dynamicTexture = new BABYLON.DynamicTexture(
      "DynamicTexture",
      50,
      this.scene,
      true
    );
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(
      text,
      5,
      40,
      "bold 36px Arial",
      color,
      "transparent",
      true
    );
    let plane = BABYLON.Mesh.CreatePlane("TextPlane", size, this.scene, true);
    let planeMaterial = new BABYLON.StandardMaterial(
      "TextPlaneMaterial",
      this.scene
    );
    planeMaterial.backFaceCulling = false;
    planeMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    planeMaterial.diffuseTexture = dynamicTexture;

    plane.material = planeMaterial;

    return plane;
  }

  private defaultCameraSet() {
    this.camera.wheelPrecision = 3;
    this.camera.pinchPrecision = 3;
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 60;
    //this.camera.useAutoRotationBehavior = true;
    this.camera.attachControl(this.canvas, true);
    this.camera.target.y = 2.5;
    this.camera.target.z = -2;
    this.camera.setPosition(new BABYLON.Vector3(-20, 0, 20));
    this.camera.beta = (Math.PI / 180) * 60;
  }

  private renderModelNestfield(): void {
    this.canvas = null;
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.light1 = null;
    this.canvas = this.renderCanvas.nativeElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1);

    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.highlightLayer = new BABYLON.HighlightLayer(
      "highlightLayer",
      this.scene
    );
    this.highlightLayer.outerGlow = false;
    this.highlightLayer.innerGlow = true;

    // Camera 세팅
    this.configureCamera();

    // light 세팅
    this.configureLight();

    this.preloadLib(this.scene);

    this.show();
  }

  private show(): void {
    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = () => {
        this.scene.render();
      };
      if (document.readyState !== "loading") {
        this.engine.runRenderLoop(rendererLoopCallback);
      } else {
        window.addEventListener("DOMContentLoaded", () => {
          this.engine.runRenderLoop(rendererLoopCallback);
        });
      }

      window.addEventListener("resize", () => {
        this.engine.resize();
      });
    });
  }

  private configureCamera() {
    this.camera = new BABYLON.ArcRotateCamera(
      "BasicCamera",
      0,
      0,
      1,
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );

    this.camera.wheelPrecision = 20;
    this.camera.pinchPrecision = 5;
    this.camera.lowerRadiusLimit = 1.5;
    this.camera.upperRadiusLimit = 5;
    //this.camera.useAutoRotationBehavior = true;
    //this.camera.autoRotationBehavior.idleRotationWaitTime = 30000;
    this.camera.attachControl(this.canvas, true);
    //this.camera.autoRotationBehavior.idleRotationSpeed = 0.01;

    this.camera.setPosition(new BABYLON.Vector3(0, 2, -2));
    //this.camera.beta = (Math.PI / 180) * 60;
  }

  private configureLight() {
    this.light1 = new BABYLON.DirectionalLight(
      "DirectionalLight",
      new BABYLON.Vector3(200, -200, -200),
      this.scene
    );
    this.light2 = new BABYLON.DirectionalLight(
      "DirectionalLight",
      new BABYLON.Vector3(-200, -200, -200),
      this.scene
    );
    this.light3 = new BABYLON.DirectionalLight(
      "DirectionalLight",
      new BABYLON.Vector3(200, -200, 200),
      this.scene
    );
    this.light4 = new BABYLON.DirectionalLight(
      "DirectionalLight",
      new BABYLON.Vector3(-200, -200, 200),
      this.scene
    );

    this.shadowGenerator = new BABYLON.ShadowGenerator(4096, this.light3);

    this.light1.intensity = 1.5;
    this.light2.intensity = 1.5;
    this.light3.intensity = 1.5;
    this.light4.intensity = 1.5;

    //this.light1.intensity = 0.5;
  }
}
