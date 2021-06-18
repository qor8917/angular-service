import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./layout/dashboard/dashboard.component";
import { MainComponent } from "./layout/main/main.component";

const routes: Routes = [
  { path: "", redirectTo: "main", pathMatch: "full" },
  { path: "main", component: MainComponent },
  { path: "dashboard", component: DashboardComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled",
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
