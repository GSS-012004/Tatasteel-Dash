import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CrowdCountViolationsService {
  logInterval:number=0
  IP:string


  constructor(
    public http:HttpClient,
    public snackbar:MatSnackBar,
    public datePipe:DatePipe
  ) {
    var res=this.loadConfigFile('assets/config.json')
    res=JSON.parse(res)
    this.logInterval=res.logInterval
    this.IP=res.IP
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

  LiveCCViolationData (cameraName?:string | null,violType?:string|null,page?:number,size?:number) {

    // cameraName=cameraName? cameraName.replace(/ /g,'_'):null
  
    cameraName==="all_cameras"?cameraName=null:''
    violType==="all_violations"?violType=null:''
   
    return    page && size && cameraName && violType? this.http.get(this.IP + '/live_data1CC/' + cameraName + '/'+violType+'/' + page + '/' + size): 
    !page && !size && cameraName && violType? this.http.get(this.IP + '/live_data1CC/' + cameraName + '/'+violType):
    page && size && cameraName && !violType ? this.http.get(this.IP + '/live_data1CC/cameraname/' + cameraName + '/' + page + '/' + size) : 
    !page && !size && !cameraName && violType ? this.http.get(this.IP + '/live_data1CC/violation/'+violType )
    : page && size && !cameraName && violType? this.http.get(this.IP + '/live_data1CC/violation/'+violType +'/'+ page + '/' + size) :
    page && size && (!cameraName) && (!violType) ? this.http.get(this.IP + '/live_data1CC/pagination/'+ page + '/' + size):
     !page && !size &&cameraName &&!violType? this.http.get(this.IP + '/live_data1CC/cameraname/'  + cameraName) :
     this.http.get(this.IP + '/live_data1CC')
  
  }

  DatewiseCCViolations(from: any, to: any, page?: number|null, size?: number|null, cameraName?: string | null,violType?:string|null) {
    var fromD = this.dateTransform(from)
    var toD = this.dateTransform(to)
  
    // cameraName=cameraName? cameraName.replace(/ /g,'_'):null
  
    cameraName==="all_cameras"?cameraName=null:''
    violType==="all_violations"?violType=null:''
    var body;
  
   violType!==null?body={from_date:fromD,to_date:toD,violation_type:violType}: body={from_date:fromD,to_date:toD}
    return    page && size && cameraName && violType? this.http.post(this.IP + '/datewise_violationCC/' + cameraName + '/' + page + '/' + size, body): 
    !page && !size && cameraName && violType? this.http.post(this.IP + '/datewise_violationCC/' + cameraName , body):
    page && size && cameraName ? this.http.post(this.IP + '/datewiseCC/' + cameraName + '/' + page + '/' + size, body) : 
    !page && !size && !cameraName && violType ? this.http.post(this.IP + '/datewise_violationCC' , body)
    : page && size && !cameraName && violType? this.http.post(this.IP + '/datewise_violationCC/' + page + '/' + size, body) :
    page && size && (!cameraName) && (!violType) ? this.http.post(this.IP + '/datewiseCC/'+ page + '/' + size , body):
     !page && !size &&cameraName &&!violType? this.http.post(this.IP + '/datewiseCC/'  + cameraName, body) :
     this.http.post(this.IP + '/datewiseCC', body)
  
  }

  CreateCCViolationExcel(data:any){
    return this.http.post(this.IP+'/create_violation_excelCRDCNT',data)
    }

    DownloadViolationExcel(){
      return this.http.get(this.IP+'/violation_excel_download',{observe:'response',responseType:'arraybuffer'})
    }

    GetLatestCCData(camera_name:any){
      return camera_name? this.http.get(this.IP+'/latest_dataCC/'+camera_name):this.http.get(this.IP+'/latest_dataCC')
    }
    GetCCCameraDetails(from:any,to:any){
      return from === null && to === null?this.http.get(this.IP+'/camera_detailsCRDCNT'):this.http.post(this.IP+'/camera_detailsCRDCNT',{from_date:from,to_date:to})
    }

    GetCCDepartmentDetails(from:any,to:any){
      return from === null && to === null?this.http.get(this.IP+'/department_detailsCRDCNT'):this.http.post(this.IP+'/department_detailsCRDCNT',{from_date:from,to_date:to})
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
