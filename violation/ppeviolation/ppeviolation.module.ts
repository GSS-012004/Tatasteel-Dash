import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PpeviolationRoutingModule } from './ppeviolation-routing.module';
import { PpeviolationComponent } from './ppeviolation.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CommonModules } from 'src/app/common/common.module';
import { ToastrModule } from 'ngx-toastr';
import { TreeSelectModule } from 'primeng/treeselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DropdownModule } from 'primeng/dropdown';
import { MenuModule } from 'primeng/menu';
import { SliderModule } from 'primeng/slider';


@NgModule({
  declarations: [
    PpeviolationComponent
  ],
  imports: [
    CommonModules,
    ToastrModule,
    NgxDaterangepickerMd,
    TreeSelectModule,
    PpeviolationRoutingModule,
    OverlayPanelModule,
    MenuModule,
    SliderModule
  
  ]
})
export class PpeviolationModule { }
