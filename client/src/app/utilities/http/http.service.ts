import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { start, ready } from "../../layout/widgets/panel/types";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  constructor(private http: HttpClient) {}

  // private url = "http://localhost:8080/api/";
  private url = "api/";

  public getRobots(date: string) {
    return this.http.get(this.url + "robots/" + date);
  }

  public postPanelData(data: start | ready) {
    console.log("here", data);
    return this.http.post(this.url + "msg", data);
  }
}
