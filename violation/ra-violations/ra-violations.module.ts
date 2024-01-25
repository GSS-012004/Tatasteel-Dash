import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { RaViolationsComponent } from './ra-violations.component';
import { CommonModules } from 'src/app/common/common.module';
import { ToastrModule } from 'ngx-toastr';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TreeSelectModule } from 'primeng/treeselect';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ngbCarouselTransitionIn, ngbCarouselTransitionOut } from '@ng-bootstrap/ng-bootstrap/carousel/carousel-transition';
import { CarouselModule } from 'primeng/carousel';

const routes: Routes = [
  { path: '', component: RaViolationsComponent }
];

@NgModule({
  declarations: [
    RaViolationsComponent
  ],
  imports: [
    CommonModules,
    ToastrModule,
    CarouselModule,
    NgxDaterangepickerMd,
    TreeSelectModule,
      RouterModule.forChild(routes)
  ]
})
export class RaViolationsModule { }
