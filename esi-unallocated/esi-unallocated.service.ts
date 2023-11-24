import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class EsiUnallocatedService {
  IP:string
  jobsheetInterval:number
  IP_ESI:string
  delay:number
  relayDelay:number
  dashboardInterval:number
  jobsheetDataInterval:number
  startEsiApi:any
  logInterval:number=0
  steamDataDelay:number

  constructor(public http:HttpClient,
    public   snackbar:MatSnackBar
,
  public datePipe:DatePipe) {
  var res=this.loadConfigFile('assets/config.json')
  res=JSON.parse(res)
  this.IP=res.IP
  this.IP_ESI=res.IP_ESI
  this.delay=res.hooterDelay
  this.relayDelay=res.relayDelay
  this.dashboardInterval=res.dashboardInterval
  this.jobsheetDataInterval=res.jobSheetDataInterval
  this.jobsheetInterval=res.jobSheetStatusInterval
  this.startEsiApi=res.StartESIAppApi
  this.steamDataDelay=res.steamSuitInterval
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

   GetunallocatedJobs(){
    return this.http.get(this.IP+'/unplanned_data')
  }

  GetunallocatedImg(imageName:any){
    return this.http.get(this.IP+'/Unplannedriroimage/' +imageName)   


  }

  DeleteJobPanel(key_id:any){

    return this.http.get(this.IP+'/delete_unplannedRiro/'+key_id)
  }


  notification(message: string, action?: string) {
    this.snackbar.open(message, action ? action : '', ({
      duration: 4000, panelClass: ['error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
    )
  }
}
