import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PpeviolationService {
  logInterval:number=0
  IP:string

  constructor(
    public http:HttpClient,
    public snackbar:MatSnackBar
,
    public datePipe:DatePipe
  ) {
    var res=this.loadConfigFile('assets/config.json')
  res=JSON.parse(res)
    this.IP=res.IP
    this.logInterval=res.logInterval
    
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

   dateTransform(date:Date){
    return this.datePipe.transform(date,'yyyy-MM-dd HH:mm:ss')
 
 }

 LivePPEViolationData (cameraName?:string | null,violType?:string|null,page?:number,size?:number) {

  // cameraName=cameraName? cameraName.replace(/ /g,'_'):null

  cameraName==="all_cameras"?cameraName=null:''
  violType==="all_violations"?violType=null:''
 
  return    page && size && cameraName && violType? this.http.get(this.IP + '/live_data1PPE/' + cameraName + '/'+violType+'/' + page + '/' + size): 
  !page && !size && cameraName && violType? this.http.get(this.IP + '/live_data1PPE/' + cameraName + '/'+violType):
  page && size && cameraName && !violType ? this.http.get(this.IP + '/live_data1PPE/cameraname/' + cameraName + '/' + page + '/' + size) : 
  !page && !size && !cameraName && violType ? this.http.get(this.IP + '/live_data1/violation/'+violType )
  : page && size && !cameraName && violType? this.http.get(this.IP + '/live_data1PPE/violation/'+violType +'/'+ page + '/' + size) :
  page && size && (!cameraName) && (!violType) ? this.http.get(this.IP + '/live_data1PPE/pagination/'+ page + '/' + size):
   !page && !size &&cameraName &&!violType? this.http.get(this.IP + '/live_data1PPE/cameraname/'  + cameraName) :
   this.http.get(this.IP + '/live_data1PPE')

}

DatewisePPEViolations(from: any, to: any, page?: number|null, size?: number|null, cameraName?: string | null,violType?:string|null) {
  var fromD = this.dateTransform(from)
  var toD = this.dateTransform(to)

  cameraName==="all_cameras"?cameraName=null:''
  violType==="all_violations"?violType=null:''
  var body;

 violType!==null?body={from_date:fromD,to_date:toD,violation_type:violType}: body={from_date:fromD,to_date:toD}
  return    page && size && cameraName && violType? this.http.post(this.IP + '/datewise_violationPPE/' + cameraName + '/' + page + '/' + size, body): 
  !page && !size && cameraName && violType? this.http.post(this.IP + '/datewise_violationPPE/' + cameraName , body):
  page && size && cameraName ? this.http.post(this.IP + '/datewisePPE/' + cameraName + '/' + page + '/' + size, body) : 
  !page && !size && !cameraName && violType ? this.http.post(this.IP + '/datewise_violationPPE' , body)
  : page && size && !cameraName && violType? this.http.post(this.IP + '/datewise_violationPPE/' + page + '/' + size, body) :
  page && size && (!cameraName) && (!violType) ? this.http.post(this.IP + '/datewisePPE/'+ page + '/' + size , body):
   !page && !size &&cameraName &&!violType? this.http.post(this.IP + '/datewisePPE/'  + cameraName, body) :
   this.http.post(this.IP + '/datewisePPE', body)

}

ChangePPEFiltersData(data:any){
  return this.http.post(this.IP+'/PPEviolationPercentage',data)
}

GetPPEFiltersData(){
  return this.http.get(this.IP+'/PPEviolationPercentage')
}

CreatePPEViolationExcel(data:any){
  return this.http.post(this.IP+'/create_violation_excelPPE',data)
}

DownloadViolationExcel(){
  return this.http.get(this.IP+'/violation_excel_download',{observe:'response',responseType:'arraybuffer'})
}


GetLatestPPEData(camera_name:any){
  return camera_name? this.http.get(this.IP+'/latest_dataPPE/'+camera_name):this.http.get(this.IP+'/latest_dataPPE')
}

GetPPECameraDetails(from:any,to:any){
  return from === null && to === null? this.http.get(this.IP+'/camera_detailsPPE'):this.http.post(this.IP+'/camera_detailsPPE',{from_date:from,to_date:to})
}

GetPPEDepartmentDetails(from:any,to:any){
  return from === null && to === null? this.http.get(this.IP+'/department_detailsPPE'):this.http.post(this.IP+'/department_detailsPPE',{from_date:from,to_date:to})
}

// GetRACameraDetails(from:any,to:any){
//   // var fromD = this.dateTransform(from)
//   // var toD = this.dateTransform(to)
//   return from === null && to === null? this.http.get(this.IP+'/camera_detailsRA'):this.http.post(this.IP+'/camera_detailsRA',{from_date:from,to_date:to})
// }
GetViolationList(){
  return this.http.get(this.IP+'/violation_type_details')
}

VerifyViolation(id:string,flag:any){
  return this.http.get(this.IP+'/violation_verification/'+id+'/'+flag)
}

notification(message: string, action?: string) {
  this.snackbar.open(message, action ? action : '', ({
    duration: 4000, panelClass: ['error'],
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  })
  )
}

DeleteViolationData(id:any){
  return this.http.get(this.IP+'/Deleteviolation/'+id)
}
}
