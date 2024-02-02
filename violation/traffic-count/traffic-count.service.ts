import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerService } from 'src/app/Services/server.service';

@Injectable({
  providedIn: 'root'
})
export class TrafficCountService {

  constructor(public AppServer:ServerService,public http:HttpClient) { }

  GetTCLiveData(){
    return  this.http.get( this.AppServer.IP+'/live_data1TC')
  }
  GetTCDataByFilters(fromD: any, toD: any, page?: number|null, size?: number|null, cameraName?: string | null) {
    // var fromD =this.AppServer.dateTransform(from)
    // var toD = this.AppServer. dateTransform(to)
    // console.log(fromD, toD)
    console.log(page, size)
     cameraName=cameraName? cameraName.replace(/ /g,'_'):null
  
    cameraName==="all_cameras"?cameraName=null:''
   var body={from_date:fromD,to_date:toD}
   console.log(body)
    return    page && size && cameraName &&((fromD && toD ))? this.http.post(this.AppServer.IP + '/datewiseTC/' + cameraName + '/' + page + '/' + size, body) : 
    page && size && cameraName&&(!fromD ||!toD ) ? this.http.get(this.AppServer.IP + '/live_data1TC/' + cameraName ):
    page && size && (!cameraName)&&(!fromD ||!toD ) ? this.http.get(this.AppServer.IP + '/live_data1TC' ):
    page && size && (!cameraName)&&(fromD &&toD ) ? this.http.post(this.AppServer.IP + '/datewiseTC/'+ page + '/' + size , body):
     !page && !size &&cameraName&&(fromD && toD ) ? this.http.post(this.AppServer.IP + '/datewiseTC/'  + cameraName, body) :
     this.http.post(this.AppServer.IP + '/datewiseTC', body)
  
  }

  GetTCCameraDetails(from:any,to:any){
    return  from === null && to === null? this.http.get(this.AppServer.IP+'/camera_detailsTC'):this.http.post(this.AppServer.IP+'/camera_detailsTC',{from_date:from,to_date:to})
  }
  

  GetTCDepartmentDetails(from:any,to:any){
    return  from === null && to === null? this.http.get(this.AppServer.IP+'/department_detailsTC'):this.http.post(this.AppServer.IP+'/department_detailsTC',{from_date:from,to_date:to})
  }

  // GetCameraDetails(from:any,to:any){
  //   return  from === null && to === null? this.http.get(this.IP+'/Spillagecameradetails'):this.http.post(this.IP+'/Spillagecameradetails',{from_date:from,to_date:to})
  //  }

}
