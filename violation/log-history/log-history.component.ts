import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Query, ViewChild, ViewChildren } from '@angular/core';
import { ServerService } from 'src/app/Services/server.service';
import { Lightbox, LightboxConfig } from 'ngx-lightbox'
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr'
import { ModalDismissReasons, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Moment } from 'moment';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import dayjs from 'dayjs/esm';

export interface violation {
  si_no?: string
}

var data: any[] = []
@Component({
  selector: 'app-log-history',
  templateUrl: './log-history.component.html',
  styleUrls: ['./log-history.component.css']
})
export class LogHistoryComponent implements OnDestroy ,OnInit,AfterViewInit{
   aiSolutionsList:any={CRDCNT:'Crowd Count',RA:'Danger Zone',PPE:'PPE'}
  data: any[] = []
  activeIndex:number=0
  isalert: boolean = false

  tempdata: any[] = [];
  page: number = 1
  pageSize: number = 30
  collectionSize: number
  cameraDetails: any[] = []
  audioOff: boolean = false
  alertmessage: string = ''
  total: Observable<number> = of(0)
  violData: Observable<any[]> = of([])
  loading: boolean = false
  
  images: any[] = []
  ExcelData: any
  excelLoader: boolean = false
  violLength: number = 0
  updatedLen: number = 0
  violdata: any[] = [];
  currentViol: any=null
  show1: number = 30
  show2: number = 40
  show3: number = 50
  fromDate: any = new Date()
  toDate: any = new Date()
  isdatewise: boolean = false
  API: any
  interval: any
  loader2: boolean = false
  interval2: any
  Excel: boolean = false
  date !: NgbDate
  isExcel: boolean = false
  excelLoad: boolean = false
  alert: boolean = true
  imageData: any[] = []
  ExcelRange: number
  delay: number
  objectKeys = Object.keys
  isdate: boolean = false
 
 
  selectedViolType: string | null = null
  Subsciption!: Subscription
  selectedCameraId: string | null = null
  dropdownList: Observable<any[]> = of([])
 
  excelFromDate: FormControl = new FormControl(new Date(), Validators.required)
  excelToDate: FormControl = new FormControl(new Date(), Validators.required)
  Images: any[] = []
  loc2: FormControl = new FormControl('', Validators.required)
  @ViewChild('dangerAlert') Violation: ElementRef<any>;
  dropdownSettings!: IDropdownSettings
  selectedItems!: any
  violationTypeList: Observable<any[]> = of([{ key: '0', label: 'All Violations', icon: 'pi', data: 'all_violations' }])
  dropdownSettings2: any
  selectedViolation!: any
  loaderLatest: boolean = false
  isLatest: boolean = false
  latest: boolean = false
  isActive:boolean=false
  isActive2:boolean=false
  violationsList: any[] = []
  ranges: any = {
    'Today': [dayjs().hour(0).minute(0).second(0), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days').hour(0).minute(0).second(0), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days').hour(0).minute(0).second(0), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days').hour(0).minute(0).second(0), dayjs()],
    'This Month': [dayjs().startOf('month').hour(0).minute(0).second(0), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month').hour(0).minute(0).second(0), dayjs().subtract(1, 'month').endOf('month')]
  }

  selectedMoments: { startDate: Moment, endDate: Moment }={ startDate: null, endDate: null }
  @ViewChildren(DaterangepickerDirective) pickerDirective: any;
  editViol: any


  constructor(
    private http: HttpClient,
    private webServer: ServerService,
    private datepipe: DatePipe,
    private toasterService: ToastrService,
    private _lightbox: Lightbox,
    private _lightBoxConfig: LightboxConfig,
    private router: Router,
    private snackbar: MatSnackBar,
    public modalService: NgbModal,
    public activatedRoute:ActivatedRoute,
    public Router:Router
  ) {  
    
    this.Router.navigate(['app/violations/DangerZone'])
    
    localStorage.getItem('audioOff') == 'true' ? this.audioOff = true : this.audioOff = false
    localStorage.getItem('alert') == 'true' ? this.alert = true : this.alert = false
    console.log(localStorage.getItem('audioOff'), localStorage.getItem('alert'))
    this.delay = this.webServer.logInterval

    this.getCameraList()
    this.getViolationTypes()
    this.ExcelRange = 0
    //.............lightbox configaration...........
    this._lightBoxConfig.showDownloadButton = false
    this._lightBoxConfig.showZoom = true
    this._lightBoxConfig.showImageNumberLabel = true
    this._lightBoxConfig.fitImageInViewPort = true
    this._lightBoxConfig.disableScrolling = false
    this._lightBoxConfig.centerVertically = false
    //..............................................

    this.API = webServer.IP

    this.webServer.CheckApplicationStatus().subscribe((response: any) => {
      console.log(response)
      if (response.success) {
        //this.isActive=true
        localStorage.setItem('appStatus', response.message[0].process_status)
        var process = response.message.find((el: any) => {

          return el.process_name == 'docketrun-app' ? el : ''
        })
        this.isActive = process.process_status

     
      }
    })

    this.GetMockdrillStatus()
    //..................for search..................

    this.excelFromDate.valueChanges.subscribe(data => {
      this.isalert = false
    })
    this.excelToDate.valueChanges.subscribe(data => {
      this.isalert = false
    })

    //..............................................

  }

  ngOnInit(): void {
  //...........Reading previous violation data's length from local storage....
    this.violLength = Number(localStorage.getItem("updatedLen"))

    this.webServer.GetCameraNames().subscribe((data: any) => {
      if (data.success === true) {

        data.message.forEach((el: any, i: number) => { this.cameraDetails[i] = { camera_id: el.camera_id, camera_name: el.camera_name } })

      }
      else {

      }
    })
    



  }




  ngAfterViewInit() {

    var table = document.getElementById('dataTable')
    table?.classList.add('loading')


    if (!this.latest || !this.isLatest) {
      this.webServer.LiveViolationData().subscribe((Rdata: any) => {
        if (Rdata.success) {

          table?.classList.remove('loading')

          var data = Rdata.message

          this.imageData = Rdata.message
          this.tempdata = Rdata.message
          Number(localStorage.setItem("updatedLen", Rdata.message.length ? Rdata.message.length : 0))
          this.tempdata = Rdata.message
          this.total = of(this.tempdata.length)
          this.violData = of(Rdata.message)
          this.sliceVD()
        }
        else {
          table?.classList.remove('loading')
          this.notification(Rdata.message)
        }
      },
        err => {
          table?.classList.remove('loading')

          this.notification("Error While fetching the data")
        })


    }
    this.dataread()


  }

  openDatePicker(event: any) {

    var dateInput = document.getElementById('dateInput')
    dateInput.click()

  }

  public dataread() {

    this.webServer.liveViolInterval = setInterval(() => {
      if (!this.isdate) {
        if (Number(localStorage.getItem("updatedLen"))) {
          this.violLength = Number(localStorage.getItem("updatedLen"))
        }
        this.Subsciption = this.webServer.LiveViolationData(this.selectedCameraId, this.selectedViolType).subscribe((Rdata: any) => {

          if (Rdata.success) {
            var response = { ...Rdata }
            var cviol = [...Rdata.message]
            localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
            var updatedLen = Number(localStorage.getItem("updatedLen"))
            var diff= response.now_live_count - response.previous_live_count 
            if (diff > 0) {
             
              diff>30?(diff=30):''

              if (this.alert) {
                for (let i = diff - 1; i >= 0; i--) {
                  var todayi = new Date()
                  var tempi = new Date(cviol[i].timestamp)

                  //hooter configaration

                  if (this.alert) {
                  

                    setTimeout(() => {
                      this.currentViol = cviol[i]

                   this.alert?   this.showViol():''

                    }, 300);
                    !this.audioOff ? this.alertSound() : ''
                  }
                 
                }
              }

            }
          }
        }
        )
        if (!this.latest) {
          this.webServer.LiveViolationData().subscribe((Response: any) => {
            if (!this.latest) {
              if (Response.success === true) {
                this.imageData = Response.message
                this.tempdata = Response.message
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

              }
            }
          }, (err: any) => {
          })
        }
      }
    }, this.delay)
  }


  showViol() {

    if(this.alert){
    this.toasterService.error(<any>this.Violation.nativeElement.innerHTML, " ", {
      enableHtml: true,
      positionClass: 'toast-top-right'
    })
  }
   

  }

  //function to show the  notification through snackbars
  notification(message: string, action?: string) {
    this.snackbar.open(message, action ? action : '', ({
      duration: 4000, panelClass: ['error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    })
    )
  }



  //function for searching 

  matches(term: string): Observable<any[]> {
    var resultVD = this.tempdata.filter((viol: any) => {
      return (<String>viol.cameraid).includes(term) || viol.roi_violation_name.includes(term) || viol.deviceid.includes(term) || viol.camera_name.includes(term)
    })

    this.tempdata = resultVD
    const length = resultVD.length;
    this.sliceVD()
    return of(resultVD);

  }

  //function  to manage  the pagination
  sliceVD() {
    if (!this.isdate) {
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
            this.notification("No violations found")
          }
          data = Response.message
          this.tempdata = data
          this.violData = of(this.tempdata)
         
        }
      })

    }

  }


  //----------METHOD TO FETCH DATE WISE DATA-----------------

 

  //-----------------METHOD TO GO BACK TO LIVE-------------------------

  BackToToday() {
    this.page = 1

    this.Images = []
    this.latest = false
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
    this.interval2 ? clearInterval(this.interval2) : ""
    this.isdate = false
    this.tempdata = []
    this.total = of(0)

    this.Images = []
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
    this.interval2 ? clearInterval(this.interval2) : ""
    this.isdate = false
    this.tempdata = []
    this.total = of(0)
    this.webServer.LiveViolationData().subscribe((Rdata: any) => {
      if (Rdata) {
        this.isLatest = false
        table?.classList.remove('loading')
        this.imageData = Rdata.message
        this.total = of(Rdata.message.length)
        if (!Rdata.success) {
          this.notification(Rdata.message)
        }
        var cviol = Rdata.message
        Rdata.success ? this.tempdata = Rdata.message : this.tempdata = []
        this.sliceVD()
        this.loader2 = true
        this.isdatewise = false
        localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
        var updatedLen = Number(localStorage.getItem("updatedLen"))
      }

    })

    this.dataread()

  }
  //----------FUNCTION TO TRANSFORM THE DATE----------------

  dateTransform(date: any) {

    const temp = new Date(date.year, date.month - 1, date.day)
    const FD = this.datepipe.transform(temp, 'dd/MM/yyyy')

    return FD
  }


  onCameraIdSelect(event: any) {
    !this.isdatewise ? this.page = 1 : ''
    this.selectedCameraId = this.selectedItems.data

  }


  onViolationTypeSelect(event: any) {
    !this.isdatewise ? this.page = 1 : ''
    this.selectedViolType = this.selectedViolation.data
     }


  imageCarousal(viol: any) {

    //  NgImageSliderServi
    this.Images = []
    viol.imagename.forEach((imgname: string, index: number) => {
      this.Images[index] = {
        src: this.API + '/image/' + imgname,
        thumb: this.API + '/image/' + imgname,
        caption: imgname,

      }
    })

    this.open(0)

  }
  open(index: number): void {
    this._lightbox.open(this.Images, index);
  }
  close(): void {
    this._lightbox.close();
  }

  //fucntion to create and download the excel as per the given dates and other inputs
  async submitForm() {
    this.isalert = false
    this.excelLoad = true
    this.isExcel = false
    this.selectedViolType = this.selectedViolation ? <any>this.selectedViolation.data : null
    this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null
  
    var body = {
      from_date: this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'),
      to_date: this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss'),
      cameraname: this.selectedCameraId ? this.selectedCameraId : 'none',
      violation_type: this.selectedViolType ? this.selectedViolType : 'none'
    }

    let dataLength:number=await this.GetViolationLength(body.from_date,body.to_date,body.cameraname!='none'?body.cameraname:null,body.violation_type!='none'?body.violation_type:null)
    if(dataLength>100){
      alert("huge Amount of Data found")
    }
    else{
    var date1 = new Date(this.excelFromDate.value)
    var date2 = new Date(this.excelToDate.value)
    var Difference_In_Time = date2.getTime() - date1.getTime();
    const diffInDs = (Difference_In_Time) / (1000 * 3600 * 24)

    if (diffInDs <= this.ExcelRange) {

      this.webServer.CreateViolationExcel(body).subscribe((Response: any) => {
        if (Response.success) {
          this.excelLoad = false
          this.isExcel = true

          this.webServer.DownloadViolationExcel().subscribe(
            (response: HttpResponse<any>) => {
              this.excelLoader = false
              this.excelLoad = false
              var contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
         
              const blob = new Blob([response.body], { type: '.xlsx' });
              // var fileName =  response.headers.get('Content-Disposition').split(';')[1];
              var fileName = "violation report" + " " + this.datepipe.transform(new Date, 'YYYY_MM_dd_h_mm_ss') + '.xlsx'
              const file = new File([blob], fileName, { type: '.xlsx' });
              saveAs(blob, fileName);
            },
            err => {
              this.excelLoader = false
            })
        }
        else {
          this.notification(Response.message, 'Retry')
          this.excelLoad = false
          this.isExcel = false
          this.alertmessage = Response.message
          this.isalert = true

        }
      },
        err => {
          this.excelLoad = false

          this.isExcel = false
          this.alertmessage = "Error while creating excel"
          this.notification(this.alertmessage, 'Retry')
          this.isalert = true
        })
    }

    else {
      this.excelLoad = false
      this.isalert = true
      this.excelLoader = false
      this.alertmessage = "Data range should be " + this.ExcelRange + " days"
      this.webServer.notification(this.alertmessage)
    }
    var formData: FormData = new FormData()

    formData.append('location', this.loc2.value)
  }
  }

  //-------METHOD TO DOWNLOAD THE EXCEL--------
   GetViolationLength(fromDate:any,toDate:any,cameraName:any,violationType:any) {
    this.excelLoader = true
    var length
    this.webServer.DatewiseViolations(fromDate, toDate, null, null, cameraName?cameraName:null,violationType?violationType:null).subscribe((Response: any) => {
      if (Response.success) {
         
       length= Response.message.length
      }
    })
    return length;
  }


  //-----NAVIGATE TO SETTINGS PAGE------
  settings() {
    this.router.navigate(['app/Settings'])
  }

  //-----METHOD FOR ALERT SOUND------------
  alertSound() {
    let audio = new Audio()
    audio.src = '../../../assets/audio/alert.mp3'
    audio.load()
    audio.play()
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


  //function to get the latest data
  getLatestData() {
    this.loader2 = false
    this.loaderLatest = true
    this.latest = true
    // this.interval2.subscribe()
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.webServer.LatestData(this.selectedViolType, this.selectedCameraId).subscribe((Rdata: any) => {
      if (Rdata.success) {
        this.isLatest = true
        table?.classList.remove('loading')
        this.loaderLatest = false
        data = Rdata.message
        Rdata.message.length === 0 ? this.notification("No violations found") : ''
        this.imageData = Rdata.message
        this.tempdata = Rdata.message
         this.tempdata = Rdata.message
  this.total = of(Rdata.message.length)
        this.violData = of(Rdata.message)
        this.sliceVD()


      }
      else {
        this.loaderLatest = false
        table?.classList.remove('loading')
        this.notification(Rdata.message, 'Retry')
      }
    },
      err => {
        this.loaderLatest = false
        table?.classList.remove('loading')

        this.notification("Error While fetching the data", 'Retry')
      })


  }

  //----------------METHOD TO DOWNLOAD THE  IMAGE-------------

  downloadImage(img: any) {
    const imgUrl = img;
    const requestOptions = {
      headers: new HttpHeaders({
        responseType: 'blob',
        // observe:'body'
      }),
      withCredentials: true
    };
    const imgName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
  

    this.http.get(imgUrl, { responseType: 'blob' }).subscribe(
      (d: any) => {
        saveAs(d, imgName);

      },
      (err: any) => {
        console.log("error", err)
      }
    )

  }

  //fucntion to get the list of all available cameras
  getCameraList() {
    var cameralist: any[] = []
    var cameraIdList: any[] = []

    cameralist[0] = { key: '0', label: 'All Cameras', data: 'all_cameras' }
    this.webServer.GetCameraDetails().subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          cameraIdList.push({ cameraid: i, cameraname: el })
        });
        cameraIdList = cameraIdList.filter((el, i, a) => i === a.indexOf(el))
        cameraIdList.forEach((element: any, i: number) => {
          // cameralist[i + 1] = { item_id: element.cameraid, item_text: element.cameraname }
          var obj;
          obj = { key: ((i + 1).toString()), label: element.cameraname, data: element.cameraname }
          cameralist.push(obj)
        });


        this.dropdownList = of(cameralist)
      }

    })

  }

  //function to fetch the available violation types
  getViolationTypes() {
    var violTypeList: any[] = []
    var temp: any[] = []
    this.violationsList[0] = { key: '0', label: 'All Violations', data: 'all_violations' }
    this.webServer.GetViolationList().subscribe((reponse: any) => {
      if (reponse.success) {
        reponse.message.forEach((element: any) => {
          temp.push(element)
        });

        temp.forEach((element: any, index: number) => {
          var obj;

          obj = { key: (index + 1).toString(), icon: 'pi', label: element, data: element }

          this.violationsList.push(obj)
        })
        this.violationTypeList = of(this.violationsList)
      }
    })

  }




  SelectViol(data: any, modal: any) {
    this.editViol = data
    this.modalService.open(modal, { size: 'xl', centered: true })
  }

  
  

  //function to get the live  violation data
  GetViolationData() {
    var table = document.getElementById('content')
    table?.classList.add('loading')

    if (!this.latest || this.isLatest) {
      this.webServer.LiveViolationData().subscribe((Rdata: any) => {
        if (Rdata.success) {
          table?.classList.remove('loading')
          var data = Rdata.message
          this.imageData = Rdata.message
          this.tempdata = Rdata.message
          Number(localStorage.setItem("updatedLen", Rdata.message.length ? Rdata.message.length : 0))
          this.tempdata = Rdata.message
  this.total = of(this.tempdata.length)
          this.violData = of(Rdata.message)
          this.sliceVD()
        }
        else {
          table?.classList.remove('loading')
          this.notification(Rdata.message)
        }
      },
        err => {
          table?.classList.remove('loading')
          this.notification("Error While fetching the data")
        })

    }
  }


  OnTabChange(event:any){
   switch(event.index){
    case 0:{
      this.activeIndex=0
      this.router.navigate(['app','violations','DangerZone'])
      break;
    }

    case 1:{
      this.activeIndex=1

      this.router.navigate(['app','violations','ppe'])

      break;
    }

    case  2:{
      this.activeIndex=2
     this.router.navigate(['app','violations','CrowdCount'])
      break;
    }
    case  3:{
      this.activeIndex=3
     this.router.navigate(['app','violations','FireDetection'])
      break;
    }
    case 4:{
      this.activeIndex=4
      this.router.navigate(['app','violations','SpillageDetection'])
      break;
    }
    case 5:{
      this.activeIndex=5
      this.router.navigate(['app','violations','Steam-SuitDetection'])
    }
   }
  }

  
  GetCurrentViolInfo(id:any){
  }

  GetMockdrillStatus(){
    this.webServer.GetMockDrillStatus().subscribe((response:any)=>{
      this.isActive2=response.success
    })
  }

  ngOnDestroy() {
    this.modalService.dismissAll()
    clearInterval(this.webServer.liveViolInterval)
    clearInterval(this.interval2)
    this.isalert = false
    this.toasterService.clear()

  }


}











