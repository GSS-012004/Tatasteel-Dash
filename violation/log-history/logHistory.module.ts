import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { LightboxModule } from "ngx-lightbox";
import { ToastrModule } from "ngx-toastr";
import { alertComponent } from "src/app/common/alert.component";
import { CommonModules } from "src/app/common/common.module";
import { ServerService } from "src/app/Services/server.service";
import { LogHistoryComponent } from "./log-history.component";
import { TreeSelectModule } from 'primeng/treeselect';
import { TabViewModule } from "primeng/tabview";

const routes:Routes=[{path:'',component:LogHistoryComponent,children:[
    { path: 'ppe', loadChildren: () => import('../ppeviolation/ppeviolation.module').then(m => m.PpeviolationModule) },
    { path: 'CrowdCount', loadChildren: () => import('../crowd-count-violations/crowd-count-violations.module').then(m => m.CrowdCountViolationsModule) },
    { path: 'DangerZone', loadChildren: () => import('../ra-violations/ra-violations.module').then(m => m.RaViolationsModule) },
    { path: 'FireDetection', loadChildren: () => import('../fire-and-smoke-violation/fire-and-smoke-violation.module').then(m => m.FireAndSmokeViolationModule) },
    { path: 'SpillageDetection', loadChildren: () => import('../spillage-violation/spillage-violation.module').then(m => m.SpillageViolationModule) },
    { path:'Steam-SuitDetection',loadChildren:()=> import('../../steam-suit/steam-suit-details/steam-suit-details.module').then(m=>m.SteamSuitDetailsModule)}

]}
]

@NgModule({
    declarations:[LogHistoryComponent],
    imports:[CommonModules, RouterModule.forChild(routes),LightboxModule,TreeSelectModule,
        NgMultiSelectDropDownModule.forRoot(),ToastrModule.forRoot({
            timeOut: 5000,
            toastComponent: alertComponent,
            progressBar: true,
            newestOnTop: true,
             tapToDismiss:true
          }),
          TabViewModule,
          NgxDaterangepickerMd.forRoot({}),
          NgbModule],
          providers:[ServerService],
          entryComponents:[alertComponent],
    exports:[RouterModule]

})

export class LogHistoryModule{
    
}