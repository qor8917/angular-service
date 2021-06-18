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
import { Material, AsyncLoop } from "babylonjs";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DashboardService } from "../dashboard/dashboard-service.service";
import { CalculateService } from "../../utilities/calculate/calculate.service";
import { BoundDirectivePropertyAst } from "@angular/compiler";
import { async } from "rxjs/internal/scheduler/async";

@Component({
  selector: "app-dashboard-test",
  templateUrl: "./dashboard-test.component.html",
  styleUrls: ["./dashboard-test.component.css"],
})
export class DashboardTestComponent implements OnInit {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private camera: BABYLON.ArcRotateCamera;
  public scene: BABYLON.Scene;
  private material;

  private light1: any;
  private light2: any;
  private light3: any;
  private light4: any;

  @ViewChild("rendererCanvas", { static: true })
  public renderCanvas: ElementRef<HTMLCanvasElement>;

  private allLoaded: number = 0;
  private level: number;

  private advancedTexture: any;
  private shadowGenerator: any;
  private highlightLayer: BABYLON.HighlightLayer = null;

  private meshesAtLevel: any = {};

  /*
    geo 건들지 말것..!
  */
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
  // private geoKuka = [
  //   [-132, 0, 460],
  //   [0, 0, 260],
  //   [152, 0, 20],
  //   [108, 0, 0],
  //   [75, 0, 0],
  // ];

  private libPath = "assets/libs/files/";

  private testArray;

  private epson6animation = [];

  private epson4animation = [];

  private kukaAnimation = [];

  constructor(
    private ngZone: NgZone,
    private DashboardService: DashboardService,
    private CalculateService: CalculateService
  ) {}

  ngOnInit(): void {
    this.renderModelNestfield();
  }

  //epson1 mokupvalue 6축임
  private mokupValue = [
    //x,y,z,u,v,w
    //[0.160,346.848,510.079,90.189,-0.233,-179.451],
    [-52.143, 443.709, 143.565, 90.658, 0.13, -179.15],
    [-52.143, 443.709, 143.945, 90.658, 0.13, -179.15],
    [-53.873, 443.551, 179.868, 90.249, 0.167, -179.764],
    [49.64, 443.551, 143.549, 90.25, 0.167, -179.765],
    [49.64, 443.552, 143.782, 90.25, 0.167, -179.765],
    [0.16, 346.848, 510.079, 90.189, -0.223, -179.451],
    [0.16, 346.848, 510.079, 90.189, -0.223, -179.451],
    [49.64, 443.551, 179.995, 90.189, 0.167, -179.765],
    [-52.143, 443.709, 145.662, 90.189, 0.13, -179.15],
  ];

  //glb 파일 불러오는거 epson1
  private preloadLib(scene: BABYLON.Scene) {
    BABYLON.SceneLoader.ImportMesh(
      "",
      this.libPath,
      "nest_C4_601.glb",
      scene,
      async (newMeshs, particleSystems, skeletons) => {
        this.meshesAtLevel[0] = {};
        this.meshesAtLevel[0]["root"] = newMeshs[0];
        this.meshesAtLevel[0]["root"].setEnabled(true);

        newMeshs.forEach((mesh) => {
          if (newMeshs.indexOf(mesh) !== 7) {
            //현재 7번 라이브러리가 최하단 몸통(움직이지 않고 고정되어있는부분)인데
            //부분을 아래와 같이 null로 해주지 않으면 각도 변환에 문제가 있음
            mesh.rotationQuaternion = null;
            console.log(mesh.getAbsolutePivotPoint());
          }
          // 현재 라이브러리 순서가 맞지 않아서 아래를 참고하여 작업 진행 해야함.
          // c4_node0 = 7
          // c4_node1 = 1
          // c4_node2 = 2
          // c4_node3 = 4
          // c4_node4 = 3
          // c4_node2 = 6
          // c4_node6 = 5
        });

        /*
          각 모듈의 피봇 포인트(각 매쉬가 회전하는 포인트)는 라이브러리에서 지정되어서 오기때문에
          setpivotpoint는 하지 않아도 됨. 하지만 매쉬를 넣으면 연결 되어 있지 않고
          90도로 눕혀져 있는 상태로 오기 때문에 각 매쉬를 -1.5708(90도) 라디안 값으로 세워 주는 부분. 
        */
        newMeshs[7].rotation = new BABYLON.Vector3(-1.5708, 0, 0);
        newMeshs[1].rotation = new BABYLON.Vector3(-1.5708, 0, 0); //node1
        newMeshs[2].rotation = new BABYLON.Vector3(-1.5708, 0, 0); //node2
        newMeshs[4].rotation = new BABYLON.Vector3(-1.5708, 0, 0); //node3
        newMeshs[3].rotation = new BABYLON.Vector3(-1.5708, 0, 0); //node4
        newMeshs[6].rotation = new BABYLON.Vector3(-1.5708, 0, 0); //node5
        newMeshs[5].rotation = new BABYLON.Vector3(-1.5708, 0, 0); //node6

        /*
          각 매쉬의 부모 자식 관계를 설정하는 부분
                                  부모===>자식 순서
          순서대로 해야한다. ex) body(부모)=>arm1(자식/부모)=>arm2(자식/부모)=>...
          부모 자식 관계를 설정하는 부분의 위치도 중요하다.(애니메이션 작업을 하기 전에 해야함)
        */

        newMeshs[7].addChild(newMeshs[1]);
        //newMeshs[7].position = new BABYLON.Vector3(-1,0,0);
        newMeshs[1].addChild(newMeshs[2]);
        newMeshs[2].addChild(newMeshs[4]);
        newMeshs[4].addChild(newMeshs[3]);
        newMeshs[3].addChild(newMeshs[6]);
        newMeshs[6].addChild(newMeshs[5]);

        //부모 자식 관계 설정을 완료하면 7번 매쉬(바디)만 움직여도 모두 함께 움직인다.
        //턴테이블과 각 로봇의 위치를 파악하여 길이에 맞게 설정해 주면 된다.
        //현재는 임의의 값임.

        newMeshs[7].translate(new BABYLON.Vector3(1, 0, 0), -0.0065);

        //애니메이션 부분 백엔드로 코드를 옮겨야 할 수도 있음.
        const arr = this.mokupValue.map((set) =>
          this.CalculateService.calculateAngles(
            this.geoEpson1,
            set[0],
            set[1],
            set[2],
            set[3],
            set[4],
            set[5]
          ).map((value) => (Math.PI / 180) * value)
        );
        //시작 좌표와 목적지 좌표 사이의 값을 얼마나 나눌지에 대한 셋팅
        const multiply = 200;
        for (let i = 0; i < arr.length - 1; i++) {
          const x1 = arr[i][0];
          const x2 = arr[i + 1][0];
          const y1 = arr[i][1];
          const y2 = arr[i + 1][1];
          const z1 = arr[i][2];
          const z2 = arr[i + 1][2];
          const u1 = arr[i][3];
          const u2 = arr[i + 1][3];
          const v1 = arr[i][4];
          const v2 = arr[i + 1][4];
          const w1 = arr[i][5];
          const w2 = arr[i + 1][5];
          for (let j = 0; j < multiply; j++) {
            const x3 = ((x2 - x1) / multiply) * j + x1;
            const y3 = ((y2 - y1) / multiply) * j + y1;
            const z3 = ((z2 - z1) / multiply) * j + z1;
            const u3 = ((u2 - u1) / multiply) * j + u1;
            const v3 = ((v2 - v1) / multiply) * j + v1;
            const w3 = ((w2 - w1) / multiply) * j + w1;
            this.epson6animation.push({
              x: x3,
              y: y3,
              z: z3,
              u: u3,
              v: v3,
              w: w3,
            });
          }
        }

        //결국에 가변적으로 늘어나니까 idx에 대한 처리가 필요 할 것으로 생각됨.

        /*
          *****epson6animation****
          애니메이션 부분. interval의 ms로 조절하면 되고,
          각 축마다 회전하는 부분이 다르다.(90도,360도)
          그럼으로 로테이션 셋팅하는 부분도 x,y,z 다르기 때문에
          각 매쉬별로 맞게 설정해주면 된다.
        */
        let idx;
        setInterval(() => {
          //console.log(this.epson6animation[idx]);
          newMeshs[1].rotation.z = -1.5807 + this.epson6animation[idx].x;
          newMeshs[2].rotation.y = this.epson6animation[idx].y;
          newMeshs[4].rotation.y = this.epson6animation[idx].z;
          newMeshs[3].rotation.x = this.epson6animation[idx].u;
          newMeshs[6].rotation.y = this.epson6animation[idx].v;
          newMeshs[5].rotation.x = this.epson6animation[idx].w;
          idx++;
          if (idx === this.epson6animation.length) {
            idx = 0;
          }
        }, 3);
      }
    );
  }

  private makeMessageBox() {
    const container = new GUI.Rectangle();
    container.cornerRadius = 1;
    container.color = "#939393";
    container.thickness = 0;
  }

  private renderModelNestfield(): void {
    this.level = this.level;
    this.canvas = null;
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.light1 = null;
    this.canvas = this.renderCanvas.nativeElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);

    this.highlightLayer = new BABYLON.HighlightLayer(
      "highlightLayer",
      this.scene
    );
    this.highlightLayer.outerGlow = false;
    this.highlightLayer.innerGlow = true;

    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Camera 세팅
    this.configureCamera(1, 1);

    // light 세팅
    this.configureLight();

    this.turnTable();

    this.preloadLib(this.scene);

    this.scara();

    this.kuka();

    this.show();
    //this.showAxis(2);
    //this.localAxes(2);
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

  private configureCamera(prev: number, next: number) {
    if (!this.camera) {
      this.camera = new BABYLON.ArcRotateCamera(
        "BasicCamera",
        0,
        0,
        1,
        new BABYLON.Vector3(0, 0, 0),
        this.scene
      );
      //처음 카메라 위치
      // this.camera.setPosition(new BABYLON.Vector3(0, 77, -77));
      // this.camera.wheelPrecision = 3; // dr = 30 / wP
      // this.camera.pinchPrecision = 3; // NOT
      // this.camera.lowerRadiusLimit = 90;
      // this.camera.upperRadiusLimit = 120;
    }
    if (next === 1) {
      this.camera.wheelPrecision = 20;
      this.camera.pinchPrecision = 5;
      this.camera.lowerRadiusLimit = 1.5;
      this.camera.upperRadiusLimit = 5;
      //this.camera.useAutoRotationBehavior = true;
      //this.camera.autoRotationBehavior.idleRotationWaitTime = 30000;
      this.camera.attachControl(this.canvas, true);
      //this.camera.autoRotationBehavior.idleRotationSpeed = 0.01;
      this.camera.target.y = 0.3;
      //this.camera.target.z = -2;
      this.camera.setPosition(new BABYLON.Vector3(0, 0.5, 1));
      //this.camera.beta = (Math.PI / 180) * 60;
    } else if (next === 2) {
      this.camera.wheelPrecision = 10;
      this.camera.pinchPrecision = 10;
      this.camera.lowerRadiusLimit = 5;
      this.camera.upperRadiusLimit = 20;
      this.camera.useAutoRotationBehavior = false;
      this.camera.target.y = 2;
      this.camera.target.z = 0;
      this.camera.setPosition(new BABYLON.Vector3(0, 0, 0));
    }
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

    this.light1.intensity = 1;
    this.light2.intensity = 1;
    this.light3.intensity = 1.5;
    this.light4.intensity = 1.5;

    //this.light1.intensity = 0.5;
  }

  /*
    kuka 로봇 박스로 만드는 함수.
    라이브러리는 위치가 잡혀서 오기 때문에
    position이나 translate를 사용 할 일이 없지만,
    만약 위치를 조정할 일이 있다면 되도록이면 translate를 사용해서 움직여 줘야 한다.
    각도를 움직일 필요가 있다면 해당 매쉬의 길이의 반만큼 설정해 주면 된다.
  */
  private kuka() {
    let baseMat = new BABYLON.StandardMaterial("mat", this.scene);
    baseMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    let baseColor = new Array(6);
    baseColor[4] = new BABYLON.Color3(0.5, 0.5, 0.5);

    let base = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 1.7 * 0.1,
        depth: 1 * 0.1,
        width: 1.4 * 0.1,
        faceColors: baseColor,
      },
      this.scene
    );

    base.material = baseMat;
    // base 박스의 높이가 1.7 이므로 피봇 포인트는 가운데 지점인 0.85에 설정된다.
    // 그러므로 -0.85 를 해주면 피봇 포인트가 바닥으로 내려가게 된다.
    base.setPivotPoint(new BABYLON.Vector3(0, -0.85 * 0.1, 0));

    // 매쉬를 생성하면 매쉬의 가운데 부분이 0,0,0 으로 설정되어 생성된다. 따라서 높이부터 조절해준다.
    // 피봇포인트와 마찬가지로 1.7이므로 0.85를 올려주면 된다.
    // 현재 0.1을 곱하는 것은 제작된 라이브러리가 작아서 맞추기 위해서 모두 0.1을 곱하고 있다.
    base.translate(new BABYLON.Vector3(0, 1, 0), 0.85 * 0.1);

    let arm1Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm1Mat.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.5);
    let amr1Color = new Array(6);
    amr1Color[4] = new BABYLON.Color3(0.7, 0.5, 0.5);

    let arm1 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 1.7 * 0.1,
        depth: 1 * 0.1,
        width: 1.4 * 0.1,
        faceColors: amr1Color,
      },
      this.scene
    );
    arm1.material = arm1Mat;

    // 마찬가지로 피봇포인트를 해당 매쉬 높이의 맞게 설정하고
    arm1.setPivotPoint(new BABYLON.Vector3(0, -0.85 * 1, 0));
    // 트랜스 레이트를 하여 높여주고
    arm1.translate(new BABYLON.Vector3(0, 1, 0), 0.85 * 0.1);
    // arm1은 base의 자식이 됨으로 base의 높이만큼 다시 올려준다
    arm1.translate(new BABYLON.Vector3(0, 1, 0), 1.7 * 0.1);
    // 그리고 로봇의 모양과 비슷하게 만들기 위해서 x좌표를 수정함.
    arm1.translate(new BABYLON.Vector3(-1, 0, 0), 0.2 * 0.1);

    base.addChild(arm1);
    //arm1.rotation.y=0.5;

    //다른 mesh들도 이런식으로 높이를 높여주고, 부모의 높이만큼 다시 올려줘야 한다.

    let arm2Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm2Mat.diffuseColor = new BABYLON.Color3(0.9, 0.5, 0.5);
    let amr2Color = new Array(6);
    amr2Color[4] = new BABYLON.Color3(0.9, 0.5, 0.5);

    let arm2 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 2.6 * 0.1,
        depth: 0.5 * 0.1,
        width: 0.5 * 0.1,
        faceColors: amr2Color,
      },
      this.scene
    );
    arm2.material = arm2Mat;

    arm2.setPivotPoint(new BABYLON.Vector3(0, -1.3 * 0.1, 0));
    arm2.translate(new BABYLON.Vector3(0, 1, 0), 1.3 * 0.1);
    arm2.translate(new BABYLON.Vector3(0, 1, 0), (1.7 + 1.7) * 0.1);
    arm2.translate(new BABYLON.Vector3(-1, 0, 0), 0.4 * 0.1);

    arm1.addChild(arm2);

    let arm3Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm3Mat.diffuseColor = new BABYLON.Color3(1.1, 0.6, 0.5);
    let amr3Color = new Array(6);
    amr3Color[4] = new BABYLON.Color3(1.1, 0.6, 0.5);

    let arm3 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 0.5 * 0.1,
        depth: 0.5 * 0.1,
        width: 1.5 * 0.1,
        faceColors: amr3Color,
      },
      this.scene
    );
    arm3.material = arm3Mat;

    arm3.setPivotPoint(new BABYLON.Vector3(0.75 * 0.1, 0, 0));
    arm3.translate(new BABYLON.Vector3(0, 1, 0), 0.25 * 0.1);
    arm3.translate(new BABYLON.Vector3(0, 1, 0), (1.7 + 1.7 + 2.6) * 0.1);
    arm3.translate(new BABYLON.Vector3(-1, 0, 0), 1 * 0.1);

    arm2.addChild(arm3);

    let arm4Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm4Mat.diffuseColor = new BABYLON.Color3(1.4, 0.7, 0.5);
    let amr4Color = new Array(6);
    amr4Color[4] = new BABYLON.Color3(1.4, 0.7, 0.5);

    let arm4 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 0.5 * 0.1,
        depth: 0.4 * 0.1,
        width: 1.5 * 0.1,
        faceColors: amr4Color,
      },
      this.scene
    );
    arm4.material = arm4Mat;

    arm4.setPivotPoint(new BABYLON.Vector3(0.75 * 0.1, 0, 0));
    arm4.translate(new BABYLON.Vector3(0, 1, 0), 0.25 * 0.1);
    arm4.translate(new BABYLON.Vector3(0, 1, 0), (1.7 + 1.7 + 2.6) * 0.1);
    arm4.translate(new BABYLON.Vector3(-1, 0, 0), 2.5 * 0.1);

    arm3.addChild(arm4);

    let arm5Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm5Mat.diffuseColor = new BABYLON.Color3(1.6, 0.8, 0.5);
    let amr5Color = new Array(6);
    amr5Color[4] = new BABYLON.Color3(1.6, 0.8, 0.5);

    let arm5 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 0.5 * 0.1,
        depth: 0.3 * 0.1,
        width: 0.9 * 0.1,
        faceColors: amr5Color,
      },
      this.scene
    );
    arm5.material = arm5Mat;
    arm5.setPivotPoint(new BABYLON.Vector3(0.45 * 0.1, 0, 0));
    arm5.translate(new BABYLON.Vector3(0, 1, 0), 0.25 * 0.1);
    arm5.translate(new BABYLON.Vector3(0, 1, 0), (1.7 + 1.7 + 2.6) * 0.1);
    arm5.translate(new BABYLON.Vector3(-1, 0, 0), 3.5 * 0.1);
    arm4.addChild(arm5);

    //arm5.rotation.z=1;

    let arm6Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm6Mat.diffuseColor = new BABYLON.Color3(2.2, 0.9, 0.6);
    let amr6Color = new Array(6);
    amr6Color[4] = new BABYLON.Color3(2.2, 0.9, 0.6);

    let arm6 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 0.3 * 0.1,
        depth: 0.3 * 0.1,
        width: 0.3 * 0.1,
        faceColors: amr6Color,
      },
      this.scene
    );
    arm6.material = arm6Mat;

    arm6.translate(new BABYLON.Vector3(0, 1, 0), 0.15 * 0.1);
    arm6.translate(new BABYLON.Vector3(0, 1, 0), (1.7 + 1.7 + 2.6 + 0.1) * 0.1);
    arm6.translate(new BABYLON.Vector3(-1, 0, 0), 4.1 * 0.1);

    arm5.addChild(arm6);

    base.translate(new BABYLON.Vector3(-1, 0, 0), -0.7);

    // const kukaTestArray = [
    //   // ==> 초기 설정 및 실행대기 상태
    //   //home
    //   [355, 0, 625, 0, 90, 0],
    //   //P34
    //   [280.01, 0.0, 550.0, -180.0, 0.0, 180.0],
    //   // ==> 왼쪽 슬롯 위의 물체를 오른쪽 슬롯으로 옮기는 시퀀스
    //   //P19
    //   [462.49, 51.49, 217.43, 179.98, -0.04, -180.0],
    //   //P20
    //   [462.43, 51.48, 142.35, 179.98, -0.04, -180.0],
    //   //P21
    //   [462.49, 51.49, 217.43, 179.98, -0.04, -180.0],
    //   //P22
    //   [462.1, -51.46, 217.09, 179.98, -0.04, -180.0],
    //   //P23
    //   [462.04, -51.47, 147.85, 179.98, -0.04, -180.0],
    //   //P24
    //   [462.1, -51.46, 217.09, 179.98, -0.04, -180.0],
    //   //P25
    //   [280.04, 0.0, 550.23, -180.0, 0.0, 180.0],
    //   // ==> 오른쪽 슬롯 위의 물체를 왼쪽 슬롯으로 옮기는 시퀀스
    //   //P26
    //   [462.1, -51.46, 217.09, 179.98, -0.04, -180.0],
    //   //P33
    //   [462.03, -51.47, 142.39, 179.98, -0.04, -180.0],
    //   //P28
    //   [462.1, -51.46, 217.09, 179.98, -0.04, -180.0],
    //   //P29
    //   [462.49, 51.49, 217.43, 179.98, -0.04, -180.0],
    //   //P30
    //   [462.91, 51.54, 147.96, 179.98, -0.04, -180.0],
    //   //P31
    //   [462.49, 51.49, 217.43, 179.98, -0.04, -180.0],
    //   //P32
    //   [280.04, 0.0, 550.23, -180.0, 0.0, 180.0],
    //   //home으로
    //   [355, 0, 625, 0, 90, 0],
    // ];

    // // const kukaTestArray = [
    // //   [124.6, -42.4, 653.63, -180, 0, 180],
    // //   [307.11, 9.14, 320.95, 179.98, -0.04, -180],
    // //   [307.05, 9.13, 245.88, 179.98, -0.04, -180],
    // //   [307.11, 9.14, 320.95, 179.98, -0.04, -180],
    // //   [307.11, 9.14, 320.95, 179.98, -0.04, -180],
    // //   [306.72, -93.81, 320.62, 179.98, -0.04, -180],
    // //   [306.67, -93.82, 251.38, 179.98, -0.04, -180.0],
    // //   [306.72, -93.81, 320.62, 179.98, -0.04, -180],
    // //   [124.6, -42.4, 653.63, -180, 0, 180],
    // // ];

    // const kukaRadiansData = [];

    // kukaTestArray.forEach((value) => {
    //   kukaRadiansData.push(
    //     this.CalculateService.calculateAngles(
    //       this.geoKuka,
    //       value[0],
    //       value[1],
    //       value[2],
    //       value[3],
    //       value[4],
    //       value[5]
    //     ).map((data) => (Math.PI / 180) * data)
    //   );
    // });

    // const multiply = 200;
    // for (let i = 0; i < kukaRadiansData.length - 1; i++) {
    //   const x1 = kukaRadiansData[i][0];
    //   const x2 = kukaRadiansData[i + 1][0];
    //   const y1 = kukaRadiansData[i][1];
    //   const y2 = kukaRadiansData[i + 1][1];
    //   const z1 = kukaRadiansData[i][2];
    //   const z2 = kukaRadiansData[i + 1][2];
    //   const u1 = kukaRadiansData[i][3];
    //   const u2 = kukaRadiansData[i + 1][3];
    //   const v1 = kukaRadiansData[i][4];
    //   const v2 = kukaRadiansData[i + 1][4];
    //   const w1 = kukaRadiansData[i][5];
    //   const w2 = kukaRadiansData[i + 1][5];
    //   for (let j = 0; j < multiply; j++) {
    //     const x3 = ((x2 - x1) / multiply) * j + x1;
    //     const y3 = ((y2 - y1) / multiply) * j + y1;
    //     const z3 = ((z2 - z1) / multiply) * j + z1;
    //     const u3 = ((u2 - u1) / multiply) * j + u1;
    //     const v3 = ((v2 - v1) / multiply) * j + v1;
    //     const w3 = ((w2 - w1) / multiply) * j + w1;
    //     this.kukaAnimation.push({
    //       x: x3,
    //       y: y3,
    //       z: z3,
    //       u: u3,
    //       v: v3,
    //       w: w3,
    //     });
    //   }
    // }

    // let idx = 0;
    // //****kuka 6animation****
    // setInterval(() => {
    //   //console.log(this.kukaAnimation[idx]);
    //   /*
    //     현재 +0.1, -1 이 부분은 로봇의 위치에 따라 바라보는 방향이 바뀌어야 함으로
    //     그에 따른 값 셋팅이고 미세하게 맞지 않는 부분을 틀어 주기 위함.
    //     현재는 박스로 구성 되어있어 미세한 부분을 컨트롤 했지만
    //     완성된 라이브러리를 받으면 필요 없을 것으로 생각됨.
    //   */
    //   arm1.rotation.y = (this.kukaAnimation[idx].x + 0.1) * -1;
    //   arm2.rotation.z = this.kukaAnimation[idx].y;
    //   arm3.rotation.z = this.kukaAnimation[idx].z;
    //   arm4.rotation.x = this.kukaAnimation[idx].u;
    //   arm5.rotation.z = this.kukaAnimation[idx].v;
    //   arm6.rotation.x = this.kukaAnimation[idx].w;
    //   idx++;
    //   if (idx === this.kukaAnimation.length) {
    //     idx = 0;
    //   }
    // }, 8);

    const arr = this.testArray.kuka.map((pos) =>
      this.CalculateService.calculateAngles(
        this.geoKuka,
        pos.x,
        pos.y,
        pos.z,
        pos.u,
        pos.v,
        pos.w
      ).map((value) => (Math.PI / 180) * value)
    );

    let idx = 40000;
    setInterval(() => {
      arm1.rotation.y = arr[idx][0] * -1;
      arm2.rotation.z = arr[idx][1];
      arm3.rotation.z = arr[idx][2];
      arm4.rotation.x = arr[idx][3];
      arm5.rotation.z = arr[idx][4];
      arm6.rotation.x = arr[idx][5];
      idx++;
    }, 50);
  }

  /*
    scara4축로봇 박스로 만드는 펑션
  */
  private scara() {
    let baseMat = new BABYLON.StandardMaterial("mat", this.scene);
    baseMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
    let baseColor = new Array(6);
    baseColor[4] = new BABYLON.Color3(0.5, 0.5, 1); // red top

    let base = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 1.665 * 0.1,
        depth: 1.95 * 0.1,
        width: 1.69 * 0.1,
        faceColors: baseColor,
      },
      this.scene
    );
    base.material = baseMat;
    //body.setPivotPoint(new BABYLON.Vector3(0, -1.265, 0));
    base.translate(new BABYLON.Vector3(0, 1, 0), 0.8325 * 0.1);

    let arm1Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm1Mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    let arm1Color = new Array(6);
    arm1Color[4] = new BABYLON.Color3(0.5, 0.5, 0.5);

    let arm1 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 0.5 * 0.1,
        depth: 3.25 * 0.1,
        width: 1.5 * 0.1,
        faceColors: arm1Color,
      },
      this.scene
    );

    arm1.material = arm1Mat;
    arm1.setPivotPoint(new BABYLON.Vector3(0, 0, -1.625 * 0.1));
    arm1.translate(new BABYLON.Vector3(0, 1, 0), 0.25 * 0.1);
    arm1.translate(new BABYLON.Vector3(0, 0, 1), 1.7 * 0.1);
    arm1.translate(new BABYLON.Vector3(0, 1, 0), 1.665 * 0.1);

    base.addChild(arm1);

    let arm2Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm2Mat.diffuseColor = new BABYLON.Color3(0.5, 0.6, 0.4);
    let amr2Color = new Array(6);
    amr2Color[4] = new BABYLON.Color3(0.5, 0.6, 0.4);

    let arm2 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 1.745 * 0.1,
        depth: 3.327 * 0.1,
        width: 1.29 * 0.1,
        faceColors: amr2Color,
      },
      this.scene
    );

    arm2.material = arm2Mat;
    arm2.setPivotPoint(new BABYLON.Vector3(0, 0, -1.6635 * 0.1));
    arm2.translate(new BABYLON.Vector3(0, 1, 0), 0.8725 * 0.1);
    arm2.translate(new BABYLON.Vector3(0, 1, 0), (1.665 + 0.5) * 0.1);
    arm2.translate(new BABYLON.Vector3(0, 0, 1), 4.3 * 0.1);

    arm1.addChild(arm2);

    let arm3Mat = new BABYLON.StandardMaterial("mat", this.scene);
    arm3Mat.diffuseColor = new BABYLON.Color3(0.6, 0.8, 0.6);
    let amr3Color = new Array(6);
    amr3Color[4] = new BABYLON.Color3(0.6, 0.8, 0.6);
    let arm3 = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 3.59 * 0.1,
        depth: 0.3 * 0.1,
        width: 0.3 * 0.1,
        faceColors: amr3Color,
      },
      this.scene
    );
    arm3.material = arm3Mat;
    arm3.translate(new BABYLON.Vector3(0, 1, 0), 1.795 * 0.1);
    arm3.translate(new BABYLON.Vector3(0, 1, 0), (1.665 + 0.5 + 1.745) * 0.1);
    arm3.translate(new BABYLON.Vector3(0, 0, 1), 5.5 * 0.1);
    arm3.translate(new BABYLON.Vector3(0, 1, 0), -2.0 * 0.1);
    arm2.addChild(arm3);

    let shaftMat = new BABYLON.StandardMaterial("mat", this.scene);
    shaftMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.5);
    let shaftColor = new Array(6);
    shaftColor[4] = new BABYLON.Color3(0.2, 0.5, 0.5);
    let shaft = BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        height: 0.3 * 0.1,
        depth: 0.3 * 0.1,
        width: 0.3 * 0.1,
        faceColors: shaftColor,
      },
      this.scene
    );
    shaft.material = shaftMat;
    shaft.translate(new BABYLON.Vector3(0, 1, 0), 0.15 * 0.1);
    shaft.translate(
      new BABYLON.Vector3(0, 1, 0),
      (1.665 + 0.5 + 1.745 + 1.09) * 0.1
    );
    shaft.translate(new BABYLON.Vector3(0, 0, 1), 5.5 * 0.1);
    shaft.translate(new BABYLON.Vector3(0, 1, 0), -3.4 * 0.1);

    arm3.addChild(shaft);

    base.translate(new BABYLON.Vector3(0, 0, 1), -0.75);

    // const scaraTestArray = [
    //   [0, 600, -10, 90],
    //   [58.284, 574.349, -39.989, 88.281],
    //   [58.284, 574.349, -88.312, 88.293],
    //   [58.284, 574.349, -88.312, 88.293],
    //   [0, 600, -40, 90],
    //   [-44.445, 580.989, -39.974, 88.442],
    //   [-44.445, 580.989, -88.298, 88.442],
    //   [-44.445, 580.989, -88.298, 88.442],
    //   [0, 600, -10, 90],
    // ];

    // const scaraRadianData = [];

    // scaraTestArray.forEach((value) => {
    //   scaraRadianData.push(
    //     this.CalculateService.calculate4robot(
    //       value[0],
    //       value[1],
    //       value[2],
    //       value[3]
    //     )
    //   );
    // });

    // const multiply = 200;
    // for (let i = 0; i < scaraRadianData.length - 1; i++) {
    //   const x1 = scaraRadianData[i].theta1;
    //   const x2 = scaraRadianData[i + 1].theta1;
    //   const y1 = scaraRadianData[i].theta2;
    //   const y2 = scaraRadianData[i + 1].theta2;
    //   const z1 = scaraRadianData[i].z;
    //   const z2 = scaraRadianData[i + 1].z;
    //   const u1 = scaraRadianData[i].theta3;
    //   const u2 = scaraRadianData[i + 1].theta3;
    //   for (let j = 0; j < multiply; j++) {
    //     const x3 = ((x2 - x1) / multiply) * j + x1;
    //     const y3 = ((y2 - y1) / multiply) * j + y1;
    //     const z3 = ((z2 - z1) / multiply) * j + z1;
    //     const u3 = ((u2 - u1) / multiply) * j + u1;
    //     this.epson4animation.push({
    //       theta1: x3,
    //       theta2: y3,
    //       z: z3,
    //       theta3: u3,
    //     });
    //   }
    // }

    // let idx = 0;

    // setInterval(() => {
    //   arm1.rotation.y =
    //     -1.5807 + this.epson4animation[idx].theta1 * (Math.PI / 180);
    //   //이부분 동영상 동작과 같게 해야함 arm1 관절이 바뀜 왼쪽 오른쪽으로
    //   arm2.rotation.y = this.epson4animation[idx].theta2 * (Math.PI / 180);
    //   //scara 4축 로봇의 z는 위아래로 움직이는거라서 로테이션이 아님. 마지막에 + 0.05 는 길이가 잘 안맞아서 맞추기위해서 넣은것.
    //   //추후에 라이브러리가 완성되면 적절하게 위치하여 잡아야 함.
    //   arm3.position.y = this.epson4animation[idx].z * 0.001 + 0.05;
    //   shaft.rotation.y = this.epson4animation[idx].theta3 * (Math.PI / 180);
    //   idx++;
    //   if (idx === this.epson4animation.length) {
    //     idx = 0;
    //   }
    // }, 5);

    const arr = this.testArray.epson2.map((pos) =>
      this.CalculateService.calculate4robot(pos.x, pos.y, pos.z, pos.u)
    );

    let idx = 1000;
    setInterval(() => {
      const result = arr[idx];
      arm1.rotation.y = -1.5807 + result.theta1 * (Math.PI / 180);
      arm2.rotation.y = result.theta2 * (Math.PI / 180);
      //arm3.translate(new BABYLON.Vector3(0, 1, 0), result.z * 0.001);
      arm3.position.y = result.z * 0.001;
      shaft.rotation.y = result.theta3 * (Math.PI / 180);
      idx++;
    }, 50);
  }

  /*
    턴테이블 바깥족 박스는 고정이고 안쪽 첫번째 disc만 회전함
    디스크 위에 있는 박스들은 turnBox1~8이고 모두 부모 자식 관계를 설정하여
    디스크 로테이션 값을 주면 회전하도록 되어있다.
    라이브러리가 완성되면 아래 코드와 같이 부모 자식 관계를 설정하여 디스크만 돌려
    회전 할 수 있도록 작업을 진행
  */
  private turnTable() {
    let mat = new BABYLON.StandardMaterial("mat", this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    let faceColors = new Array(6);
    faceColors[4] = new BABYLON.Color3(0.5, 0.5, 0.6);
    let mainBox = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.01, depth: 1, width: 1, faceColors: faceColors },
      this.scene
    );
    mainBox.translate(new BABYLON.Vector3(0, 1, 0), 0.005);
    mainBox.material = mat;

    let outsideBox1 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox1",
      { height: 0.005, depth: 0.1, width: 0.12 },
      this.scene
    );
    outsideBox1.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox1.translate(new BABYLON.Vector3(1, 0, 0), 0.35);
    outsideBox1.translate(new BABYLON.Vector3(0, 0, -1), 0.18);

    let outsideBox2 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox2",
      { height: 0.005, depth: 0.1, width: 0.12 },
      this.scene
    );
    outsideBox2.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox2.translate(new BABYLON.Vector3(1, 0, 0), 0.35);
    outsideBox2.translate(new BABYLON.Vector3(0, 0, 1), 0.18);

    let outsideBox3 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox3",
      { height: 0.005, depth: 0.1, width: 0.12 },
      this.scene
    );
    outsideBox3.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox3.translate(new BABYLON.Vector3(-1, 0, 0), 0.35);
    outsideBox3.translate(new BABYLON.Vector3(0, 0, -1), 0.18);

    let outsideBox4 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox4",
      { height: 0.005, depth: 0.1, width: 0.12 },
      this.scene
    );
    outsideBox4.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox4.translate(new BABYLON.Vector3(-1, 0, 0), 0.35);
    outsideBox4.translate(new BABYLON.Vector3(0, 0, 1), 0.18);

    let outsideBox5 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox5",
      { height: 0.005, depth: 0.12, width: 0.1 },
      this.scene
    );
    outsideBox5.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox5.translate(new BABYLON.Vector3(0, 0, -1), 0.35);
    outsideBox5.translate(new BABYLON.Vector3(1, 0, 0), 0.18);

    let outsideBox6 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox6",
      { height: 0.005, depth: 0.12, width: 0.1 },
      this.scene
    );
    outsideBox6.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox6.translate(new BABYLON.Vector3(0, 0, -1), 0.35);
    outsideBox6.translate(new BABYLON.Vector3(-1, 0, 0), 0.18);

    let outsideBox7 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox7",
      { height: 0.005, depth: 0.12, width: 0.1 },
      this.scene
    );
    outsideBox7.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox7.translate(new BABYLON.Vector3(0, 0, 1), 0.35);
    outsideBox7.translate(new BABYLON.Vector3(1, 0, 0), 0.18);

    let outsideBox8 = BABYLON.MeshBuilder.CreateBox(
      "outsideBox8",
      { height: 0.005, depth: 0.12, width: 0.1 },
      this.scene
    );
    outsideBox8.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    outsideBox8.translate(new BABYLON.Vector3(0, 0, 1), 0.35);
    outsideBox8.translate(new BABYLON.Vector3(-1, 0, 0), 0.18);

    let disc = BABYLON.MeshBuilder.CreateDisc(
      "disc",
      {
        radius: -0.3,
        arc: 1,
        tessellation: 100,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      this.scene
    );
    disc.material = mat;

    let topDisc = BABYLON.MeshBuilder.CreateDisc(
      "disc",
      {
        radius: -0.1,
        arc: 1,
        tessellation: 100,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      this.scene
    );
    let topDiscMat = new BABYLON.StandardMaterial("topDiscMat", this.scene);
    topDiscMat.diffuseColor = new BABYLON.Color3(0, 0.1, 0.1);
    //topDisc.material = mat;
    topDisc.material = topDiscMat;
    topDisc.translate(new BABYLON.Vector3(0, 1, 0), 0.04);
    topDisc.rotation.x = -1.5807 * 3;

    let turnBox1 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.1, width: 0.12, faceColors: faceColors },
      this.scene
    );

    turnBox1.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox1.translate(new BABYLON.Vector3(1, 0, 0), 0.2);
    turnBox1.translate(new BABYLON.Vector3(0, 0, -1), 0.06);

    let turnBox2 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.1, width: 0.12, faceColors: faceColors },
      this.scene
    );

    turnBox2.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox2.translate(new BABYLON.Vector3(1, 0, 0), 0.2);
    turnBox2.translate(new BABYLON.Vector3(0, 0, 1), 0.06);

    let turnBox3 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.1, width: 0.12, faceColors: faceColors },
      this.scene
    );

    turnBox3.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox3.translate(new BABYLON.Vector3(-1, 0, 0), 0.2);
    turnBox3.translate(new BABYLON.Vector3(0, 0, -1), 0.06);

    let turnBox4 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.1, width: 0.12, faceColors: faceColors },
      this.scene
    );

    turnBox4.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox4.translate(new BABYLON.Vector3(-1, 0, 0), 0.2);
    turnBox4.translate(new BABYLON.Vector3(0, 0, 1), 0.06);

    let turnBox5 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.12, width: 0.1, faceColors: faceColors },
      this.scene
    );

    turnBox5.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox5.translate(new BABYLON.Vector3(1, 0, 0), 0.06);
    turnBox5.translate(new BABYLON.Vector3(0, 0, -1), 0.2);

    let turnBox6 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.12, width: 0.1, faceColors: faceColors },
      this.scene
    );

    turnBox6.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox6.translate(new BABYLON.Vector3(-1, 0, 0), 0.06);
    turnBox6.translate(new BABYLON.Vector3(0, 0, -1), 0.2);

    let turnBox7 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.12, width: 0.1, faceColors: faceColors },
      this.scene
    );

    turnBox7.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox7.translate(new BABYLON.Vector3(1, 0, 0), 0.06);
    turnBox7.translate(new BABYLON.Vector3(0, 0, 1), 0.2);

    let turnBox8 = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.005, depth: 0.12, width: 0.1, faceColors: faceColors },
      this.scene
    );

    turnBox8.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    turnBox8.translate(new BABYLON.Vector3(-1, 0, 0), 0.06);
    turnBox8.translate(new BABYLON.Vector3(0, 0, 1), 0.2);

    disc.translate(new BABYLON.Vector3(0, 1, 0), 0.03);
    disc.rotation.x = 1.5807;

    disc.addChild(turnBox1);
    disc.addChild(turnBox2);
    disc.addChild(turnBox3);
    disc.addChild(turnBox4);
    disc.addChild(turnBox5);
    disc.addChild(turnBox6);
    disc.addChild(turnBox7);
    disc.addChild(turnBox8);

    let angle = 1;
    setInterval(() => {
      disc.rotation.y = 1.5807 * angle;
    }, 1000);
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

  /*
    아래 코드들은 x,y,z 축을 위해 만든것
    각 로봇마다 바라보는 방향에 따라 축이 달라짐으로
    혹시 추후에 축을 보여달라는 요구가 있을시에는
    각 로봇의 축에 맞게 설정 해야함.
  */
  //world
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

  //local
  private localAxes(size) {
    let pilot_local_axisX = BABYLON.Mesh.CreateLines(
      "pilot_local_axisX",
      [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, -0.05 * size, 0),
      ],
      this.scene
    );

    pilot_local_axisX.color = new BABYLON.Color3(1, 0, 0);

    let xChar = this.makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.5 * size, -0.05 * size, 0);
    xChar.rotation.y = 1.5708;

    let pilot_local_axisY = BABYLON.Mesh.CreateLines(
      "pilot_local_axisY",
      [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(0.05 * size, size * 0.95, 0),
      ],
      this.scene
    );
    pilot_local_axisY.color = new BABYLON.Color3(0, 1, 0);
    let yChar = this.makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(-0.5, 0.9 * size, -0.05 * size);
    //yChar.rotation.y = 1.5708;

    let pilot_local_axisZ = BABYLON.Mesh.CreateLines(
      "pilot_local_axisZ",
      [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, 0.05 * size, size * 0.95),
      ],
      this.scene
    );
    pilot_local_axisZ.color = new BABYLON.Color3(0, 0, 1);
    let zChar = this.makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(-0.5, 0.05 * size, 0.9 * size);
    //zChar.rotation.y = 1.5708;

    let local_origin = BABYLON.MeshBuilder.CreateBox(
      "local_origin",
      { size: 1 },
      this.scene
    );
    local_origin.isVisible = false;

    pilot_local_axisX.parent = local_origin;
    pilot_local_axisY.parent = local_origin;
    pilot_local_axisZ.parent = local_origin;

    local_origin.translate(new BABYLON.Vector3(-1, 0, 0), 0.6);
    //local_origin.rotation.y = 1.5708;
    return local_origin;
  }
}
