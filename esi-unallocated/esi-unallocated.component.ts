import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ServerService } from 'src/app/Services/server.service';
import { EsiUnallocatedService } from './esi-unallocated.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-esi-unallocated',
  templateUrl: './esi-unallocated.component.html',
  styleUrls: ['./esi-unallocated.component.css']
})
export class EsiUnallocatedComponent {
  data:any[] = [];
  IP: any;
  IP_ESI: any;
  datas: any;
  total: Observable<number> = of(0)
  page: number = 1
  pageSize: number = 10
  tempData: any[] = []
  jobsheetData: Observable<any[]> = of([])
  API: any;
  selectedEditIndex: any
  deleteJob: any
deleteField: any;


constructor( private http :HttpClient,
  public server:EsiUnallocatedService,
  public modalService: NgbModal) {
  var res=this.loadConfigFile('assets/config.json')
  res=JSON.parse(res)
  this.IP=res.IP
  this.IP_ESI=res.IP_ESI
  this.API =  server.IP
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

ngOnInit(): void{
   this.http.get(this.IP+'/unplanned_data').subscribe((response:any) =>{
    this.data = response.message;
    console.log(this.data)
    this.data = this.data

   });
   
    this.server.GetunallocatedImg(this.imgName).subscribe((response:any) =>{
      // console.log(this.image = response );
      
    })
    
  }

  imgName(imgName: any) {
    throw new Error('Method not implemented.');
  }
  


  sliceData() {
    this.total = of(this.tempData.length)
    this.jobsheetData = of((this.tempData.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
  }

  isDeleteJob(modal: any, d: any) {
    this.selectedEditIndex = d._id.$oid
    this.deleteJob = d
    this.modalService.open(modal, { backdrop: 'static',centered:true })

  }



  DeleteJob() {
    console.log(this.deleteJob)
    var deleteModal = document.getElementById('deletemodal')
    deleteModal.classList.add('loading')

    if (this.deleteJob.type == 'HT') {
      if(! Array.isArray(this.deleteJob.data.panel_data)){
      var index = this.tempData.findIndex((data: any) => {
        return data._id.$oid === this.selectedEditIndex
      })
      var tempData = this.tempData[index]
      var data = {
        panel_no: this.deleteJob.data.panel_data.panel_id,
        imagename: this.deleteJob.data.image_name,
        id: this.deleteJob._id.$oid,
        panel_key_id: this.deleteJob.data.panel_data.roi_data.panel_key_id,
      }
      //need to integrate delete job api if the response true need to splice that from the data
      this.server.DeleteJobPanel(data).subscribe((response: any) => {
        
      this.server.notification(response.message)
        if (response.success) {
          this.tempData.splice(index, 1)
          this.server. GetunallocatedJobs()
          // this.GetJobsheetStatus()
          this.sliceData()
          deleteModal.classList.remove('loading')
        }
        deleteModal.classList.remove('loading')

        this.modalService.dismissAll()

      },
        Err => {
          deleteModal.classList.remove('loading')

          this.server.notification('Error while deleting job', 'Retry')
        })

      }
      // else if(Array.isArray( this.deleteJob.data.panel_data)){
      //   if(this.deleteJob.data.panel_data.length==0){
      //     this.server.DeleteEntireJob(this.deleteJob._id.$oid).subscribe((response:any)=>{
      //       if(response.success){
      //           this.server.notification(response.message)
      //           this.RefreshData()
      //       }
      //       else{
      //         this.server.notification(response.message,'Retry')
      //       }
      //     })
      //   }

      // }
    }
    // else {


    //   this.server.DeleteMechJobs(this.deleteJob._id.$oid).subscribe((response: any) => {
    //     deleteModal.classList.remove('loading')

    //     if (response.success) {
    //       this.server.notification(response.message)
    //       this.modalService.dismissAll()
    //       this.getJobsheetData()
    //       this.GetJobsheetStatus()
    //       this.sliceData()
    //     }
    //     else {
    //       this.server.notification(response.message)
    //     }
    //   },
    //     Err => {
    //       deleteModal.classList.remove('loading')

    //       this.server.notification('Error while deleting Job', 'Retry')
    //    })
    //  }

  }
}

