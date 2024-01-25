import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CrowdCountViolationsRoutingModule } from './crowd-count-violations-routing.module';
import { CrowdCountViolationsComponent } from './crowd-count-violations.component';
import { CommonModules } from 'src/app/common/common.module';
import { ToastrModule } from 'ngx-toastr';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TreeSelectModule } from 'primeng/treeselect';


@NgModule({
  declarations: [
    CrowdCountViolationsComponent
  ],
  imports: [
    CommonModules,
    ToastrModule,
    NgxDaterangepickerMd,
    TreeSelectModule,    CrowdCountViolationsRoutingModule
  ]
})
export class CrowdCountViolationsModule { }
