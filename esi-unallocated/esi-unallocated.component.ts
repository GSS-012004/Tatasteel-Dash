import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ServerService } from 'src/app/Services/server.service';
import { EsiUnallocatedService } from './esi-unallocated.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Lightbox, LightboxConfig } from 'ngx-lightbox';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-esi-unallocated',
  templateUrl: './esi-unallocated.component.html',
  styleUrls: ['./esi-unallocated.component.css']
})
export class EsiUnallocatedComponent implements OnInit,OnDestroy {
  data:any[] =[]
  IP: any;
  IP_ESI: any;
  datas: any;
  total: Observable<number> = of(0)
  page: number = 1
  pageSize: number = 10
  tempData:any[]
  jobsheetData: Observable<any[]> = of([])
  API: any;
  selectedEditIndex: any
  deleteJob: any
deleteField: any;
selectedPanel: any
selectedPanels: any[] = []
jobsStatus: any = { not_processed: 0, processed_count: 0, total_jobs: 0 }
editField: string
remarkControl:FormControl=new FormControl()
Images: any[] = []
selectedRiro: any
tempField: FormControl = new FormControl('', Validators.required)
isEditTable: boolean = true
editViol: any
isdatewise: boolean = false
rackProcess:FormControl= new FormControl('',Validators.required)
editedRackProc:any
panelData:Observable< any[]>=of([])
alertmessage: string = ''
ExcelRange: number
  
constructor( private http :HttpClient,
  public server:EsiUnallocatedService,
  public modalService: NgbModal,
  public router: Router,
  private _lightbox: Lightbox,
  private _lightBoxConfig: LightboxConfig,
  private ngZone: NgZone,
  private snackbar: MatSnackBar) {
  var res=this.loadConfigFile('assets/config.json')
  res=JSON.parse(res)
  this.IP=res.IP
  this.IP_ESI=res.IP_ESI
  this.API=server.IP
  this.ExcelRange = 0

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
   this.server.GetunallocatedJobs().subscribe((response:any) =>{
    this.data = response.message;
    console.log(this.data)
    this.data = this.data
    

   });
   
    // this.server.GetunallocatedImg()
    // .subscribe((response:any) =>{
      // console.log(this.image = response );
      
    // })
    this.getRiroHistory();
    
  }
  // ngOnInit(): void {
  //   this.getRiroHistory()

  // }

  // imgName(imgName: any) {
  //   throw new Error('Method not implemented.');
  // }
  


  sliceData(){
    console.log(this.page, this.pageSize)
    this.total = of((this.tempData.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)).length)
    this.total = of(this.tempData.length)
    this.panelData = of((this.tempData.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
  }
  // sliceData() {
  //   this.total = of(this.tempData.length)
  //   this.jobsheetData = of((this.tempData.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
  // }

  // isDeleteJob(modal: any, d: any) {
  //   this.selectedEditIndex = d._id.$oid
  //   this.deleteJob = d
  //   this.modalService.open(modal, { backdrop: 'static',centered:true })

  // }



  // DeleteJob() {
  //   console.log(this.deleteJob)
  //   var deleteModal = document.getElementById('deletemodal')
  //   deleteModal.classList.add('loading')

  //   if (this.deleteJob.type == 'HT') {
  //     if(! Array.isArray(this.deleteJob.data)){
  //     var index = this.tempData.findIndex((data: any) => {
  //       return data._id.$oid === this.selectedEditIndex
  //     })
  //     var tempData = this.tempData[index]
  //     var data = {
  //       //  panel_no: this.deleteJob.data.panel_data.panel_id,
  //       //  imagename: this.deleteJob.data.riro_image,
  //       id: this.deleteJob._id.$oid,
  //       panel_key_id: this.deleteJob.data.riro_key_id,
  //     }
  //     //need to integrate delete job api if the response true need to splice that from the data
  //     this.server.DeleteJobPanel(data).subscribe((response: any) => {
  //       this.server.notification(response.message)
  //       if (response.success) {
  //         this.tempData.splice(index, 1)
  //         this.getJobsheetData()
  //         this.GetJobsheetStatus()
  //         this.sliceData()
  //         deleteModal.classList.remove('loading')
  //       }
  //       deleteModal.classList.remove('loading')

  //       this.modalService.dismissAll()

  //     },
  //       Err => {
  //         deleteModal.classList.remove('loading')

  //         this.server.notification('Error while deleting job', 'Retry')
  //       })

  //     }
  //     else if(Array.isArray( this.deleteJob.data)){
  //       if(this.deleteJob.data.panel_data.length==0){
  //         this.server.DeleteEntireJob(this.deleteJob._id.$oid).subscribe((response:any)=>{
  //           if(response.success){
  //               this.server.notification(response.message)
  //               this.RefreshData()
  //           }
  //           else{
  //             this.server.notification(response.message,'Retry')
  //           }
  //         })
  //       }

  //     }
  //   }
  //   else {


  //     this.server.DeleteMechJobs(this.deleteJob._id.$oid).subscribe((response: any) => {
  //       deleteModal.classList.remove('loading')

  //       if (response.success) {
  //         this.server.notification(response.message)
  //         this.modalService.dismissAll()
  //         this.getJobsheetData()
  //         this.GetJobsheetStatus()
  //         this.sliceData()
  //       }
  //       else {
  //         this.server.notification(response.message)
  //       }
  //     },
  //       Err => {
  //         deleteModal.classList.remove('loading')

  //         this.server.notification('Error while deleting Job', 'Retry')
  //       })
  //   }

  // }


  // getJobsheetData() {
  //   var table = document.getElementById('dataTable')
  //   table.classList.add('loading')
  //   this.server.GetJobSheet().subscribe((response: any) => {
  //     table.classList.remove('loading')
  //     if (response.job_sheet_status) {
  //       if (response.success) {

  //         this.total = of(response.message.length)
  //         this.jobsheetData = of(response.message)
  //         this.tempData = response.message
  //         this.tempData = this.ModifyData(this.tempData)
  //         this.tempData = this.SortLivewise(this.tempData)
  //         this.sliceData()
  //       }
  //       else {
  //         this.server.notification('Data not found')
  //       }
  //     }
  //     else {
  //       this.router.navigate(['app/jobsheetUpload'])
  //     }
  //   },
  //     err => {
  //       this.server.notification('Error while fetching the data', 'Retry')
  //       table.classList.remove('loading')
  //     })
  // }

  // GetJobsheetStatus() {
  //   this.server.GetJobsheetStatus().subscribe((response: any) => {
  //     if (response.success) {
  //       this.jobsStatus = response.message
  //     }
  //   })
  // }



  RefreshData()  {
    this.selectedPanel = ''
    this.selectedPanels = []
    this.total = of(0)
    this.jobsheetData = of([])

    // this.ShowData()
     this.GetunallocatedJobs();

  }

  SortLivewise(data: any) {
    for (let index1 = 0; index1 < data.length; index1++) {
      data[index1].isbreak = false
      for (let index2 = index1 + 1; index2 < data.length; index2++) {
       
        if ((data[index1].riro_data[0] != null ? (data[index1].riro_data[0].rack_process == null) : false) && (data[index1].riro_data[0] != null ? (data[index1].riro_data[0].rack_process == 'rack_out') : false)) {
          var temp = data[index1]
          data[index1] = data[index2]
          data[index2] = temp
        }
        if ((!data[index1].data.panel_data.panel_status ) && (data[index2].data.panel_data.panel_status)) {
          var temp = data[index1]
          data[index1] = data[index2]
          data[index2] = temp
        }
        
        for (let index2 = index1 + 1; index2 < data.length; index2++) {
          if (((!(data[index1].exception_status)) && data[index2].exception_status)) {

            var temp = data[index1]
            data[index1] = data[index2]
            data[index2] = temp
          }

        }
        for (let index2 = index1 + 1; index2 < data.length; index2++) {
          if ((!data[index1].live_status && data[index2].live_status)) {

            var temp = data[index1]
            data[index1] = data[index2]
            data[index2] = temp
          }
        }
      }
    }
    var index1 = 0;
    var subcount = 0
    while (index1 < data.length) {
      const currentActiveJob = data[index1].job_no
      var tempi = index1
      subcount = 1
      data[index1].subCount = 1
      for (let j = index1 + 1; j < data.length; j++) {
        const subjob = data[j];
        if (subjob.job_no === currentActiveJob) {

          tempi++
          subcount++
          var tempsub = data[tempi]
          data[tempi] = subjob
          data[j] = tempsub
          data[tempi].subCount = subcount.toString()
        }

      }
      data[tempi].isbreak = true


      index1 = tempi + 1
      for (let index1 = tempi + 1; index1 < data.length; index1++) {
        for (let index2 = index1 + 1; index2 < data.length; index2++) {

          if ((data[index1].riro_data[0] != null ? (data[index1].riro_data[0].rack_process == null) : false) && (data[index1].riro_data[0] != null ? (data[index1].riro_data[0].rack_process == 'rack_out') : false)) {
            var temp = data[index1]
            data[index1] = data[index2]
            data[index2] = temp
          }
          
            if (((!(data[index1].exception_status)) && data[index2].exception_status)) {
  
              var temp = data[index1]
              data[index1] = data[index2]
              data[index2] = temp
            }
  
            if ((!data[index1].live_status && data[index2].live_status)) {
  
              var temp = data[index1]
              data[index1] = data[index2]
              data[index2] = temp
            // }
          }
  
        }
      }
      index1 = tempi + 1
       }
console.log(data)

    return data
  }


  // ShowData() {
  //   var request: any
  //   request = this.server.GetJobSheetDataByfilter(this.ipSelected ? this.ipSelected : '', this.selectedDep ? this.selectedDep : '', this.panelSelected ? this.panelSelected : '', this.jobTypeSelected ? this.jobTypeSelected : '').subscribe((response: any) => {
  //     //table.classList.remove('loader')
  //     if (!this.isFilter) {
  //       if (response.success) {

  //         if (!this.isFilter) {
  //           this.total = of(response.message.length)
  //           this.CheckViolation(response.message)
  //           //  this.table!=null? this.table.classList.remove('loading'):''
  //           this.tempData = response.message
  //           this.tempData = this.ModifyData(this.tempData)
  //           this.tempData = this.SortLivewise(this.tempData)
  //           this.sliceData()
  //         }
  //       }
  //       else {
  //         this.table != null ? this.table.classList.remove('loading') : ''

  //         this.total = of(0)
  //         //this.jobsheetData = of(response.message)
  //         this.tempData = []
  //         this.sliceData()
  //       }

  //     }
  //   },
  //     (Err: any) => {

  //     }
  //   )

  //   this.httprequests.length > 4 ? (this.httprequests.push(request)) : ''


  // }

  // ModifyData(data: any) {

  //   data.forEach((panel: any) => {

  //     let temp: any = {}
  //     let temp2: any = {}
  //     if(panel.riro_data.length>0){
  //     if (panel.riro_data.length == 1) {
  //       if (panel.riro_data[0].rack_process == 'rack_in') {
  //         temp = panel.riro_data[0]
  //         panel.riro_data[0] = null
  //         panel.riro_data[1] = temp;
  //       }
  //       else if (panel.riro_data[0].rack_process == 'not_recognised') {
  //         temp = panel.riro_data[0]
  //         panel.riro_data[0] = null
  //         panel.riro_data[1] = null
  //         panel.riro_data[2] = temp;
  //       }
  //       else {
  //         panel.riro_data[1] = null
  //         panel.riro_data[2] = null
  //       }
  //     }

  //     else {
  //       if (panel.riro_data[0].rack_process == 'rack_in' && panel.riro_data[1].rack_process == 'rack_out') {
  //         temp = panel.riro_data[0]
  //         panel.riro_data[0] = panel.riro_data[1]
  //         panel.riro_data[1] = temp;
  //         panel.riro_data[2] = null
  //       }
  //       else if (panel.riro_data[0].rack_process == 'rack_in' && panel.riro_data[1].rack_process == 'not_recognised') {
  //         temp = panel.riro_data[0]
  //         temp2 = panel.riro_data[1]
  //         panel.riro_data[0] = {}
  //         panel.riro_data[1] = temp
  //         panel.riro_data[2] = temp2
  //       }
  //       else if (panel.riro_data[1].rack_process == 'rack_in' && panel.riro_data[0].rack_process == 'not_recognised') {
  //         temp = panel.riro_data[0]
  //         temp2 = panel.riro_data[1]
  //         panel.riro_data[0] = null
  //         panel.riro_data[1] = temp2
  //         panel.riro_data[2] = temp
          
  //       }
  //       else if (panel.riro_data[0].rack_process == 'not_recognised' && panel.riro_data[1].rack_process == 'rack_out') {
  //         temp = panel.riro_data[0]
  //         temp2 = panel.riro_data[1]
  //         panel.riro_data[0] = temp2
  //         panel.riro_data[1] = null
  //         panel.riro_data[2] = temp
         
  //       }
  //       else if (panel.riro_data[1].rack_process == 'not_recognised' && panel.riro_data[0].rack_process == 'rack_out') {

  //         temp2 = panel.riro_data[1]

  //         panel.riro_data[1] = null
  //         panel.riro_data[2] = temp2
  //       }
  //       else {
  //         panel.riro_data[2] = null
  //       }
  //     }
  //     }
  // });

  //   return data;
  //    }

    //  RemarkModal(modal: any, data: any, field: any) {
     
      
    //   this.editField = field
    //   this.selectedEditIndex = data.riro_key_id
    //   console.log(this.selectedEditIndex,'selected edit ')
    //    this.modalService.open(modal, { backdrop: 'static' ,centered:true})
    // }
    

    // SaveRemark() {
    //   var index = this.tempData.findIndex((data: any) => {
    //     return data.riro_key_id == this.selectedEditIndex
    //   })
    //   var data1: any = {
    //     riro_key_id: this.selectedEditIndex,
  
    //   }
    //   data1[this.editField] = this.remarkControl.value
    //   this.server.EditRiroJob(data1).subscribe((response: any) => {
  
    //     if (response.success) {
    //       this.server.notification(response.message)
    //       this.getJobsheetData()
    //       this.GetJobsheetStatus()
    //       this.modalService.dismissAll()
    //     }
    //     else {
    //       this.server.notification(response.message, 'Retry')
    //     }
    //   },
    //     Err => {
    //       this.server.notification('Error while updating', 'Retry')
    //     })
  
    // }

    imageCarousal(viol: any) {
      this.Images = [];
    
      if (Array.isArray(viol.riro_image.After)) {
        viol.riro_image.After.forEach((imgname: string, index: number) => {
          this.Images[index] = {
            src: this.API + '/Unplannedriroimage/' + imgname,
            thumb: this.API + '/Unplannedriroimage/' + imgname,
            caption: imgname,
          };
        });
      } else if (typeof viol.riro_image.After === 'string') {
        // If viol.riro_image.After is a string, assume it's a single image
        this.Images[0] = {
          src: this.API + '/Unplannedriroimage/' + viol.riro_image.After,
          thumb: this.API + '/Unplannedriroimage/' + viol.riro_image.After,
          caption: viol.riro_image.After,
        };
      } else {
        console.error('Invalid format for viol.riro_image.After');
        // Handle other cases or throw an error if needed
        return;
      }
    
      this.open(0);
    }
    

    imageCarousal2(viol: any) {
      this.Images = [];
    
      if (Array.isArray(viol.Before)) {
        viol.Before.forEach((Before: string, index: number) => {
          this.Images[index] = {
            src: this.API + '/Unplannedriroimage/' + Before,
            thumb: this.API + '/Unplannedriroimage/' + Before,
            caption: Before,
          };
        });
      } else if (typeof viol.Before === 'string') {
        // If viol.Before is a string, assume it's a single image
        this.Images[0] = {
          src: this.API + '/Unplannedriroimage/' + viol.Before,
          thumb: this.API + '/Unplannedriroimage/' + viol.Before,
          caption: viol.Before,
        };
      } else {
        console.error('Invalid format for viol.Before');
        // Handle other cases or throw an error if needed
        return;
      }
    
      this.open(0);
    }
    
    open(index: number): void {
      this._lightbox.open(this.Images, index);
    }
    close(): void {
      this._lightbox.close();
    }


    // selectEditField(modal: any, data: any, field: string) {
    //   this.editField = field
    //   this.selectedRiro = data
    //   this.selectedEditIndex = data.riro_key_id
      
    //   if (this.editField == 'five_meter') {
    //     data[this.editField]
  
    //     this.tempField.setValue(data[this.editField].violation ? data.this.editField.violation ? 'Yes' : 'No' : 'No')
    //   } else {
    //     this.tempField.setValue(data[this.editField])
    //   }
  
    //   this.modalService.open(modal, { backdrop: 'static',centered:true })
  
    // }

    // selectEditField(modal: any, data: any, field: string) {
    //   console.log(field)
    //   this.editField = field
    //   this.selectedRiro=data
    //   this.selectedEditIndex = data.riro_key_id
    //   var index = this.tempData.findIndex((data: any) => {
    //     return data.riro_key_id== this.selectedEditIndex
    //   })
  
     
    //       if (this.editField == 'ip_address' || this.editField == 'panel_id') {
  
    //         this.tempField.setValue(this.tempData[index].data[this.editField])
    //       }
    //       else if (this.editField == 'panel_id') {
    //         this.tempField.setValue(this.tempData[index].data.panel_data[this.editField])
    //       }
    //       else if (this.editField == 'five_meter') {
  
    //         this.tempField.setValue(this.tempData[index][this.editField].violation?this.tempData[index].this.editField.violation?'Yes':'No':'No')
    //       }
    //       else {
    //         this.tempField.setValue(this.tempData[index][this.editField])
      
    //       }
    //       this.modalService.open(modal, { backdrop: 'static' })
        
  
     
  
    // }
    // SaveFieldChanges() {
    //   var editContainer = document.getElementById('editField')
    //   editContainer.classList.add('loading')
    //   if(this.editField!='tagname'){
    //   var index = this.tempData.findIndex((data: any) => {
    //     return data.riro_key_id == this.selectedEditIndex
    //   })
    // }
  
    //   var temp = this.tempData[index]
    //   if (this.editField === 'five_meter') {
    //     this.tempField.setValue(this.tempField.value === 'Yes' ? true : false)
    //   }
    //   var field = this.editField
    //   var data2: any = {
    //     riro_key_id: this.selectedEditIndex,
  
    //   }
  
    //   data2[this.editField] = this.tempField.value
    //   this.server.EditRiroJob(data2).subscribe((response: any) => {
    //     editContainer.classList.remove('loading')
  
    //     if (response.success) {
    //       this.server.notification(response.message)
    //       this.getJobsheetData()
    //       this.GetJobsheetStatus()
    //       this.modalService.dismissAll()
    //     }
    //     else {
    //       this.server.notification(response.message, 'Retry')
    //     }
    //   }, Err => {
    //     editContainer.classList.remove('loading')
  
    //     this.server.notification('Error while updating', 'Retry')
    //   })
  
    // }

    VerifyTrueViol(event: any, viol: any) {
      this.editViol = viol
      this.server.VerifyViolation(this.editViol._id.$oid, true).subscribe((response: any) => {
        this.server.notification(response.message)
        if (response.success) {
          this.modalService.dismissAll()
          // if (this.isdatewise)
          this.GetunallocatedJobs()
          this. refreshPage()
        }
        if (!this.isdatewise) {
          this.GetunallocatedJobs()
        }
      }, (Err: any) => {
        this.server.notification("Error while the  Process", 'Retry')
      })
    }

    VerifyFalseViol(event: any, viol: any) {
      this.editViol = viol
      this.server.VerifyViolation(this.editViol._id.$oid, false).subscribe((response: any) => {
        this.server.notification(response.message)
        if (response.success) {
          this.modalService.dismissAll()
          // if (this.isdatewise)
          this.GetunallocatedJobs()
          this. refreshPage()
        }
        if (!this.isdatewise) {
          this.GetunallocatedJobs()
        }
      }, (Err: any) => {
        this.server.notification("Error while the  Process", 'Retry')
      })
    }


    // createExcel() {
    //   const url = 'http://localhost:5000/UnplannedJobscreate_excel';
  
    //   this.http.get(url, { responseType: 'arraybuffer' })
    //     .subscribe((data: ArrayBuffer) => {
    //       this.saveAsExcel(data);
    //     });
    // }
  
    // saveAsExcel(buffer: ArrayBuffer) {
    //   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   const url = window.URL.createObjectURL(blob);
  
    //   // Create a link element and click it to trigger the download
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = 'unplanned_jobs.xlsx';
    //   link.click();
  
    //   // Cleanup
    //   window.URL.revokeObjectURL(url);
    // }


    // createExcel() {
    //   const createExcelUrl = this.IP+'/UnplannedJobscreate_excel';
    //  console.log('create excel')
    //   this.http.get(createExcelUrl)
    //     .subscribe((data: any) => {
    //       console.log('Excel created successfully:', data);
    //       this.downloadExcel();
    //     });
    // }
  
    // downloadExcel() {
    //   const downloadExcelUrl = this.IP+'/Unplannedexcel_download';
  
    //   this.http.get(downloadExcelUrl, { responseType: 'blob' })
    //     .subscribe((blob: Blob) => {
    //       saveAs(blob, 'unplanned_jobs.xlsx');
    //     });
    // }






    // createExcel() {
    //   const createExcelUrl = this.IP + '/UnplannedJobscreate_excel';
    
    //   console.log('Create Excel');
    //   // Make a GET request to create the Excel file
    //   this.http.get(createExcelUrl)
    //     .subscribe(
    //       (data: any) => {
    //         console.log('Excel created successfully:', data);
    
    //         // Extract relevant information from the server response
    //         const serverResponse = data; // Adjust this based on the actual structure of the response
    
    //         // Call the downloadExcel function with the server response
    //         this.downloadExcel(serverResponse);
    //       },
    //       (error) => {
    //         // Display error message to the user
    //         this.handleServerError(error);
    //       }
    //     );
    // }
    
    // downloadExcel(serverResponse: any) {
    //   const downloadExcelUrl = this.IP + '/Unplannedexcel_download';
    
    //   // Make a GET request to download the Excel file
    //   this.http.get(downloadExcelUrl, { responseType: 'blob' })
    //     .subscribe((blob: Blob) => {
    //       // Use the server response or perform additional actions as needed
    //       console.log('Download Excel successful');
    
    //       // Save the Blob as a file
    //       saveAs(blob, 'unplanned_jobs.xlsx');
    
    //       // Display success message to the user using the server response
    //       this.handleServerResponse(serverResponse);
    //     },
    //     (error) => {
    //       // Display error message to the user
    //       this.handleServerError(error);
    //     });
    // }
    
    // handleServerResponse(response: any) {
    //   // Display server response to the user
    //   console.log('Server Response:', response);
    
    //   // You can use the response to perform additional actions or display information to the user
    //   this.notification(response.message, 'Success');
    // }
    
    // handleServerError(error: any) {
    //   // Assuming server response contains an 'error' property
    //   const errorMessage = error.error && error.error.error ? error.error.error : 'An error occurred';
    
    //   // Display error message to the user
    //   this.notification(errorMessage, 'Error');
    //   console.error('Server error', error);
    // }
    
    // notification(message: string, action?: string) {
    //   // Your notification logic here
    //   console.log('Notification:', message);
    // }
    




    createExcel() {
      const createExcelUrl = this.IP + '/UnplannedJobscreate_excel';
  
      console.log('Create Excel');
      // Make a GET request to create the Excel file
      this.http.get(createExcelUrl)
        .subscribe(
          (data: any) => {
            console.log('Excel created successfully:', data);
  
            // Display success message for Excel creation
            // this.notification('Excel file created successfully', 'Success');
  
            // Extract relevant information from the server response
            const serverResponse = data; // Adjust this based on the actual structure of the response
  
            // Call the downloadExcel function with the server response
            this.downloadExcel(serverResponse);
          },
          (error) => {
            // Display error message to the user
            this.handleServerError(error);
          }
        );
    }
  
    downloadExcel(serverResponse: any) {
      const downloadExcelUrl = this.IP + '/Unplannedexcel_download';
  
      // Make a GET request to download the Excel file
      this.http.get(downloadExcelUrl, { responseType: 'blob' })
        .subscribe((blob: Blob) => {
          // Use the server response or perform additional actions as needed
          console.log('Download Excel successful');
  
          // Save the Blob as a file
          saveAs(blob, 'unplanned_jobs.xlsx');
  
          // Display success message for Excel download
          // this.notification('Excel file downloaded successfully', 'Success');
  
          // Display success message to the user using the server response
          this.handleServerResponse(serverResponse);
        },
        (error) => {
          // Display error message to the user
          this.handleServerError(error);
        });
    }
  
    handleServerResponse(response: any) {
      // Display server response to the user
      console.log('Server Response:', response);
  
      // You can use the response to perform additional actions or display information to the user
      this.notification(response.message, 'Success');
    }
  
    handleServerError(error: any) {
      // Assuming server response contains an 'error' property
      const errorMessage = error.error && error.error.error ? error.error.error : 'An error occurred';
  
      // Display error message to the user
      this.notification(errorMessage, 'Error');
      console.error('Server error', error);
    }
  
    notification(message: string, action?: string) {
      this.snackbar.open(message, action ? action : '', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }



    // deleteRow(riroKeyId: number) {
    //   const deleteApiUrl = `http://localhost:5000/delete_unplannedRiro/${riroKeyId}`;
  
    //   this.http.delete(deleteApiUrl)
    //     .subscribe(() => {
    //       console.log(`Row with riro_key_id ${riroKeyId} deleted successfully.`);
    //       this.server.GetunallocatedJobs(); // Refresh the table after deletion
    //     });
    // }

  //   deleteRow(riroKeyId: any) {
  //     const deleteApiUrl = this.IP+'/delete_unplannedRiro/'+riroKeyId;
  
  //     // Include riroKeyId as a parameter in the URL
  //     this.http.get(deleteApiUrl, { params: { riro_key_id: riroKeyId.toString() } })
  //       .subscribe((response: any) => {
  //         console.log(`Row with riro_key_id ${riroKeyId} deleted successfully.`);
  //         this.server.GetunallocatedJobs(); // Refresh the table after deletion
  //       });

  //   //     if (this.server.notification && Array.isArray(this.server.notification)) {
  //   //       this.notifications = response.notifications;
  //   //     }
  //   // }

  //   // Display notifications from the API
  //   if (response.notifications && response.notifications.length > 0) {
  //     response.notifications.forEach((notification: string) => {
  //       this.notificationService.notification(notification, 'success');
  //     });
  //   }
  // }


  
  GetunallocatedJobs(){
    this.server.GetunallocatedJobs();
  }


  // createExcel() {
  //   const createExcelUrl = this.IP+'/UnplannedJobscreate_excel';

  //   // Make a GET request to create the Excel file
  //   this.http.get(createExcelUrl, { responseType: 'blob' })
  //     .subscribe((blob: Blob) => {
  //       // Create a Blob object and initiate the download
  //       const link = document.createElement('a');
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = 'unplanned_jobs.xlsx';
  //       link.click();
  //       this.downloadExcel()
  //     });
  // }

  // downloadExcel() {
  //   const downloadExcelUrl = this.IP+'/Unplannedexcel_download';

  //   // Make a GET request to download the Excel file
  //   this.http.get(downloadExcelUrl, { responseType: 'blob' })
  //     .subscribe((blob: Blob) => {
  //       // Create a Blob object and initiate the download
  //       const link = document.createElement('a');
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = 'unplanned_jobs.xlsx';
  //       link.click();
  //     });
  // }



  // createExcel() {
    
    
  //   const createExcelUrl = this.API+'/UnplannedJobscreate_excel';
   
  //   http://localhost:5000/UnplannedJobscreate_excel
  
  //   // Make a GET request to create the Excel file
  //   this.http.get(createExcelUrl, { responseType: 'blob' })
  //     .subscribe(
  //       (blob: Blob) => {
  //         // Create a Blob object and initiate the download
  //         const link = document.createElement('a');
  //         link.href = window.URL.createObjectURL(blob);
  //         link.download = 'unplanned_jobs.xlsx';
  //         link.click();
  
  //         // Display server response to the user
  //         this.handleServerResponse(blob);
  //       },
  //       (error) => {
  //         // Display error message to the user
  //         this.handleServerError(error);
  //       }
  //     );
  //     this.downloadExcel()
  // }
  
  // downloadExcel() {
  //   const downloadExcelUrl = this.API+'/Unplannedexcel_download';
  
  //   // Make a GET request to download the Excel file
  //   this.http.get(downloadExcelUrl, { responseType: 'blob' })
  //     .subscribe(
  //       (blob: Blob) => {
  //         // Create a Blob object and initiate the download
  //         const link = document.createElement('a');
  //         link.href = window.URL.createObjectURL(blob);
  //         // link.download = 'unplanned_jobs.xlsx';
  //         link.click();
  
  //         // Display server response to the user
  //         this.handleServerResponse(blob);
  //       },
  //       (error) => {
  //         // Display error message to the user
  //         this.handleServerError(error);
  //       }
  //     );
  // }
  
  // handleServerResponse(blob: Blob) {
  //   const reader = new FileReader();
  //   reader.onload = (event: any) => {
  //     const response = JSON.parse(event.target.result);
  
  //     // Display server response to the user
  //     this.server.notification(response.message, 'Success');
  //   };
  //   reader.readAsText(blob);
  // }
  
  // handleServerError(error: any) {
  //   // Assuming server response contains an 'error' property
  //   const errorMessage = error.error && error.error.error ? error.error.error : 'An error occurred';
  
  //   // Display error message to the user
  //   this.server.notification(errorMessage, 'Error');
  //   this.alertmessage = "Data range should be " + this.ExcelRange + " days"
  //   this.server.notification(this.alertmessage)
  //   console.error('Server error', error);
  // }
  
  // notification(message: string, action?: string) {
  //   this.snackBar.open(message, action ? action : '', {
  //     duration: 4000,
  //     panelClass: ['error'],
  //     horizontalPosition: 'center',
  //     verticalPosition: 'bottom',
  //   });
  // }
  

  // EditRack(event: any) {
  //   console.log(event)
  //   this.editedRackProc = event.target.value
  // }


//   SaveRackChanges() {
//     var index = this.tempData.findIndex((data: any) => {
//       return data.riro_key_id == this.selectedEditIndex
//     })
//     var field=this.editField
//     console.log(index)
// var data1:any={
//   riro_key_id:this.selectedEditIndex,

// }
// data1[this.editField]= this.editedRackProc
// console.log(data1)
// this.server.EditRiroJob(data1).subscribe((response:any)=>{
//   if(response.success){
//     console.log(response)
//     this.tempData[index].rack_process = this.editedRackProc
   
// this.getRiroHistory()   
//  this.modalService.dismissAll()
//   }
//   else{
//     this.server.notification(response.message,'Retry')
//   }
//   },
//   Err=>{
//     this.server.notification('Error while updating','Retry')
//   })
//   }
  // getRiroHistory(){
  //   var container=document.getElementById('dataTable')
  //   container.classList.add('loading')
  //   this.server.GetRiroHistoryByPanel(this.data).subscribe((response:any)=>{
  //     console.log(response)
  //     container.classList.remove('loading')

  //     if(response.success){
  //       this.tempData=response.message.riro_data
  //       this.panelData=of(response.message.riro_data)
  //       this.sliceData()
  //     }
  //     else{
  //       this.server.notification(response.message,'Retry')
  //     }
  //   },Err=>{
  //     container.classList.remove('loading')

  //     this.server.notification('Error while fetching the data')
  //   })
  // }


  // getRiroHistory(){
  //   var container=document.getElementById('dataTable')
  //   container.classList.add('loading')
  //   this.server.GetRiroHistoryByPanel(this.data).subscribe((response:any)=>{
  //     console.log(response)
  //     container.classList.remove('loading')

  //     if(response.success){
  //       this.tempData=response.message.riro_data
  //       this.panelData=of(response.message.riro_data)
  //       this.sliceData()
  //     }
  //     else{
  //       this.server.notification(response.message,'Retry')
  //     }
  //   },Err=>{
  //     container.classList.remove('loading')

  //     this.server.notification('Error while fetching the data')
  //   })
  // }
 ngOnDestroy(): void {
   this.modalService.dismissAll()
 }




 RemarkModal(modal: any, data: any,field:any) {
  this.editField=field
  console.log('edit')
  console.log('remark modal')
  this.selectedRiro=data
  this.selectedEditIndex = data.riro_key_id
  console.log(data.sl_no)
  this.modalService.open(modal, {  size:'xl'})

 this.rackProcess.setValue(data.rack_process)
}


SaveRemark() {
  var index = this.tempData.findIndex((data: any) => {
    return data.riro_key_id == this.selectedEditIndex
  })
  console.log(index)
 var data1:any ={
  riro_key_id:this.selectedEditIndex,

 }
 data1[this.editField]=this.remarkControl.value
 this.server.EditRiroJob(data1).subscribe((response:any)=>{

  if(response.success){
    this.server.notification(response.message)
     this.getRiroHistory()
     this. refreshPage()
    this.modalService.dismissAll()
  }
  else{
    this.server.notification(response.message,'Retry')
  }
 },
 Err=>{
  this.server.notification('Error while updating','Retry')
 })
  
}

getRiroHistory(){
  var container=document.getElementById('dataTable')
  container.classList.add('loading')
  this.server.GetunallocatedJobs().subscribe((response:any)=>{
    console.log("INPUT DATA =====================",this.data)
    console.log(response)
    container.classList.remove('loading')

    if(response.success){
      this.tempData=response.message
      this.panelData=of(response.message)
      this.sliceData()
    }
    else{
      this.server.notification(response.message,'Retry')
    }
  },Err=>{
    container.classList.remove('loading')

    this.server.notification('Error while fetching the data','Retry')
  })
}

EditRemark(modal:any,data:any,field:any){
  this.editField=field
  this.selectedEditIndex = data.riro_key_id
  console.log(this.tempData,'this is tempdata')
  var index = this.tempData.findIndex((data: any) => {
    return data.riro_key_id == this.selectedEditIndex
  })
  var temp = this.tempData[index]
  console.log(temp,'this.temp')
  this.remarkControl.setValue(temp.remarks)

  // console.log(data.sl_no)

  this.modalService.open(modal, {  backdrop:'static'})
}


EditRack(event: any) {
  console.log(event)
  this.editedRackProc = event.target.value
}

SaveRackChanges() {
  var index = this.tempData.findIndex((data: any) => {
    return data.riro_key_id == this.selectedEditIndex
  
  })
  var field=this.editField
  console.log(index)
var data1:any={
riro_key_id:this.selectedEditIndex

}
data1[this.editField]= this.editedRackProc
console.log(data1)
this.server.EditRiroJob(data1).subscribe((response:any)=>{
if(response.success){
  console.log(response)
  this.tempData[index].rack_process = this.editedRackProc
 this.sliceData() 
this.getRiroHistory()   
this. refreshPage()
this.modalService.dismissAll()
}
else{
  this.server.notification(response.message,'Retry')
}
},
Err=>{
  this.server.notification('Error while updating','Retry')
})
}


deleteRow(riroKeyId: number) {
  const deleteApiUrl = this.IP+'/delete_unplannedRiro/'+riroKeyId;

  // Include riroKeyId as a parameter in the URL
  this.http.get(deleteApiUrl, { params: { riro_key_id: riroKeyId.toString() } })
    .subscribe((response: any) => {
      console.log(`Row with riro_key_id ${riroKeyId} deleted successfully.`);

      // Display notifications from the API
      if (response.message && response.message.length > 0) {
        
          this.server.notification(response.message);
        
      }

      this.server.GetunallocatedJobs(); // Refresh the table after deletion
      this. refreshPage()
    });
}
  
RirDeleteModal(modal:any,id:any){
  console.log(id)
  this.selectedEditIndex=id

  this.modalService.open(modal)

}
RiroDelete(){
  var index = this.tempData.findIndex((data: any) => {
    return data.riro_key_id === this.selectedEditIndex
  })
  console.log(index)
  var tempData = this.tempData[index]
  // var data = {
  //   panel_no: tempData.data.panel_data.panel_id,
  //   imagename: tempData.data.image_name,
  //   id: tempData._id.$oid
  // }
  //need to integrate delete job api if the response true need to splice that from the data
  this.server.DeleteUnallocated(this.selectedEditIndex).subscribe((response: any) => {
    this.server.notification(response.message)
    if (response.success) {
     this.RefreshData();
    this. refreshPage()
    }
    this.modalService.dismissAll()
  },
    Err => {
      this.server.notification('Error while deleting job', 'Retry')
    })

}

// refreshPage(): void {
//   location.reload();
// }

// refreshPage(): void {
//   this.ngZone.runOutsideAngular(() => {
//     location.reload();
//   });
// }

refreshPage(): void {
  // Show a success message
  // this.snackBar.open('Page is refreshing...', 'Close', {
  //   duration: 2000, // milliseconds
  // });

  // Reload the page after a delay
  setTimeout(() => {
    location.reload();
  }, 50000); // Adjust the delay as needed
}
}
