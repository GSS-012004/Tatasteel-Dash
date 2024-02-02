import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef,  OnDestroy, OnInit,  ViewChild, ViewChildren } from '@angular/core';
import { Lightbox, LightboxConfig } from 'ngx-lightbox';
import { Router } from '@angular/router';
import { FormControl,  Validators } from '@angular/forms';
import { Observable, of,  Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Moment } from 'moment';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import dayjs from 'dayjs/esm';
import { FireandsmokeService } from './fireandsmoke.service';

export interface violation {
  si_no?: string
}

var data: any[] = [];

@Component({
  selector: 'app-fire-and-smoke-violation',
  templateUrl: './fire-and-smoke-violation.component.html',
  styleUrls: ['./fire-and-smoke-violation.component.css']
})

export class FireAndSmokeViolationComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedCameraId: string | null = null
  selectedDepartment: string | null = null
  selectedItems: any
  selectedItems1: any
  isdatewise: boolean = false;
  page: number = 1
  API: any;
  data: any[] = []
  dropdownList: Observable<any[]> = of([])
  dropdownList1: Observable<any[]> = of([])
  isActive:string
  ranges: any = {
    'Today': [dayjs().hour(0).minute(0).second(0), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days').hour(0).minute(0).second(0), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days').hour(0).minute(0).second(0), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days').hour(0).minute(0).second(0), dayjs()],
    'This Month': [dayjs().startOf('month').hour(0).minute(0).second(0), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month').hour(0).minute(0).second(0), dayjs().subtract(1, 'month').endOf('month')]
  }
  fromDateControl: FormControl = new FormControl(new Date().getTime(), Validators.required)
  toDateControl: FormControl = new FormControl(new Date(), Validators.required)
  dropdownSettings!: IDropdownSettings
  violLength: number = 0
  latest: boolean = false
  isLatest: boolean = false
  imageData: any[] = []
  tempdata: any[] = [];
  total: Observable<number> = of(0)
  violData: Observable<any[]> = of([])
  isdate: boolean = false
  pageSize: number = 30
  selectedViolType: string | null = null
  fromDate: any = new Date()
  toDate: any = new Date()
   String:any=String
  // isalert: boolean = false
  excelLoad: boolean = false
  isExcel: boolean = false
  selectedViolation!: any
  // selectedMoments: { startDate: Moment, endDate: Moment } = {startDate: null,endDate: null}
  selectedMoments: { startDate: Moment, endDate: Moment } = null
  excelFromDate: FormControl = new FormControl(new Date(), Validators.required)
  excelToDate: FormControl = new FormControl(new Date(), Validators.required)
  ExcelRange: number
  Edata: any[] = []
  // excelLoader: boolean = false
  // alertmessage: string = ''
  // loc2: FormControl = new FormControl('', Validators.required)
  loading: boolean = false
  // images: any[] = []
  Images: any[] = []
  Subsciption!: Subscription
  violdata: any[] = [];
  alert: boolean = true 
  currentViol!: any
  audioOff: boolean = false
  // violationTypeList: Observable<any[]> = of([{ key: '0', label: 'All Violations', icon: 'pi', data: 'all_violations' }])
  interval: any
  loader2: boolean = false
  Excel: boolean = false
  delay: number
  // violationsList: any[] = []
  // objectKeys = Object.keys
  @ViewChild('dangerAlert') Violation: ElementRef<any>;
  @ViewChildren(DaterangepickerDirective) pickerDirective: any;
  editViol: any
  // relayDelay: number
  // hooterDelay: number
  loaderLatest: boolean = false
  // currentDate: Date;
  // currentTime: Date;
  isEditTable: boolean = true
  dataFetchStatus: string = 'init'
  dropdownSettings2: any

  constructor(
    private http: HttpClient,
    private webServer: FireandsmokeService,
    private datepipe: DatePipe,
    private toasterService: ToastrService,
    private _lightbox: Lightbox,
    private _lightBoxConfig: LightboxConfig,
    private snackbar: MatSnackBar,
    public modalService: NgbModal,
    public Router: Router,) 
  {
    this.API = webServer.IP
    this.delay = webServer.logInterval
    this.ExcelRange = 0
    this.webServer.CheckApplicationStatus().subscribe((response: any) => {
      if (response.success) {
        localStorage.setItem('appStatus', response.message[0].process_status)
        var process = response.message.find((el: any) => {
          return el.process_name == 'fire_smoke_app' ? el : ''
        })
        this.isActive = process.process_status
        console.log('fire analytics:',this.isActive)
      }
    })
    this.getCameraList()
    this.getDepartmentList()
  }


  openDatePicker(event: any) {
    var dateInput = document.getElementById('dateInput')
    dateInput.click()
  }

  onCameraIdSelect(event: any) {
    this.isdatewise ? this.page = 1 : ''
    this.selectedCameraId = this.selectedItems.data
    console.log(this.selectedItems)
    // console.log(event)
    this.Submit()
  }
  onDepartmentIdSelect(event: any) {
    this.isdatewise ? this.page = 1 : ''
    this.selectedDepartment = this.selectedItems1.data
    console.log(this.selectedItems1)
    // console.log(event)
    this.Submit()
  }

 


  getCameraList() {
    var cameralist: any[] = []
    var cameraIdList: any[] = []

    cameralist[0] = { key: '0', label: 'All Cameras', data: 'all_cameras' }
    this.webServer.GetCameraNames((this.selectedMoments !== null)?(this.selectedMoments.startDate.format("YYYY-MM-DD HH:mm:ss")):null,(this.selectedMoments !== null)?(this.selectedMoments.endDate.format("YYYY-MM-DD HH:mm:ss")):null).subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          cameraIdList.push({ cameraid: i, cameraname: el })
        });
        cameraIdList = cameraIdList.filter((el, i, a) => i === a.indexOf(el))
        cameraIdList.forEach((element: any, i: number) => {
        //   var obj;
        //   obj = { key: ((i + 1).toString()), label: element.cameraname, data: element.cameraname }
        //   cameralist.push(obj)
        cameralist.push({ key: ((i + 1).toString()), label: element.cameraname, data: element.cameraname })
         });
        
        this.dropdownList = of(cameralist)
      }
    })
  }


  getDepartmentList() {
    var departmentlist: any[] = []
    var departmentIdList: any[] = []

    departmentlist[0] = { key: '0', label: 'All Departments', data: 'all_departments' }
    this.webServer.GetDepartmentNames((this.selectedMoments !== null)?(this.selectedMoments.startDate.format("YYYY-MM-DD HH:mm:ss")):null,(this.selectedMoments !== null)?(this.selectedMoments.endDate.format("YYYY-MM-DD HH:mm:ss")):null).subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          departmentIdList.push({ departmentid: i, department: el })
        });
        departmentIdList = departmentIdList.filter((el, i, a) => i === a.indexOf(el))
        departmentIdList.forEach((element: any, i: number) => {
        //   var obj;
        //   obj = { key: ((i + 1).toString()), label: element.cameraname, data: element.cameraname }
        //   cameralist.push(obj)
        departmentlist.push({ key: ((i + 1).toString()), label: element.department, data: element.department })
         });
        
        this.dropdownList1 = of(departmentlist)
      }
    })
  }
  
  ngOnInit(): void {     
    // var table = document.getElementById('dataTable')
    // table?.classList.add('loading')
    var fromDate = this.webServer.dateTransform(new Date()) + ' ' + '00:00:00'
    var toDate = this.webServer.dateTransform(new Date()) + ' ' + '23:59:59'
    this.fromDateControl.setValue(fromDate)
    this.toDateControl.setValue(toDate)

    this.dropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.dropdownSettings2 = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      noDataAvailablePlaceholderText: 'No violation types detected',
      maxHeight: 197
    };

    //...........Reading previous violation data's length from local storage....
    this.violLength = Number(localStorage.getItem("updatedLen"))

    // table?.classList.add('loading')

    if (!this.latest || !this.isLatest) {
      this.webServer.GetFiresmokeLiveViolation().subscribe((FSDdata: any) => {
        if (FSDdata.success) {
          this.imageData = FSDdata.message
          // this.tempdata = FSDdata.message
          Number(localStorage.setItem("updatedLen", FSDdata.message.length?FSDdata.message.length : 0))
          this.tempdata = FSDdata.message
          this.total = of(this.tempdata.length)
          this.violData = of(FSDdata.message)
          this.sliceVD()
          // table?.classList.remove('loading')
        }
        else {
          this.dataFetchStatus='success'
          // table?.classList.remove('loading')
          this.notification(FSDdata.message)
        }
          ( _Error: any) => {
          // table?.classList.remove('loading')
          this.dataFetchStatus='Error'
          this.notification("Error While fetching the data")
        }
      })
    }
  }

  notification(message: string, action?: string) {
    this.snackbar.open(message, action ? action : '', ({
      duration: 4000, panelClass: ['error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',})
    )
  }

  sliceVD() {
    if (!this.isdate) {
     this.tempdata.forEach((element, index: number) => {
        this.tempdata[index].data = element.data.map((element: any, index: number) => ({ ...element, id: index + 1 }))
      });
      this.total = of((this.tempdata.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)).length)
      this.total = of(this.tempdata.length)
      this.violData = of((this.tempdata.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
    }

    if (this.isdate) { 
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.webServer.DatewiseViolations(this.fromDate, this.toDate, this.page, this.pageSize, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
        
        if (Response.success) {
          table?.classList.remove('loading')
          if (Response.message.length === 0) {
            this.dataFetchStatus='success'
            this.notification("No violations found")
          }
         
          this.tempdata = Response.message
          this.tempdata.forEach((element, index: number) => {
          this.tempdata[index].data = element.data.map((element: any, index: number) => ({ ...element, id: index + 1 }))
          });
          this.violData = of(this.tempdata)
        }
      })
    }
  }

  trackByFn(index: number, item: any): number {
    return item.SNo; // Use a unique identifier for each item
  }

  async submitForm() {
    // this.isalert = false
    this.excelLoad = true
    this.isExcel = false
    // this.selectedViolType = this.selectedViolation ? <any>this.selectedViolation.data : null
    this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null
    this.selectedDepartment = this.selectedItems1 ? this.selectedItems1.data : null

    var body = {
      from_date: this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'),
      to_date: this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss'),
      cameraname: this.selectedItems ? this.selectedItems.data : 'none',
      department:this.selectedItems1 ? this.selectedItems1.data : 'none',
    }
    // console.log(body)

    let dataLength: number = await this.GetViolationLength(body.from_date, body.to_date, body.cameraname != 'none' ? body.cameraname : null)
        this.webServer.CreateViolationExcel(body).subscribe((Response: any) => {
          if (Response.success) {
            this.notification(Response.message)
            this.Edata = Response.message
            // this.Edata = Response.message
          
            this.webServer.DownloadViolationExcel().subscribe(
              (response: HttpResponse<any>) => {
                this.excelLoad = false
                this.isExcel = true
                var contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                const blob = new Blob([response.body], { type: '.xlsx' });
                var fileName = "violation report" + " " + this.datepipe.transform(new Date, 'YYYY_MM_dd_h_mm_ss') + '.xlsx'
                const file = new File([blob], fileName, { type: '.xlsx' });
                saveAs(blob, fileName);
                this.notification("You Excel is Downloaded successfully")
              },
              err => {
                // this.excelLoader = false
                this.excelLoad = false
                this.isExcel = true
                // this.excelLoader = false
                this.webServer.notification("Error while downloading excel sheet",'Retry')
              })
          }
          else {
            this.notification(Response.message, 'Retry')
            this.excelLoad = false
            this.isExcel = false
            // this.alertmessage = Response.message
            // this.isalert = true

          }
        },
          err => {
            this.excelLoad = false
            this.isExcel = false
            // this.alertmessage = "Error while creating excel"
            this.notification("Error while creating excel", 'Retry')
            // this.isalert = true
          })
      }

     
  

  //-------METHOD TO DOWNLOAD THE EXCEL--------
  GetViolationLength(fromDate: any, toDate: any, cameraName: any, violationType?: any) {
    var length
    this.webServer.DatewiseViolations(fromDate, toDate, null, null, cameraName ? cameraName : null, violationType ? violationType : null).subscribe((Response: any) => {
      if (Response.success) {

        length = Response.message.length
      }
    })
    return length;
  }

  Submit() {
    this.dataFetchStatus='Loading'
    this.isLatest = false
    // this.selectedViolType = this.selectedViolation ? <any>this.selectedViolation.data : null
    this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null
    this.selectedDepartment = this.selectedItems1 ? this.selectedItems1.data : null
    this.Images = []
    this.fromDate = this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss')
    this.toDate = this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss')
    this.getCameraList();
    this.getDepartmentList();
    this.Subsciption ? this.Subsciption.unsubscribe() : ''
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')

    this.pageSize = 30
    this.page = 1
    this.isdate = true
    this.loading = true

    this.webServer.DatewiseViolations(this.fromDate, this.toDate, null, null, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
      if (Response.success) {
        // this.loading = false      
        if (Response.message.length == 0) {
          // this.loading = false      
          this.tempdata = []
          this.violData = of([])          
          this.isdatewise = true
          this.total = of(0)          
           this.loading = false
          table?.classList.remove('loading')
          this.notification("No violations found for entered date and time")
        }
        if (Response.message.length > 0) {
          this.loading = false
          this.imageData = Response.message
          this.total = of(Response.message.length)
          this.webServer.DatewiseViolations(this.fromDate, this.toDate, this.page, this.pageSize, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
            if (Response.success) {
              this.loading = false
            //  this. GetViolationData()
              table?.classList.remove('loading')
              if (Response.message.length === 0) {
                this.loading = false
                this.dataFetchStatus='success'
                this.notification("No violations found")
                this.violData = of([])
                this.isdatewise = true
              }

              else {
                data = Response.message
                this.tempdata = Response.message
                this.isdatewise = true
                this.violData = of(this.tempdata)
                this.sliceVD()
                this.loading = false
              }
            }
            // this.loading = false
          },
            err => {
              this.loading = false
              this.dataFetchStatus = 'Error'
              this.notification("Error while fetching the data")
            })
        }
      }
      else {
        this.tempdata = []
        this.violData = of([])
        // this.loading = false
        this.isdatewise = true
        this.total = of(0)
        this.loading = false
        table?.classList.remove('loading')
        this.dataFetchStatus = 'success'
        this.notification("No violations found")
      }
    }, err => {
      this.loading = false
    })
  }
  
  alertSound() {
    let audio = new Audio()
    audio.src = '../../../assets/audio/alert.mp3'
    audio.load()
    audio.play()
  }

  //MODAL FOR VIOLATION
  showViol() {
    this.toasterService.error(<any>this.Violation.nativeElement.innerHTML, " ", {
      enableHtml: true,
      positionClass: 'toast-top-right'
    })
  }

  // onViolationTypeSelect(event: any) {
  //   console.log(this.selectedViolation)
  //   console.log(event)
  //   console.log(event.item_id)
  //   !this.isdatewise ? this.page = 1 : ''
  //   this.selectedViolType = this.selectedViolation.data
  //   console.log(this.selectedViolType)
  //   console.log(event)
  // }

  ngAfterViewInit() {  
    this.dataread() 
  //   var table = document.getElementById('dataTable')
  //   table?.classList.add('loading')
  //   // this.dataFetchStatus='init'
  //   if (!this.latest || !this.isLatest) {     
  //     this.webServer.GetFiresmokeLiveViolation().subscribe((FSDdata: any) => {
  //       if (FSDdata.success) {   
  //         // this.dataFetchStatus='loading'
  //         table?.classList.remove('loading')
  //         this.imageData = FSDdata.message
  //         this.tempdata = FSDdata.message
  //         Number(localStorage.setItem("updatedLen",FSDdata.message.length ? FSDdata.message.length : 0))  
  //         this.tempdata = FSDdata.message
  //         this.total = of(this.tempdata.length)
  //         this.violData = of(FSDdata.message)
  //         this.sliceVD()
  //       }
  //       else {
  //         this.dataFetchStatus='Error'
  //         table?.classList.remove('loading')
  //         this.notification(FSDdata.message)
  //       }
  //   })
  // }
}

ngOnDestroy() {
  this.modalService.dismissAll()
  clearInterval(this.interval)
  // this.isalert = false
  this.toasterService.clear()
}

  public dataread() {
    this.interval = setInterval(() => {
      if (!this.isdate) {
        if (Number(localStorage.getItem("updatedLen"))) {
          this.violLength = Number(localStorage.getItem("updatedLen"))
        }
        this.Subsciption = this.webServer.GetFiresmokeLiveViolation().subscribe((FSDdata: any) => {
          // this.dataFetchStatus = 'success'
          if (FSDdata.success) {
            this.dataFetchStatus = 'success'
            var response = { ...FSDdata }
            var cviol = [...FSDdata.message]
            localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
            var updatedLen = Number(localStorage.getItem("updatedLen"))
            if ((response.now_live_count - response.previous_live_count) > 0) {
              var diff = response.now_live_count - response.previous_live_count;
              // if (this.alert) {
              //   for (let i = diff - 1; i >= 0; i--) {
              //     if (this.alert) {
              //       setTimeout(() => {
              //         this.currentViol = cviol[i]
              //         this.showViol()
              //       }, 300);
              //       !this.audioOff ? this.alertSound() : ''
              //     }
              //   }
              // }
              this.tempdata = FSDdata.message
              this.total = of(this.tempdata.length)
              this.violData = of(FSDdata.message)
              this.sliceVD()
            }
            else{
              this.dataFetchStatus = 'success'
              this.notification(FSDdata.message)
            }
          }
          
        else {
          this.webServer.GetFiresmokeLiveViolation().subscribe((Response: any) => {
            if (!this.latest) {
              if (Response.success === true) {
                // console.log(Response)
                // console.log(this.selectedCameraId)
                // console.log(Response.message)
                this.imageData = Response.message
                this.tempdata = Response.message
                // console.log(this.tempdata)
                this.total = of(this.violdata.length)
                this.loader2 = false
                this.isdatewise = false
                this.violData = of(Response.message)
                data = Response.message
                this.sliceVD()
                var data = Response.message
                this.violdata = Response.message
                if (this.tempdata.length > 0) {
                  this.Excel = true
                }
                else {
                  false
                }
                this.sliceVD()
              }
              else {
                this.tempdata = []
                this.violData = of([])
                this.dataFetchStatus = 'success'
                this.total = of(0)
                this.loader2 = false
              }
            }
          }, (err: any) => {
            console.log(err)
            this.dataFetchStatus = 'Error'
          })
        }
      }, Err => {
        this.dataFetchStatus = 'Error'
      }
      )
      }
    },
     this.delay
     )
  }


  //----------METHOD TO TOGGLE THE NOTIFICATION --------
  alertToggle() {
    this.alert = !this.alert
    localStorage.setItem('alert', this.alert ? 'true' : 'false')
    if (!this.alert) {
      this.audioOff = true
      localStorage.setItem('alert', 'false')

      localStorage.setItem('audioOff', 'true')
      this.toasterService.clear()
    }
  }


  //----------METHOD TO TOGGLE THE VOLUME-------
  volumeToggle() {
    if (!this.alert) {
      this.audioOff = true
      localStorage.setItem('audioOff', 'true')
    }
    else {
      this.audioOff = !this.audioOff
      localStorage.setItem('audioOff', this.audioOff ? 'true' : 'false')
    }
  }



  //-----------------METHOD TO GO BACK TO LIVE-------------------------

  BackToToday() {
    this.page = 1
    this.Images = []
    this.latest = false
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
    this.isdate = false
    this.tempdata = []
    this.total = of(0)
    this.Images = []
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
    this.isdate = false
    this.tempdata = []
    this.total = of(0)
    this.webServer.LiveViolationData().subscribe((FSDdata: any) => {
      if (FSDdata) {
        this.isLatest = false
        table?.classList.remove('loading')
        this.imageData = FSDdata.message
        this.total = of(FSDdata.message.length)
        if (!FSDdata.success) {
          this.notification(FSDdata.message)
          this.total = of(0)
        }
        var cviol = FSDdata.message
        FSDdata.success ? this.tempdata = FSDdata.message : this.tempdata = []
        this.sliceVD()
        this.loader2 = true
        this.isdatewise = false
        localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
        var updatedLen = Number(localStorage.getItem("updatedLen"))
      }
    })
    this.dataread()
  }

  //function to get the latest data
  getLatestData() {
    this.loader2 = false
    this.loaderLatest = true
    this.latest = true
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    console.log(this.selectedViolType)
    this.webServer.LatestData(this.selectedViolType, this.selectedCameraId).subscribe((FSDdata: any) => {
      if (FSDdata.success) {
        this.isLatest = true
        table?.classList.remove('loading')
        this.loaderLatest = false
        data = FSDdata.message
        FSDdata.message.length === 0 ? this.notification("No violations found") : ''
        this.imageData = FSDdata.message
        this.tempdata = FSDdata.message
        console.log(this.tempdata)
        this.tempdata = FSDdata.message
        this.total = of(FSDdata.message.length)
        this.violData = of(FSDdata.message)
        this.sliceVD()
      }
      else {
        this.loaderLatest = false
        this.total = of(0)
        table?.classList.remove('loading')
        this.notification("Error while fetching the data", 'Retry')
      }
    },
      err => {
        this.loaderLatest = false
        table?.classList.remove('loading')

        this.notification("Error While fetching the data", 'Retry')
      })
  }


  //----------------METHOD TO DOWNLOAD THE  IMAGE AND VIDEO-------------

  downloadVideo(video: any) {
    const videoUrl = video;
    const requestOptions = {
      headers: new HttpHeaders({
        responseType: 'blob',
      }),
      withCredentials: true
    };
    const videoName = videoUrl.substr(videoUrl.lastIndexOf('/') + 1);

    this.http.get(videoUrl, { responseType: 'blob' }).subscribe((d: any) => {
      saveAs(d, videoName);
    },
      (err: any) => {
      }
    )

  }

  ResetFilters() {
    this.selectedMoments = null
    this.selectedItems = null
    this.selectedItems1 = null
    // this.selectedCameraId = null
    // this.selectedMoments = null
   
    this.isdatewise = false
    this.dataFetchStatus = 'Loading'
    this.dataread()
  }

  IsDeleteData(modal: any, violationData: any) {
    this.selectedViolation = violationData
    this.modalService.open(modal)
  }

  VerifyFalseViol(event: any, viol: any,Sno?:number) {
    this.editViol = viol
    console.log(Sno)
    this.webServer.VerifyViolation(this.editViol._id.$oid, false).subscribe((response: any) => {
      this.webServer.notification(response.message)
      if (response.success) {
        this.modalService.dismissAll()
        if (this.isdatewise)
          this.sliceVD()
      }
      if (!this.isdatewise) {
        this.GetViolationData()
      }
    }, (Err: any) => {
      this.webServer.notification("Error while the  Process", 'Retry')
    })
  }

  GetViolationData() {
    var table = document.getElementById('content')
    table?.classList.add('loading')
    if (!this.latest || this.isLatest) {
      this.webServer.GetFiresmokeLiveViolation().subscribe((FSDdata: any) => {
        if (FSDdata.success) {
          table?.classList.remove('loading')
          var data = FSDdata.message
          this.imageData = FSDdata.message
          this.tempdata = FSDdata.message
          Number(localStorage.setItem("updatedLen", FSDdata.message.length ? FSDdata.message.length : 0))
          this.tempdata = FSDdata.message
          this.total = of(this.tempdata.length)
          this.violData = of(FSDdata.message)
          this.sliceVD()
        }
        else {
          table?.classList.remove('loading')
          this.notification(FSDdata.message)
        }
      },
        err => {
          table?.classList.remove('loading')

          this.notification("Error While fetching the data")
        })
    }
  }


  VerifyTrueViol(event: any, viol: any,Sno?:any) {
    this.editViol = viol
    console.log(Sno)
    this.webServer.VerifyViolation(this.editViol._id.$oid, true).subscribe((response: any) => {
      this.webServer.notification(response.message)
      if (response.success) {
        this.modalService.dismissAll()
        if (this.isdatewise)
        this.sliceVD()
      }
      if (!this.isdatewise) {
        this.GetViolationData()
      }
    }, (Err: any) => {
      this.webServer.notification("Error while the  Process", 'Retry')
    })
  }

  DeleteViolationData() {
    this.webServer.DeleteViolationData(this.selectedViolation._id.$oid).subscribe((response: any) => {
      if (response.success) {
        this.modalService.dismissAll()
        this.webServer.notification(response.message)
        this.RefreshViolationData()
      } else {
        this.modalService.dismissAll()
        this.webServer.notification(response.message, 'Retry')
      }
    },
      Err => {
        this.webServer.notification('Error while the process', 'Retry')
      })
  }



  RefreshViolationData() {
    if (!this.isdatewise && !this.isLatest) {
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.webServer.GetFiresmokeLiveViolation().subscribe((Response: any) => {
        if (!this.latest) {
          table.classList.remove('loading')
          if (Response.success === true) {
            this.imageData = Response.message
            this.tempdata = Response.message
            this.total = of(this.violdata.length)
            this.violData = of(Response.message)
            data = Response.message
            this.sliceVD()
            var data = Response.message
            this.violdata = Response.message
            if (this.tempdata.length > 0) {
              this.Excel = true
            }
            else {
            }
            this.sliceVD()
          }
          else {
          }
        }
      }, (err: any) => {
        table.classList.remove('loading')
        console.log(err)
      })
    }

    else if (this.isdatewise && !this.isLatest) {
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.pageSize = 30
      this.page = 1
      this.webServer.DatewiseViolations(this.fromDate, this.toDate, null, null, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
        this.dataFetchStatus = 'success'
        if (Response.success) {
          if (Response.message.length == 0) {
            this.tempdata = []
            this.violData = of([])
            this.total = of(0)
            table?.classList.remove('loading')
            this.notification("No violations found for entered date and time")
          }
          if (Response.message.length > 0) {
            this.imageData = Response.message
            this.total = of(Response.message.length)
            this.webServer.DatewiseViolations(this.fromDate, this.toDate, this.page, this.pageSize, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
              if (Response.success) {
                table?.classList.remove('loading')
                if (Response.message.length === 0) {
                  this.dataFetchStatus = 'success'
                  this.notification("No violations found")
                  this.violData = of([])
                }
                else {
                  table?.classList.remove('loading')
                  this.tempdata = Response.message
                  this.violData = of(this.tempdata)
                  this.sliceVD()
                }
              }
              else{
                table?.classList.remove('loading')
              }
            },
              err => {
                this.dataFetchStatus = 'Error'
                this.notification("Error while fetching the data")
              })
          }
        }
        else {
          this.tempdata = []
          this.violData = of([])
          this.total = of(0)
          table?.classList.remove('loading')
          this.dataFetchStatus = 'success'
          this.notification("No violations found")
        }
      }, 
      err => {
      })
    }

    else if (this.isLatest || this.latest) {
      this.getLatestData()
      table?.classList.remove('loading')
    }
  }




  imageCarousal(viol: any) {
    this.Images = [];
    if(Array.isArray(viol)) {
      viol.forEach ((imgname: string, index: number) => {
      this.Images[index] = {
        src: this.API + '/GETFIRESMOKEIMAGE/' + imgname,
        thumb: this.API + '/GETFIRESMOKEIMAGE/' + imgname,
        caption: imgname,
      };
    });
    }
    else if (typeof viol === 'string') {
      this.Images[0] = {
        src: this.API + '/GETFIRESMOKEIMAGE/' + viol,
        thumb: this.API + '/GETFIRESMOKEIMAGE/' + viol,
        caption: viol,
      };
    } 
    else{
      console.error('Invalid format for viol.riro_image.After');
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

}