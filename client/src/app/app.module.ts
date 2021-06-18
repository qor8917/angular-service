import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DashboardTestComponent } from "./layout/dashboard-test/dashboard-test.component";
import { MainComponent } from "./layout/main/main.component";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { DashboardComponent } from "./layout/dashboard/dashboard.component";
import { TestComponent } from "./layout/test/test.component";
import { PanelComponent } from "./layout/widgets/panel/panel.component";

@NgModule({
  declarations: [
    AppComponent,
    DashboardTestComponent,
    MainComponent,
    DashboardComponent,
    TestComponent,
    PanelComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
