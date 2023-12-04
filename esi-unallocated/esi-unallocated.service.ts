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

  
constructor
(public http:HttpClient,
  public snackbar:MatSnackBar,
  public datePipe:DatePipe)
{
  var res=this.loadConfigFile('assets/config.json')
  res=JSON.parse(res)
  this.IP=res.IP
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


  GetunallocatedJobs(){
    return this.http.get(this.IP+'/unplanned_data')
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

    
}

