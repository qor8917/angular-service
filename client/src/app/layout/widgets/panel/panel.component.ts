import { Component, Input, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ready, start } from "./types";
import { DashboardService } from "../../dashboard/dashboard-service.service";

@Component({
  selector: "app-panel",
  templateUrl: "./panel.component.html",
  styleUrls: ["./panel.component.css"],
})
export class PanelComponent implements OnInit {
  private container: string[] = [];
  @Input()
  public mode;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {}

  public updateChange(order: number, value: string) {
    this.container[order] = value;
  }

  public ready(): void {
    const result: ready = {
      MSG_TYPE: "CONTROL",
      Comand: this.mode + "_Ready",
    };
    this.postJson(result);
    return;
  }

  public start(): void {
    const result: start = {
      MSG_TYPE: "CONTROL",
      Comand: this.mode + "_Start",
      Data1: this.container[0].toLocaleUpperCase(),
      Data2: this.container[1].toLocaleUpperCase(),
    };

    if (!this.container[0] || !this.container[1]) {
      alert("두 기계를 선택하세요");
      return;
    }
    this.postJson(result);
    "";
    return;
  }

  private postJson(msg: ready | start): void {
    this.dashboardService
      .postPanelData(msg)
      .subscribe((res) => console.log(res));
    return;
  }
}
