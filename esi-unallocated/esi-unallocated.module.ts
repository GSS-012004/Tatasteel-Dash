import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {  NgbCarouselConfig, NgbCarouselModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModules } from "src/app/common/common.module";
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { TreeSelectModule } from 'primeng/treeselect';
import {  TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { EsiUnallocatedComponent } from "./esi-unallocated.component";
import { ServerService } from "src/app/Services/server.service";
import { DatePipe } from "@angular/common";
import { AuthGuard } from "src/app/Services/auth.guard";
import { MessageService } from "primeng/api";

const routes:Routes=[{path:'',component:EsiUnallocatedComponent}];
@NgModule({
    declarations:[EsiUnallocatedComponent],
    imports:
    [CommonModules,
    RouterModule.forChild(routes),
    NgbModule,
    ToastModule,
    BadgeModule,
    NgbCarouselModule,
    TreeSelectModule,
    TabViewModule,
    TooltipModule],

    exports:[RouterModule],
    
    providers:
     [ServerService, 
        DatePipe, 
        AuthGuard,
        MessageService,
        NgbCarouselConfig],
})

export class esiUnallocatedModule{

}