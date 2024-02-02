
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import {  Moment } from 'moment';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { Lightbox, LightboxConfig } from 'ngx-lightbox';
import { DashboardService } from './dashboard.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  selectedMoments: { startDate: Moment | any, endDate: Moment | any }
  ECDetails: any[]=[]
  cameraStatus: any = { total_cam_count: 0, enable_data_count: 0, disable_data_count: 0, not_working_cam_count: 0, working_cam_count: 0 }
  disabledCamDetails: any[] = []
  violationsCount: any = { total_count: 0, ppe_count: 0, ra_count: 0,cr_count:0 }
  NWCamDetails: any[] = []
  fromDate: any
  toDate: any
  violationList: any[] = []
  DaterangepickerDirective: DaterangepickerDirective
  IP: any
  dashboardDelay: number
  ppeViolations: any[] = []
  ccViolations:any[]=[]
  RAViolations: any[] = []
  chartOptionsBar: any
  chartOptionsPie: any
  isDatewise: boolean =false
  Interval1:any
  Object:any=Object
  allViolationDetails: any[] = []
  images: any[] = []
  aiSolutions:any={RA:'Danger Zone',PPE:'Personal Protective Equipment',TC:'Traffic Count' ,CR:'Crowd Count',fire:'Fire',smoke:'Smoke' }
  dateinputControl:FormControl=new FormControl('',Validators.required)
  calendericon: boolean = false
  datanotfound:boolean = false 
  dataFetchStatus:string ='init'
  licenseDetails:{added_cameras_count:number,remaining_license:number,total_license:number}
  interval: any;
  delay:number=0

  ranges: any = {
    'Today': [dayjs().hour(0).minute(0).second(0), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days').hour(0).minute(0).second(0), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days').hour(0).minute(0).second(0), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days').hour(0).minute(0).second(0), dayjs()],
    'This Month': [dayjs().startOf('month').hour(0).minute(0).second(0), dayjs().endOf('month')],
  }

  @ViewChild('reportrange', { static: true }) reportRange: any
  @ViewChild('datepicker', { static: true }) datePicker: any
  @ViewChild(DaterangepickerDirective, { static: true }) pickerDirective: DaterangepickerDirective

  constructor(
    private server:DashboardService, private modalService: NgbModal, private Router: Router,
    private _lightbox: Lightbox,
    private _lightBoxConfig: LightboxConfig
    )
  {
    this.IP = this.server.IP
    this.dashboardDelay = this.server.dashboardInterval
    this.delay = this.server.logInterval
    
      
    
    this.GetLicenseDetails()

    this.server.GetPPEViolCountCamWise().subscribe((response: any) => {})

    this.server.GetViolationList().subscribe((response: any) => {
      this.violationList = response.message
    })

    this.server.GetCamerasStatus().subscribe((data: any) => {
      this.cameraStatus = data.message[0]
    })

    this.server.GetLiveViolationCount().subscribe((response: any) => {
      if (response.success) {
        this.violationsCount = response.message
        this.ChartDraw()
      }
      else{
        this.violationsCount={total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0 }
      }
    },Err=>{
    })

    this.Interval1=  setInterval(() => {
      this.server.GetCamerasStatus().subscribe((data: any) => {
        this.cameraStatus = data.message[0]
      })
      if (!this.isDatewise) {
        this.server.GetLiveViolationCount().subscribe((response: any) => {
          if (response.success) {
            if (!this.isDatewise) {
              this.violationsCount = response.message
              this.ChartDraw()
            }
          }
          else{
            this.violationsCount={total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0}
          }
        },Err=>{
          this.violationsCount={total_count: 0, ppe_count: 0, ra_count: 0,cr_count:0 }

        })
      }

    }, this.dashboardDelay)

    //lightbox configaration
    this._lightBoxConfig.showDownloadButton = false
    this._lightBoxConfig.showZoom = true
    this._lightBoxConfig.showImageNumberLabel = true
    this._lightBoxConfig.fitImageInViewPort = true
    this._lightBoxConfig.disableScrolling = false
    this._lightBoxConfig.centerVertically = false

    //  this.GetLicenseDetails()

    this.interval = setInterval(() =>{
      this.GetLicenseDetails()
    },this.delay);

  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // console.log(this.pickerDirective)
  }


  ToCameras() {
    this.Router.navigate(['/app/CameraSettings'])
  }

  openECDetailsModal(modal: any) {
    this.modalService.open(modal, { scrollable: true, size: 'xl' })
    this.images.splice(0, this.images.length)
    var table = document.getElementById('dataTable')
    table.classList.add('loading')
    this.server.GetECSolutionCount().subscribe((response: any) => {
      table.classList.remove('loading')
      if(response.success){
      this.ECDetails = response.message
      }
      else{
        this.datanotfound = true
        this.dataFetchStatus='success'
      }
    },Err=>{
      this.datanotfound = true
      this.dataFetchStatus='Error'
      table.classList.remove('loading')
    })  
  }


  openDCDetailsModal(modal: any) {
    this.images.splice(0, this.images.length)
    this.modalService.open(modal, { size: 'xl', scrollable: true })
    var table = document.getElementById('dataTable3')
    table.classList.add('loading')

    this.server.DisableCamDetails().subscribe((response: any) => {
      table.classList.remove('loading')
      if (response.success) {
        this.disabledCamDetails = response.message
        this.disabledCamDetails.forEach((element: any, index: number) => {
          this.images[index] = {
            src: this.IP + '/get_roi_image/' + element.imagename,
            thumb: this.IP + '/get_roi_image/' + element.imagename,
            caption: element.imagename,
          }
        });
      }
      else{
        this.datanotfound = true
        this.dataFetchStatus='success'
      }
    },
      Err => {
        this.datanotfound = true
        this.dataFetchStatus='Error'
        this.modalService.dismissAll()
        table.classList.remove('loading')

      })

  }

  openNWCDetailsModal(modal: any) {
    this.images.splice(0, this.images.length)
    this.modalService.open(modal, { size: 'xl', scrollable: true })
    var table = document.getElementById('dataTable2')
    table.classList.add('loading')

    this.server.GetNotWorkingCameraDetails().subscribe((response: any) => {
      table.classList.remove('loading')
      if (response.success) {
        
        this.NWCamDetails = response.message
        this.NWCamDetails.forEach((element: any, index: number) => {
          this.images[index] = {
            src: this.IP + '/get_roi_image/' + element.imagename,
            thumb: this.IP + '/get_roi_image/' + element.imagename,
            caption: element.imagename,
          }
        });
      }
      else{
        table.classList.remove('loading')
        this.datanotfound = true
        this.dataFetchStatus='success'
      }
    }, Err => {
      table.classList.remove('loading')
      this.datanotfound = true
      this.dataFetchStatus='Error'
      this.modalService.dismissAll()
    })
    this.NWCamDetails=[]
  }


  RefreshData() {
    this.isDatewise = false
    this.server.GetLiveViolationCount().subscribe((response: any) => { 
      if (response.success) {
        if (!this.isDatewise) {
          this.violationsCount = response.message
          this.ChartDraw()
          this.cleardateinputfield()
          this.datanotfound = false
        }
      }
      else{ 
        this.violationsCount={ total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0}
        this.ChartDraw()
        this.cleardateinputfield()
        this.datanotfound = false
      }
    },
    Err=>{
      this.server.notification('Error while fetching the data','Retry')
      this.violationsCount={ total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0}
      this.ChartDraw()
      this.cleardateinputfield()
      this.datanotfound = false
    })
  }

  ChartDraw() {
    this.chartOptionsPie = {
      animationEnabled: true,
      title: {
        text: 'Violations',
      },
      subtitles: [
        {
          text: ''
        },
      ],
      data: [
        {
          type: 'pie', //change type to column, line, area, doughnut, etc
          indexLabel: '{name}: {y}',
          dataPoints: [
           
          ],
        },
      ],
    };

   if( this.violationList.indexOf('RA')>=0){
    this.chartOptionsPie.data[0].dataPoints.push( {
      name: 'Danger Zone',
      y: this.violationsCount.ra_count? this.violationsCount.ra_count:0,
      color: '#5DABFF',
    })
   }
  
   if( this.violationList.indexOf('CRDCNT')>=0){
    this.chartOptionsPie.data[0].dataPoints.push( {
      name: 'Crowd Count',
      
      y: this.violationsCount.cr_count? this.violationsCount.cr_count:0,
      // color: '#00d4ff',
      color:'#128ec1',
    })
   }
   if( this.violationList.indexOf('PPE')>=0){
    this.chartOptionsPie.data[0].dataPoints.push( {
      name: 'Personal Protective Equipment',
      y: this.violationsCount.ppe_count? this.violationsCount.ppe_count:0,
      color: '#6287b2',
 
    })
   }
   console.log(this.chartOptionsPie)
    this.chartOptionsBar = {
      // theme:'',
      title: {
        text: 'Violations',
      },
      animationEnabled: true,
      axisY: {
        includeZero: true,
        suffix: '',
      },
      axisX:{
        // valueFormatString: "str",
      },
     
      data: [
        {
          type: 'column',
          indexLabel: '{y}',

          yValueFormatString: '',
          dataPoints: [
            
          ],
        },
      ],
    };

    if( this.violationList.indexOf('RA')>=0){
      this.chartOptionsBar.data[0].dataPoints.push( {
        label: 'Danger Zone',

        y: this.violationsCount.ra_count? this.violationsCount.ra_count:0,
        color: '#5DABFF',
        // color:'#128ec1',
      })
     }
     if( this.violationList.indexOf('PPE')>=0){
      this.chartOptionsBar.data[0].dataPoints.push( {
        label: 'Personal Protective Equipment',

        y: this.violationsCount.ppe_count? this.violationsCount.ppe_count:0,
        color: '#6287b2',
        
      },)
     }
     if( this.violationList.indexOf('CRDCNT')>=0){
      this.chartOptionsBar.data[0].dataPoints.push( {
        label: 'Crowd Count',

        y: this.violationsCount.cr_count? this.violationsCount.cr_count:0,
        // color: '#00d4ff',
        color:'#128ec1',
      },)
     }
     console.log(this.chartOptionsBar)
  }


  cleardateinputfield(){
    this.dateinputControl.reset()
    this.calendericon = false
  }

  dateUpdated(event: any) {
    if (this.selectedMoments.startDate || this.selectedMoments.endDate) {
      var fromDate = this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss')
      var toDate = this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss')

      this.server.GetViolationCountDatewise(this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'), this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss')).subscribe((response: any) => {
        this.isDatewise = true        
       if(response.success){      
        this.violationsCount = response.message 
        this.ChartDraw()
       }
       else{
        this.violationsCount={ total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0}
        this.ChartDraw()
       }
        if (this.selectedMoments.startDate.$D.$M.$Y === new Date().getDate()) {
          this.isDatewise = false
          console.log('todays days matched')
          console.log(this.isDatewise)
        }
      },
        err => {
          this.violationsCount={ total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0}
           this.ChartDraw()
          this.server.notification('Error while fetching the data', 'Retry')
        })

    }
    else {
      console.log('dates else Matched')
      this.isDatewise = false

      this.server.GetViolationCountDatewise(this.server.dateTransform(new Date(new Date(new Date(new Date().setHours(0)).setMinutes(0)).setSeconds(0))), this.server.dateTransform(new Date())).subscribe((response: any) => {        
        if(response.success){
        this.violationsCount = response.message
        this.ChartDraw()
        }
        else{
          this.violationsCount={ total_count: 0, ppe_count: 0, ra_count: 0 ,cr_count:0}
          this.ChartDraw()
        }
      },
        err => {
          this.server.notification('Error while fetching the data', 'Retry')
          this.violationsCount={ total_count: 0, ppe_count: 0, ra_count: 0,cr_count:0 }
          this.ChartDraw()
        })
    }
  }

  openDatePicker(e: MouseEvent) {
    this.calendericon = true
    this.pickerDirective.open(e)
  }



  openAllViolationsModal(modal: any) {
    this.modalService.open(modal, { size: 'xl', scrollable: true })
    var table = document.getElementById('dataTable')
    console.log(table)
    table.classList.add('loading')
    if (this.isDatewise) {
      this.server.GetTotalViolDetailsDatewise(this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'), this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss'))
        .subscribe((response: any) => {
          if (response.success) {
            this.allViolationDetails = response.message
          }
          else{
            this.datanotfound = true
            this.dataFetchStatus = 'success'
          }
          table.classList.remove('loading')
        }, Err => {
          this.datanotfound = true
          this.dataFetchStatus = 'Error'
          this.modalService.dismissAll()
          this.server.notification('Error while fetching the data')
        })
    }
    else {
      this.server.GetTotaliveViolationsDetails().subscribe((response: any) => {
          if (response.success) {
            this.allViolationDetails = response.message
          }
          else{
           this.datanotfound=true
           this.dataFetchStatus='success'
          }
          table.classList.remove('loading')
        }, Err => {
          this.datanotfound=true
           this.dataFetchStatus='Error'
          table.classList.remove('loading')
          // this.modalService.dismissAll()
          this.server.notification('Error while fetching the data')
        })
    }
  }

  raViolationsModal(modal: any) {
    this.modalService.open(modal, { size: 'xl', scrollable: true })
    var table = document.getElementById('dataTableRA')
    console.log(table)
    table.classList.add('loading')
    if (this.isDatewise) {

      this.server.GetRAViolationsDetails(this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'), this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss')).subscribe((response: any) => {
        table.classList.remove('loading')
        if (response.success) {
          this.RAViolations = response.message
        } else {
          this.datanotfound = false
          this.dataFetchStatus ='success'
          this.server.notification(response.message)
        }
      }, Err => {
        this.datanotfound=false
        this.dataFetchStatus ='Error'
        table.classList.remove('loading')
        this.modalService.dismissAll()
        this.server.notification('Error while fetching the data', 'Retry')
      })
    }

    else {
      this.server.RAViolCountCamWise().subscribe((response: any) => {
        if (response.success) {
          table.classList.remove('loading')
          this.RAViolations = response.message
        }
        else {
          this.datanotfound = false
          this.dataFetchStatus = 'success'
          this.server.notification(response.message)
        }
      }, Err => {
        this.datanotfound = false
        this.dataFetchStatus = 'Error'
        table.classList.remove('loading')

        this.server.notification('Error while fetching the data', 'Retry')
      })
    }

  }


  ppeViolationsModal(modal: any) {
    this.modalService.open(modal, { size: 'xl', scrollable: true })
    var table = document.getElementById('dataTablePPE')
    table.classList.add('loading')

    if (this.isDatewise) {
      this.server.GetPPEViolationDetails(this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'), this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss'))
        .subscribe((response: any) => {
          table.classList.remove('loading')
          if (response.success) {
            this.ppeViolations = response.message
          }
          else {
            this.datanotfound = true
            this.dataFetchStatus = 'success'
            this.server.notification(response.message)
          }
        }, Err => {
          this.datanotfound = true
          this.dataFetchStatus = 'Error'
          table.classList.remove('loading')
          this.modalService.dismissAll()
          this.server.notification('Error while fetching the data', 'Retry')
        })
    }
    else {
      this.server.ppeViolCountCamwise().subscribe((response: any) => {
        table.classList.remove('loading')

        if (response.success) {
          this.ppeViolations = response.message
        } else {
          this.datanotfound= true
          this.dataFetchStatus = 'success'
          this.server.notification(response.message)
        }
      }, Err => {
        this.datanotfound = true
        this.dataFetchStatus='Error'
        table.classList.remove('loading')
        this.server.notification('Error while fetching the data', 'Retry')
      })
    }

  }


  CCViolationsModal(modal: any) {
    this.modalService.open(modal, { size: 'xl', scrollable: true })
    var table = document.getElementById('dataTableCC')
    table.classList.add('loading')

    if (this.isDatewise) {
      this.server.GetCCCamwiseDateWise(this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'), this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss'))
      .subscribe((response: any) => {
          table.classList.remove('loading')
          if (response.success) {
            this.ccViolations = response.message
          }
          else {
            this.datanotfound = true
            this.dataFetchStatus = 'success'
            this.server.notification(response.message)
          }
        }, Err => {
          this.datanotfound = true
          this.dataFetchStatus = 'Error'
          table.classList.remove('loading')
          this.modalService.dismissAll()
          this.server.notification('Error while fetching the data', 'Retry')
        })
    }
    else {
      this.server.GetCCLiveDataCamwise().subscribe((response: any) => {
        table.classList.remove('loading')
        if (response.success) {
          this.ccViolations = response.message
        } else {
          this.datanotfound = true
          this.dataFetchStatus = 'success'
          this.server.notification(response.message)
        }
      }, Err => {
        this.datanotfound = true
        this.dataFetchStatus = 'Error'
        table.classList.remove('loading')
        this.server.notification('Error while fetching the data', 'Retry')
      })
    }
  }

  OpenCameraImage(img:any){
    var tempImgs :any=[]
    var  temp = {
      src: this.IP + '/get_roi_image/' + img,
      thumb: this.IP + '/get_roi_image/' + img,
      caption: img,
    }
    tempImgs.push(temp)
    this._lightbox.open(tempImgs,0)


    // if (this._lightbox.supportsZoom()) {
    // }
  }

  // OpenCameraImage(img: any) {
  //   var tempImgs: any[] = [];
  //   var temp = {
  //     src: this.IP + '/get_roi_image/' + img,
  //     thumb: this.IP + '/get_roi_image/' + img,
  //     caption: img,
  //   };
  //   tempImgs.push(temp);
  
  //   // Example: Set options for the lightbox, including max and min size
  //   var lightboxOptions = {
  //     maxWidth: 400, // Set the maximum width of the image
  //     maxHeight: 200, // Set the maximum height of the image
  //     minWidth: 100,  // Set the minimum width of the image
  //     minHeight: 50  // Set the minimum height of the image
  //   };
  
  //   // Example: Assuming _lightbox is the lightbox library object
  //   this._lightbox.open(tempImgs, 0, lightboxOptions);
  // }
  




  // DateWiseViolationsCount() {

  // }

  ngOnDestroy(): void {
    this.modalService.dismissAll()
    clearInterval(this.Interval1)
  }


  GetLicenseDetails(){
    this.server.GetLicenseDetails().subscribe((response:any)=>{
      if(response.success){
       this.licenseDetails = response.message
      }
      else{
        this.server.notification(response.message,'this message is form the license server')
      
      }
    },Err=>{
      
    })
  }
}
