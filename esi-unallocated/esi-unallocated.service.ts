import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class EsiUnallocatedService {
 
IP:string
unplannedInterval:any
API: string
  
constructor
(public http:HttpClient,
  public snackbar:MatSnackBar,
  public datePipe:DatePipe)
{
  var res=this.loadConfigFile('assets/config.json')
  res=JSON.parse(res)
  this.IP=res.IP
  this.API=res.API
  this.unplannedInterval = res.unallocatedInterval

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

   notification(message: string, action?: string) {
    this.snackbar.open(message, action ? action : '', ({
      duration: 4000, panelClass: ['error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
    )
  }


  GetunallocatedJobs(isHistory?:boolean,id?:any){

    return  isHistory?this.http.get(this.IP+'/unplanned_data/'+id):this.http.get(this.IP+'/unplanned_data')
  }

  GetunallocatedImg(imageName:any){
    return this.http.get(this.IP+'/Unplannedriroimage/' +imageName)   
  }

  
  DeleteUnallocated(key_id:any){
    return this.http.get(this.IP+'/delete_unplannedRiro/'+key_id)
  }

  
EditRiroJob(data1:any){
    return this.http.post(this.IP+'/edit_UnplannedRIROData',{data:data1})
}
    
VerifyViolation(id:string,flag:any){
   return this.http.get(this.IP+'/RiroUnplannedviolation_verification/'+id+'/'+flag)
}

GetUnallocatedLiveCount(){
return this.http.get(this.IP+'/GetUnplannedLivecount')
}

DeleteRemark(riro_key_id:any){
  return this.http.post(this.IP+'/RemoveRemarksForUnplannedJob', riro_key_id)
}

DeleteFeedNo(riro_key_id:any){
  return this.http.post(this.IP+'/DeleteFeedernumber',riro_key_id)

} 

// getPrevJobsheetData(id:string){
//   return this.http.get(this.IP+'/unplanned_data/'+id)
// }

// GetJobSheet(){
//   return this.http.get(this.IP+'/unplanned_data')
//  }

RTSP(rtsp:any){
return this.http.get(this.API+'/rtsp_feed',rtsp)
}



// ModifyRtspString(inputString:any) {
//   // Create a regular expression that matches all characters to be replaced
//   let replacements:any = {
//     ':': '%3A',
//     '/': '%2F',
//     '@': '%40',
//     '?': '%3F',
//     '&':'%26',
//     '=':'%3D'
// rtsp%3A%2F%2Fadmin%3Aadmin123%4010.11.3.211%3A554%2Fcam%2Frealmonitor%3Fchannel%3D1%26subtype%3D0



//     %2Frtsp%3A%2F%2Fadmin%3Aadmin123%4010.11.3.211%3A554%2Fcam%2Frealmonitor%3Fchannel%3D1%26subtype%3D0
//     rtsp://admin:admin123@10.11.3.211:554/cam/realmonitor?channel=1&subtype=0
//   };
//   let resultString = inputString;

//   for (const key in replacements) {
//     // if (replacements.hasOwnProperty(key)) {
//       resultString = resultString.split(key).join(replacements[key]);
//     // }
//   }

//   return resultString;
// }

}
// url : http://localhost:5800/rtsp_feed
// method : GET
// required_parameters: {"url":"rtsp"}
