import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.css"],
})
export class TestComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  public myClass = ["side_bar"];

  public toggle() {
    this.myClass.push("toggle");
    console.log(this.myClass);
  }

  public close() {
    if (this.myClass.find((c) => c === "toggle"))
      this.myClass = this.myClass.filter((c) => c != "toggle");
    return;
  }
}
