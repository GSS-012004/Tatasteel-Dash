import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EsiUnallocatedService } from './esi-unallocated.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Lightbox } from 'ngx-lightbox';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-esi-unallocated',
  templateUrl: './esi-unallocated.component.html',
  styleUrls: ['./esi-unallocated.component.css']
})

export class EsiUnallocatedComponent implements OnInit,OnDestroy {
    data:any[] = []
    Images: any[] = []
    tempData:any[]
    pageSize: number = 10
    page: number = 1
    id:any
    shutdownName: any;
    time: any;
    API: any;
    selectedEditIndex: any
    queryParams:any
    selectedRiro: any
    editViol: any
    unplannedInterval:any
    unallocatedJob:any
    editedRackProc:any
    editedFeedNo:any
    editField: string
    dataFetchStatus:string='init'
    remarkControl:FormControl=new FormControl()
    editfeedControl:FormControl=new FormControl()
    verification:FormControl=new FormControl
    rackProcess:FormControl= new FormControl('',Validators.required)
    total: Observable<number> = of(0)
    panelData:Observable< any[]>=of([])
    isHistory:boolean=false
    loading: boolean = false
    table: HTMLElement
    @ViewChild('unAllocatedJobAlert') Violation: ElementRef<any>;
  
    constructor
    ( private http :HttpClient,
      public server:EsiUnallocatedService,
      public modalService: NgbModal,
      public router: Router,
      private _lightbox: Lightbox,
      public  toasterService:ToastrService,
      public currentRoute:ActivatedRoute)
    {
      this.currentRoute.queryParams.subscribe((data:any)=>{
      this.isHistory=data.isHistory
      this.id=data.shutdownId
      console.log(this.shutdownName=data.shutdownName)
      console.log(this.time=data.time)
      this.queryParams=data})

      var res=this.loadConfigFile('assets/config.json')
      res=JSON.parse(res)
      this.API=res.IP
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
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.GetunallocatedJobs()

      if(!this.isHistory){
        this.GetUnplannedData()
      }
 
    }


    GetunallocatedJobs(){
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.server.GetunallocatedJobs(this.isHistory,this.id).subscribe((response:any) =>{
        if(response.success){
          this.tempData =  response.message;
          this.panelData=of(response.message)
          this.sliceData();
          table?.classList.remove('loading')
        }

        else{
          this.table != null ? this.table.classList.remove('loading') : ''
          this.total=of(0)
          this.tempData=[]
          this.server.notification(response.message,'Retry')
          table?.classList.remove('loading')
          this.dataFetchStatus = 'success'
          table?.classList.remove('loading')
        }},
        Err => {
          this.server.notification("Error While fetching the data",'Retry')
          this.dataFetchStatus='Error'
        }) 
    }


    sliceData(){
      this.total = of((this.tempData.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)).length)
      this.total = of(this.tempData.length)
      this.data=(this.tempData.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize))
      this.panelData = of((this.tempData.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
    }



    imageCarousal(viol: any) {
      this.Images = [];
      if(Array.isArray(viol.riro_image.After)) {
        viol.riro_image.After.forEach((imgname: string, index: number) => {
        this.Images[index] = {
          src: this.API + '/Unplannedriroimage/' + imgname,
          thumb: this.API + '/Unplannedriroimage/' + imgname,
          caption: imgname,
        };
      });
      }
      else if (typeof viol.riro_image.After === 'string') {
        // If viol.riro_image.After is a string, assume it's a single image
        this.Images[0] = {
          src: this.API + '/Unplannedriroimage/' + viol.riro_image.After,
          thumb: this.API + '/Unplannedriroimage/' + viol.riro_image.After,
          caption: viol.riro_image.After,
        };
      } 
      else{
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
        } 
        else if (typeof viol.Before === 'string') {
            // If viol.Before is a string, assume it's a single image
          this.Images[0] = {
            src: this.API + '/Unplannedriroimage/' + viol.Before,
            thumb: this.API + '/Unplannedriroimage/' + viol.Before,
            caption: viol.Before,
          };
        } 
        else {
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
    
    EditRack(event: any) {
      console.log(event)
      this.editedRackProc = event.target.value
    }

    EditFeedNo(event: any) {
      console.log(event)
      this.editedFeedNo =event.target.value
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
          this.server.notification(response.message)
          this.tempData[index].rack_process = this.editedRackProc
          this.sliceData() 
          this. GetunallocatedJobs()  
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


    SaveFeedNoChanges() {
      var index = this.tempData.findIndex((data: any) => {
        return data.riro_key_id == this.selectedEditIndex
      })
      var data1:any ={
      riro_key_id:this.selectedEditIndex,
      }

      data1[this.editField]=this.editfeedControl.value
      this.server.EditRiroJob(data1).subscribe((response:any)=>{
    
      if(response.success){
        this.server.notification(response.message)
        this. GetunallocatedJobs()
        this.modalService.dismissAll()
      }
      else{
        this.server.notification(response.message,'Retry')
      }
      },
      _Err=>{
        this.server.notification('Error while updating','Retry')
      })
      
    }
    

    VerifyTrueViol(event: any, viol: any) {
      this.editViol = viol
      this.server.VerifyViolation(this.editViol._id.$oid, true).subscribe((response: any) => {
        this.server.notification(response.message)
       
        if (response.success) {
          this.GetunallocatedJobs();
          this.modalService.dismissAll()
         
          this. GetunallocatedJobs()
        }
        this. GetunallocatedJobs()
        }, 
        (_Err: any) => {
        this.server.notification("Error while the  Process", 'Retry')
        })
    }

    VerifyFalseViol(event: any, viol: any) {
      this.editViol = viol
      this.server.VerifyViolation(this.editViol._id.$oid, false).subscribe((response: any) => {
        this.server.notification(response.message)
       
        if (response.success) {
          this.GetunallocatedJobs();
          this.modalService.dismissAll()
          this. GetunallocatedJobs()
          
        }
        this. GetunallocatedJobs()
        }, 
        (_Err: any) => {
            this.server.notification("Error while the  Process", 'Retry')
        })
    }



    RemarkModal(modal: any, data: any,field:any,) {
      this.editField=field
      console.log('remark modal')
      this.selectedRiro=data
      this.selectedEditIndex = data.riro_key_id
      this.modalService.open(modal, {size:'xl'})
      this.rackProcess.setValue(data.rack_process)
       this.editfeedControl.setValue(data.panel_no)
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
      this.modalService.open(modal, {  backdrop:'static'})
    }

    EditFeed(modal:any,data:any,field:any){
      this.editField=field
      this.selectedEditIndex = data.riro_key_id
      console.log(this.tempData,'this is tempdata')
      var index = this.tempData.findIndex((data: any) => {
        return data.riro_key_id == this.selectedEditIndex
      })
      var temp = this.tempData[index]
      console.log(temp,'this.temp')
      this.editfeedControl.setValue(temp.panel_no)
      this.modalService.open(modal, {  backdrop:'static'})
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
          this. GetunallocatedJobs()
          this.modalService.dismissAll()
        }
        else{
          this.server.notification(response.message,'Retry')
        }
      },
      _Err=>{
        this.server.notification('Error while updating','Retry')
      })
    }
    
    clearTextarea() {
      this.remarkControl.reset(); // Reset the value of the textarea
    }
    
    



    createExcel(id?:any) {
      if(this.isHistory){
        const createExcelUrl = this.API + '/UnplannedJobscreate_excel/' +id;
          // Make a GET request to create the Excel file
        this.http.get(createExcelUrl).subscribe((Response: any) => {
            console.log('Excel created successfully:', Response);

            // Extract relevant information from the server response
            const serverResponse = Response.message; // Adjust this based on the actual structure of the response
  
            // Call the downloadExcel function with the server response
            if(Response.success){
              this.downloadExcel(serverResponse,Response.filename);
            }
            else{
              this.server.notification(Response.message,'Retry')
            }
          }
         ,
          (error) => {
            // Display error message to the user
            this.handleServerError(error);
          }
        );
      }
      else{
        const createExcelUrl = this.API + '/UnplannedJobscreate_excel';
          // Make a GET request to create the Excel file
        this.http.get(createExcelUrl).subscribe( (Response: any) => {
          console.log('Excel created successfully:', Response);

            // Extract relevant information from the server response
          const serverResponse = Response.message; // Adjust this based on the actual structure of the response
  
            // Call the downloadExcel function with the server response
          this.downloadExcel(serverResponse,Response.filename);
        },
        (error) => {
            // Display error message to the user
            this.handleServerError(error);
        }
      );}
    }
  
    downloadExcel(serverResponse: any,filename?:any) {
      const downloadExcelUrl = this.API + '/Unplannedexcel_download';
  
      // Make a GET request to download the Excel file
      this.http.get(downloadExcelUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
          // Use the server response or perform additional actions as needed
          console.log('Download Excel successful');
  
          // Save the Blob as a file
          saveAs(blob,filename);
  
          // Display success message for Excel download
  
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
      this.server.notification(' Excel is downloaded successfully');
    }
  
    handleServerError(error: any) {
      // Assuming server response contains an 'error' property
      const errorMessage = error.error && error.error.error ? error.error.error : 'An error occurred';
  
      // Display error message to the user
      this.server.notification(errorMessage, 'Error');
      console.error('Server error', error);
    }

   
    RirDeleteModal(modal:any,id:any){
      this.selectedEditIndex=id
      this.modalService.open(modal)
    }


    RiroDelete(){ 
        var index = this.tempData.findIndex((data: any) => {
          return data.riro_key_id === this.selectedEditIndex
        })
        
        var tempData = this.tempData[index]
        this.server.DeleteUnallocated(this.selectedEditIndex).subscribe((response: any) => {
          this.server.notification(response.message)
          if (response.success) {
              this.GetunallocatedJobs();
          }
            this.modalService.dismissAll()
        },
        _Err => {
          this.server.notification('Error while deleting job', 'Retry')
        })

    }



    Back() {
      window.close()
    }


    ngOnDestroy(): void {
      this.modalService.dismissAll()
      clearInterval(this.unplannedInterval)
      this.toasterService.clear()
    }

    GetUnplannedData(){
      this.unplannedInterval=  setInterval(()=>{
      this.server.GetUnallocatedLiveCount().subscribe((response:any)=>{
        if(response.success){
          if(response.now_live_count-response.previous_live_count>0){
              this.GetunallocatedJobs();
            }
          }
        })
      },this.server.unplannedInterval)
    }
    
    resetVerification(data: any): void {
      // Reset the verification status to null or any initial value as needed
      data.violation_verificaton_status = null;
    }

}

