import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrowdCountViolationsComponent } from './crowd-count-violations.component';

const routes: Routes = [{ path: '', component: CrowdCountViolationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrowdCountViolationsRoutingModule { }
