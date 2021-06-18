import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { HttpService } from "../../utilities/http/http.service";
import { ready, start } from "../widgets/panel/types";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private http: HttpService) {}

  public getRobots(date: string): Observable<any> {
    return this.http.getRobots(date);
  }

  public postPanelData(data: start | ready): Observable<any> {
    return this.http.postPanelData(data);
  }
}
