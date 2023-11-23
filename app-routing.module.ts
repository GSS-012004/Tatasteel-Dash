import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { HomeComponent } from './home/home.component';

import {AuthGuard} from './Services/auth.guard'
import {AuthGuardLogin} from './Services/authLogin.guard'
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';


const routes: Routes = 
             [{path:'login',
             loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
            },{path:'',
            loadChildren: () => import('./login/login.module').then(m => m.LoginModule),pathMatch:'full'
           },
              {path:'app/Home',component:HomeComponent},
              {path:'app',component:HomeComponent,
               canActivate:[AuthGuard],
               children:[
                {
                path:'violations',loadChildren:()=>import('./features/violation/log-history/logHistory.module').then(m => m.LogHistoryModule),
                },
              
                {
                  path:'dashboard',loadChildren:()=>import('./features/dashboard/dashboard.module').then(m=>m.DashboardModule)
                  },
                  {
                    path:'reportAlert',loadChildren:()=>import('./settings/report-alert/report-alert.module').then(m=>m.ReportAlertModule)
                    },
                    {
                      path:'trafficCount',loadChildren:()=>import('./features/violation/traffic-count/traffic-count.module').then(m=>m.TrafficCountModule)
                      },
                 
                    {
                      path:'lockHistory',loadChildren:()=>import('./features/lock-history/lock-history.module').then(m=>m.LockHistoryModule)
                      },
               
                    {
                      path:'panelViolation',loadChildren:()=>import('./features/panel-violations/panel-violations.module').then(m=>m.PanelViolationsModule)
                      },
                    {
                      path:'CameraSettings',loadChildren:()=>import('./settings/camera-settings/camera-settings.module').then(m=>m.CameraSettingsModule)
                      },
                      {
                        path:'PanelSettings',
                       
                        
                        loadChildren:()=>import('./settings/panel-types/panelTypes.module').then(m=>m.PanelTypesModule)
                        },
                      {
                        path:'ROISettings',loadChildren:()=>import('./settings/camera-roi/camera-roi.module').then(m=>m.CameraRoiModule)
                        },
                        // {
                        //   path:'panelROISettings',loadChildren:()=>import('./features/roi-settings/roi-settings.module').then(m=>m.ROIEditModule)
                        //   },
                        {
                          path:'Settings',loadChildren:()=>import('./settings/report-alert/report-alert.module').then(m=>m.ReportAlertModule)
                          },    
{path:'SteamSuitDetection',loadChildren:()=>import('./features/steam-suit/steam-suit-detection/steam-suit-detection.module').then(m=>m.SteamSuitDetecionModule)},
                         
                {
                  path:'jobsheetUpload',loadChildren:()=>import('./features/job-sheet-upload/job-sheet-upload.module').then(m=>m.JobsheetUploadModule)
                },
                {
                  path:'rackEdit',loadChildren:()=>import('./features/rack-edit/rack-edit.module').then(m=>m.RackEditModule)
                },
                {
                  path:'jobsheetMoniter',loadChildren: () => import('./features/esi-moniter/esi-monitor.module').then(m => m.ESIMonitorModule)
                },
                {
                  path:'unallocated',loadChildren: () => import('./features/esi-moniter/esi-unallocated/esi-unallocated.module').then(m => m.esiUnallocatedModule)
                },



                { path: 'ESIHistory', loadChildren: () => import('./esihistory/esihistory.module').then(m => m.ESIHistoryModule) }] },
                {path:'**',component:PageNotFoundComponent},
{path:'',pathMatch:'full',canActivate:[AuthGuardLogin] ,loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
},
            ];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
