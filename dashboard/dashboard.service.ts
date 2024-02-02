import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  IP:string
  dashboardInterval:number
  logInterval:number

  constructor(
    public http:HttpClient,
    public snackbar:MatSnackBar,
    public datePipe:DatePipe
  ) 
  {
    var res=this.loadConfigFile('assets/config.json')
    res=JSON.parse(res)
    this.IP=res.IP
    this.dashboardInterval=res.dashboardInterval
    this.logInterval = res.logInterval
   }

   loadConfigFile(filepath:any){
    const JSON=this.readConfigFile(filepath,'application/json')
    return JSON
  }

  readConfigFile(filepath:any,mimeType:any){
   var xmlRequest=new XMLHttpRequest() 
   xmlRequest.open('GET',filepath,false)
   if (mimeType != null) {
    if (xmlRequest.overrideMimeType) {
        xmlRequest.overrideMimeType(mimeType);
    }
    xmlRequest.send()
    if(xmlRequest.status){
        return xmlRequest.response
    }
    else{
        return null
    }
  }
  
  }

  GetPPEViolCountCamWise(){
    return this.http.get(this.IP+ "/cam_wise_PPE_violations_count")
 }

  GetViolationList(){
   return this.http.get(this.IP+'/violation_type_details')
 }

 GetCamerasStatus(){
   return this.http.get(this.IP+'/get_cam_status_enable_cam_count')
 }

  GetLiveViolationCount(){
    return this.http.get(this.IP+'/get_current_date_violation_counts')
  }
 
  notification(message: string, action?: string) {
    this.snackbar.open(message, action ? action : '', ({
      duration: 4000, panelClass: ['error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
    )
  }

  GetECSolutionCount(){
    return this.http.get(this.IP+'/get_all_solns_enable_cam_details')
  }

  GetTotalViolDetailsDatewise(fromDate:any,toDate:any){
    return this.http.post(this.IP+'/cam_wise_violations_count_by_date',{from_date:fromDate,to_date:toDate})
  }

  GetTotaliveViolationsDetails(){
    return this.http.get(this.IP+'/current_date_violations_cam_wise')
  }

  DisableCamDetails(){
    return this.http.get(this.IP+'/disable_camera_details')
  }

  GetNotWorkingCameraDetails(){
    return this.http.get(this.IP+'/get_not_working_camera_details')
  }

  GetViolationCountDatewise(fromDate:any,toDate:any,violationType?:any){
    return this.http.post(this.IP+'/date_wise_violations_count',{from_date:fromDate,to_date:toDate})
  }

  dateTransform(date:Date){
    return this.datePipe.transform(date,'yyyy-MM-dd HH:mm:ss')
  }
   
  dateTransformbyPattern(date:Date,pattern:string){
    return this.datePipe.transform(date,pattern)
  }

  GetCCCamwiseDateWise(fromDate:any,toDate:any){
    return this.http.post(this.IP+'/cam_wise_CR_violations_by_date',{from_date:fromDate,to_date:toDate})
  }

  GetCCLiveDataCamwise(){
    return this.http.get(this.IP+'/cam_wise_CR_violations_count')
  }

  GetPPEViolationDetails(fromDate:any,toDate:any){
    return this.http.post(this.IP+'/cam_wise_PPE_violations_by_date',{from_date:fromDate,to_date:toDate})
  }

  ppeViolCountCamwise(){
    return this.http.get(this.IP+'/cam_wise_PPE_violations_count')
  }

  GetRAViolationsDetails(fromDate:any,toDate:any){
    return this.http.post(this.IP+'/cam_wise_RA_violations_by_date',{from_date:fromDate,to_date:toDate})
  }

  RAViolCountCamWise(){
    return this.http.get(this.IP+'/cam_wise_RA_violations_count')
  }
  

  GetLicenseDetails(){
    return this.http.get(this.IP+'/license_count')
  }
}
