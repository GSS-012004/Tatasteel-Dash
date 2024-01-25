import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PpeviolationComponent } from './ppeviolation.component';

const routes: Routes = [{ path: '', component: PpeviolationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpeviolationRoutingModule { }
