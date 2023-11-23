import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCarouselConfig, NgbModal, NgbOffcanvas, NgbOffcanvasConfig } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Lightbox, LightboxConfig } from 'ngx-lightbox';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { ServerService } from 'src/app/Services/server.service';

@Component({
  selector: 'app-esi-unallocated',
  templateUrl: './esi-unallocated.component.html',
  styleUrls: ['./esi-unallocated.component.css']
})
export class EsiUnallocatedComponent {
  selectedColumn: any[] = []
  isDesc:boolean=false
  roHeaderCount:number=6
  riHeaderCount:number=6
  jobsheetData: Observable<any[]> = of([])

  editField: string
  selectedRiro: any
  selectedEditIndex: any
  tempField: FormControl = new FormControl('', Validators.required)
  isHistory:Boolean=false
  queryParams:any
  IP: any
  intervalTime: number
  intervalforData:any
  jobsStatus: any = { not_processed: 0, processed_count: 0, total_jobs: 0 }
  dataJobsheets: Observable<any[]> = of([])
  jobTypeList: Observable<any[]> = of([])
  remarkControl: FormControl = new FormControl('', Validators.required)
  isActive: boolean = false
  isActive2: boolean = false
  cameraBrandList: Observable<any[]> = of([{ id: 1, text: 'cp_plus' }])
  ips: Observable<any[]>
  dropdownSettings: IDropdownSettings
  dropdownSettings2: IDropdownSettings
  flasherImages: any[] = []
  selectedViolation: any
  selectedField: string = ''
  selectedJobType: any
  selectedJob: any
  flasherLogDetails: any[] = []
  conveyorImage: Observable<string> = of('')
  Images: any[] = []
  tempData: any[] = []
  Array=Array
  deleteJob: any
  total: Observable<number> = of(0)
  page: number = 1
  pageSize: number = 10
  selectedPanel: any
  selectedPanels: any[] = []
  ipSelected: any=''
  selectedDep: any
  panelSelected: any
  jobTypeSelected: any
  isFilter: boolean = false
  violCountTemp: number = 0
  violationCount: Observable<any> = of(0)
  table: HTMLElement
  httprequests: any[] = []
  startAppConfig: FormControl = new FormControl('', Validators.required)
  panelNumbers: Observable<any[]>
  isLive: boolean = true


  constructor(
    public server: ServerService,
    public http:HttpClient,
    public router: Router,
    public currentRoute:ActivatedRoute,
    public offService: NgbOffcanvas,
    public offcanvasConfig: NgbOffcanvasConfig,
    public modalService: NgbModal,
    public _lightbox: Lightbox,
    public _lightBoxConfig: LightboxConfig,
    public alertService: MessageService,
    public ngbCarousal: NgbCarouselConfig
  ) {
                  this.currentRoute.queryParams.subscribe((data:any)=>{
                    this.isHistory=data.isHistory
                    this.queryParams=data

                  })

    offcanvasConfig.scroll = true
    this.offcanvasConfig.position = 'end'
    this.ngbCarousal.wrap = false
    this.ngbCarousal.interval = 10000;
    this.ngbCarousal.wrap = false;
    this.ngbCarousal.keyboard = false;
    this.ngbCarousal.pauseOnHover = false;
    this._lightBoxConfig.showDownloadButton = true

    this.IP = this.server.IP
    this.intervalTime = this.server.jobsheetInterval
    this.intervalforData=this.server.jobsheetDataInterval
    this.GetJobsheetStatus()
    this.GetPreviousJobsheets()
    this.GetjobTypeList()
    this.remarkControl.valueChanges.subscribe((Data: any) => {

    })
    this.server.CheckApplicationStatus().subscribe((response: any) => {

      if (response.success) {
        var process = response.message.find((el: any) => {

          return el.process_name == 'esi-monitor' ? el : ''
        })

        this.isActive = process.process_status
        if (response.success) {
          var process = response.message.find((el: any) => {

            return el.process_name == 'hydra-app' ? el : ''
          })

          this.isActive2 = process.process_status
        }
        // this.isActive=true

      }
    })

    this.GetCameraBrands()

    this.GetIPList()
    this.dropdownSettings = {
      singleSelection: false,
      enableCheckAll: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      noDataAvailablePlaceholderText: 'No data',
      maxHeight: 197
    };

    this.dropdownSettings2 = {
      singleSelection: true,
      idField: "id",
      textField: "text",
      disabledField: "isDisabled",

      closeDropDownOnSelection: true,

      clearSearchFilter: true,
      // maxHeight: 197,
      // itemsShowLimit: 999999999999,
      searchPlaceholderText: "Search",
      noDataAvailablePlaceholderText: "No data available",
      noFilteredDataAvailablePlaceholderText: "No filtered data available",
      showSelectedItemsAtTop: false,
      defaultOpen: false,
      allowRemoteDataSearch: false,
    }
    //this.getJobsheetData()

  }


  ngOnInit(): void {
    this.startAppConfig.setValue(0)

    var table = document.getElementById('dataTable')
    table.classList.add('loading')
    this.GetPanelList()
   this.isHistory?this.OnJobsheetSelect(this.queryParams.jobsheetId) :this.server.GetJobSheet().subscribe((response: any) => {
      table.classList.remove('loading')

      if (response.job_sheet_status) {
        if (response.success) {

          if (!this.isFilter) {
            this.total = of(response.message.length)
            this.CheckViolation(response.message)
            //  this.table!=null? this.table.classList.remove('loading'):''
            this.tempData = response.message
            this.tempData = this.ModifyData(this.tempData)
            this.tempData = this.SortLivewise(this.tempData)
            this.sliceData()
          }
        }
        else {
          this.table != null ? this.table.classList.remove('loading') : ''
          this.server.notification(response.message, 'Retry')
          this.total = of(0)
          //this.jobsheetData = of(response.message)
          this.tempData = []
          this.sliceData()
        }
      }
      else {
        this.router.navigate(['app/jobsheetUpload'])
      }
    },
      err => {
        this.server.notification('Error while fetching the data', 'Retry')
        table.classList.remove('loading')
      })
  }


  GetPanelList() {
    // this.server.GetPanelsByArea()
    var panels: any[] = []
    var panelList: any[] = [{ key: '0', label: 'All Panels', data: '' }]
    this.server.GetJobPanelList(this.selectedDep ? this.selectedDep : '', this.ipSelected ? this.ipSelected : '').subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          panels.push({ d: i, data: el })
        });
        panels = panels.filter((el, i, a) => i === a.indexOf(el))
        panels.forEach((element: any, i: number) => {
          // cameralist[i + 1] = { item_id: element.cameraid, item_text: element.cameraname }
          var obj;
          obj = { key: ((i + 1).toString()), label: element.data, data: element.data }

          panelList.push(obj)
        });

        console.log(panelList)
        this.panelNumbers = of(panelList)
      }

    })
  }

  OnJobsheetSelect(jobsheetId:any) {
    this.isLive = false
    // console.log(event)
    var table = document.getElementById('dataTable')
    table.classList.add('loading')
    this.server.getPrevJobsheetData(jobsheetId).subscribe((response: any) => {
      // console.log(response)

      if (response.success) {
        this.total = of(response.message.length)
        this.tempData = this.ModifyData(response.message)
        this.tempData = this.SortLivewise(response.message)
        table.classList.remove('loading')
        this.sliceData()


      }
      else {
        table.classList.remove('loading')

        this.total = of(0)
        this.server.notification(response.message)
        this.tempData = []
        this.sliceData()

      }
    },
      Err => {
        table.classList.remove('loading')

        this.server.notification('Error while fetching the data', 'Retry')
      })
    this.server.GetPrevJobsheetStatus(jobsheetId).subscribe((response: any) => {
      //  console.log({ response })
      if (response.success) {
        this.jobsStatus = response.message
      }
    })
  }


  selectEditField(modal: any, data: any, field: string) {
    this.editField = field
    this.selectedRiro = data
    this.selectedEditIndex = data.riro_key_id
    
    if (this.editField == 'five_meter') {
      data[this.editField]

      this.tempField.setValue(data[this.editField].violation ? data.this.editField.violation ? 'Yes' : 'No' : 'No')
    } else {
      this.tempField.setValue(data[this.editField])
    }

    this.modalService.open(modal, { backdrop: 'static',centered:true })

  }

  GetJobsheetStatus() {
    this.server.GetJobsheetStatus().subscribe((response: any) => {
      if (response.success) {
        this.jobsStatus = response.message
      }
    })
  }


  GetPreviousJobsheets() {
    var jobsheets: any[] = []
    this.server.GetPreviousJobsheetIds().subscribe((response: any) => {
      //  console.log('previous excels', response)
      if (response.success) {
        response.message.forEach((data: any, id: number) => {
          var object: any = {
            text: id == 0 ? "Current Jobsheet" : data.job_sh_name_ls,
            id: data.mongo_id_ls
          }
          jobsheets.push(object)
        });
        //   console.log(jobsheets)
        this.dataJobsheets = of(jobsheets)
      }
      else {
      }
    })
  }

  GetjobTypeList() {
    var jobs: any[] = []
    var jobList: any[] = [{ key: '0', label: 'All jobs', data: '' }]
    this.jobsheetData = of([])
    this.server.GetJobTypeList().subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          jobs.push({ d: i + 1, data: el })
        });
        jobs = jobs.filter((el, i, a) => i === a.indexOf(el))
        jobs.forEach((element: any, i: number) => {
          // cameralist[i + 1] = { item_id: element.cameraid, item_text: element.cameraname }
          var obj;
          obj = { key: ((i + 1).toString()), label: element.data, data: element.data }

          jobList.push(obj)
        });


        this.jobTypeList = of(jobList)
      }

    })
  }

  

  GetCameraBrands() {
    this.server.GetCameraBrandDetails().subscribe((response: any) => {
      var temp: any[] = []
      if (response.success) {
        response.message.forEach((element: any, id: number) => {
          temp.push({ text: element, id: id })

        });
      }

      this.cameraBrandList = of(temp)
    })
  }

  GetIPList() {
    var ips: any[] = []
    var ipsList: any[] = [{ key: '0', label: 'All IPs', data: '' }]
    this.jobsheetData = of([])
    this.server.GetJobCamerasIpList().subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          ips.push({ d: i + 1, data: el })
        });
        ips = ips.filter((el, i, a) => i === a.indexOf(el))
        ips.forEach((element: any, i: number) => {
          // cameralist[i + 1] = { item_id: element.cameraid, item_text: element.cameraname }
          var obj;
          obj = { key: ((i + 1).toString()), label: element.data, data: element.data }

          ipsList.push(obj)
        });


        this.ips = of(ipsList)
      }

    })
  }
  FlasherImage(data: any, modal: any, job: any) {
    this.selectedViolation = data
    this.selectedField = "Magnetic Sticker"
    this.flasherLogDetails = []
    this.selectedJob = job
    this.modalService.open(modal,{centered:true})
   }
  

   ShowLog(modal: any, data: any) {
    this.offService.open(modal, { panelClass: 'w-25' })
    var container = document.getElementById('logContainer')
    container.classList.add('loading')
    this.modalService.dismissAll()
    this.server.GetFlasherDetails(data.data.ip_address, data.data.panel_data.panel_id).subscribe((response: any) => {
      container.classList.remove('loading')
      if (response.success) {
        this.flasherLogDetails = response.message


      }
      else {
        this.server.notification(response.message)
        this.offService.dismiss()
      }
    },
      Err => {
        this.server.notification('Error while fetching the data', 'Retry')
      })
  }




  ConveyorImage(modal: any, data: any, field: any) {
    if (data.type.toLowerCase() === 'conveyor') {
      this.selectedRiro = data

      this.selectedField = field
      this.conveyorImage = of('')
      var obj = {
        id: data._id.$oid,
        rtsp_url: data.data.rtsp_url
      }

      this.modalService.open(modal, { size: 'xl',centered:true })
      this._lightBoxConfig.containerElementResolver = (doc: Document) => doc.getElementById('conveyorImg');

      var img = document.getElementById('jobImg')
      img.classList.add('loading')
      this.server.GetConveyorImg(obj).subscribe((response: any) => {
        if (response.success) {
          img.classList.remove('loading')

          this.conveyorImage = of(response.message.image_name)
        }
        else {
          img.classList.remove('loading')
          this.modalService.dismissAll()
          this.server.notification(response.message)
        }
      },
        Err => {
          this.server.notification('Something went wrong', 'Retry')
        })
    }
    else if (data.type.toLowerCase() === 'hydraulic' || data.type.toLowerCase() === 'pneumatic') {
      this.selectedRiro = data

      this.selectedField = field
      this.conveyorImage = of('')
      var obj = {
        id: data._id.$oid,
        rtsp_url: data.data.rtsp_url
      }

      this.modalService.open(modal, { size: 'xl',backdrop: 'static',centered:true })
      this._lightBoxConfig.containerElementResolver = (doc: Document) => doc.getElementById('conveyorImg');

      // var img = document.getElementById('jobImg')
      // img.classList.add('loading')
      field == 'Lock' ? this.conveyorImage = of(data.riro_data[0].hydra_data[0].lock_on_details.Image) : this.conveyorImage = of(data.riro_data[0].hydra_data[0].lock_off_details.Image)
    }

    else {

    }
  }

  ViolImages5meter(data: any) {
    this.Images = []
    data.five_meter.images.forEach((obj: any, index: number) => {
      this.Images[index] = {
        src: this.IP + '/fivemeter_image/' + obj.img_name,

        thumb: this.IP + '/fivemeter_image/' + obj.img_name,
        caption: obj.img_name,

      }
    })

    this.open(0)

  }
  open(index: number): void {
    this._lightbox.open(this.Images, index);
  }

  //modal to  addd the remark
  RemarkModal(modal: any, data: any, field: any) {
    this.editField = field
    this.selectedEditIndex = data.riro_key_id
     this.modalService.open(modal, { backdrop: 'static' ,centered:true})
  }


  EditRemark(modal: any, data: any, field: any) {
    this.editField = field
    this.selectedEditIndex = data.riro_key_id
    this.remarkControl.setValue(data.remarks)
 this.modalService.open(modal, { backdrop: 'static',centered:true })
  }
  SaveFieldChanges() {
    var editContainer = document.getElementById('editField')
    editContainer.classList.add('loading')
    if(this.editField!='tagname'){
    var index = this.tempData.findIndex((data: any) => {
      return data.riro_key_id == this.selectedEditIndex
    })
  }

}

getConveyorImg() {
  var img = document.getElementById('jobImg')
  img.classList.add('loading')
  var obj = {
    id: this.selectedRiro._id.$oid,
    rtsp_url: this.selectedRiro.data.rtsp_url
  }
  this.server.GetConveyorImg(obj).subscribe((response: any) => {
    if (response.success) {
      img.classList.remove('loading')

      this.conveyorImage = of(response.message.image_name)
    }
    else {
      img.classList.remove('loading')

      this.server.notification(response.message)
    }
  }, Err => {
    this.server.notification('Error while fetching the image')
  })

}


ToPPE(id: string, panel_id: string, imageName: string, area: string, plant: string, dep?: any) {
  var link = this.router.serializeUrl(this.router.createUrlTree(['app/panelViolation'], { queryParams: { id: id, panel: panel_id, imageName: imageName, area: area, plant: plant, department: dep } }))
  window.open(link, '_blank')

}

ToRackEdit(data: any) {
  var link = this.router.serializeUrl(this.router.createUrlTree(['/app/rackEdit'], { queryParams: { id: data._id.$oid, panel: data.data.panel_data.panel_id, area: data.sub_area, department: data.department, plant: data.plant, image_name: data.data.image_name } }))
  window.open(link, '_blank')
}

ToLockHistory(data: any) {
  var link = this.router.serializeUrl(this.router.createUrlTree(['/app/lockHistory'], { queryParams: { id: data._id.$oid, camera_name: data.data.camera_name, department: data.department, area: data.sub_area, plant: data.plant, image_name: data.data.image_name, type: data.type } }))
  window.open(link, '_blank')

}

ToEditPage(data: any) {
  if (data['type'] == 'HT') {
    var link = this.router.serializeUrl(this.router.createUrlTree(['app/PanelSettings/HTPanel'], { queryParams: { id: data._id.$oid, type: data['type'], image_name: data.data.image_name, isNewJob: false, area: data.sub_area,} }))
    window.open(link, '_blank')

  }



}

isDeleteJob(modal: any, d: any) {
  this.selectedEditIndex = d._id.$oid
  this.deleteJob = d
  this.modalService.open(modal, { backdrop: 'static',centered:true })

}


SaveRemark() {
  var index = this.tempData.findIndex((data: any) => {
    return data.riro_key_id == this.selectedEditIndex
  })
  var data1: any = {
    riro_key_id: this.selectedEditIndex,

  }
  data1[this.editField] = this.remarkControl.value
  this.server.EditRiroJob(data1).subscribe((response: any) => {

    if (response.success) {
      this.server.notification(response.message)
      this.getJobsheetData()
      this.GetJobsheetStatus()
      this.modalService.dismissAll()
    }
    else {
      this.server.notification(response.message, 'Retry')
    }
  },
    Err => {
      this.server.notification('Error while updating', 'Retry')
    })

}

getJobsheetData() {
  var table = document.getElementById('dataTable')
  table.classList.add('loading')
  this.server.GetJobSheet().subscribe((response: any) => {
    table.classList.remove('loading')
    if (response.job_sheet_status) {
      if (response.success) {

        this.total = of(response.message.length)
        this.jobsheetData = of(response.message)
        this.tempData = response.message
        this.tempData = this.ModifyData(this.tempData)
        this.tempData = this.SortLivewise(this.tempData)
        this.sliceData()
      }
      else {
        this.server.notification('Data not found')
      }
    }
    else {
      this.router.navigate(['app/jobsheetUpload'])
    }
  },
    err => {
      this.server.notification('Error while fetching the data', 'Retry')
      table.classList.remove('loading')
    })
}

ModifyData(data: any) {

  data.forEach((panel: any) => {

    let temp: any = {}
    let temp2: any = {}
    if(panel.riro_data.length>0){
    if (panel.riro_data.length == 1) {
      if (panel.riro_data[0].rack_process == 'rack_in') {
        temp = panel.riro_data[0]
        panel.riro_data[0] = null
        panel.riro_data[1] = temp;
      }
      else if (panel.riro_data[0].rack_process == 'not_recognised') {
        temp = panel.riro_data[0]
        panel.riro_data[0] = null
        panel.riro_data[1] = null
        panel.riro_data[2] = temp;
      }
      else {
        panel.riro_data[1] = null
        panel.riro_data[2] = null
      }
    }

    else {
      if (panel.riro_data[0].rack_process == 'rack_in' && panel.riro_data[1].rack_process == 'rack_out') {
        temp = panel.riro_data[0]
        panel.riro_data[0] = panel.riro_data[1]
        panel.riro_data[1] = temp;
        panel.riro_data[2] = null
      }
      else if (panel.riro_data[0].rack_process == 'rack_in' && panel.riro_data[1].rack_process == 'not_recognised') {
        temp = panel.riro_data[0]
        temp2 = panel.riro_data[1]
        panel.riro_data[0] = {}
        panel.riro_data[1] = temp
        panel.riro_data[2] = temp2
      }
      else if (panel.riro_data[1].rack_process == 'rack_in' && panel.riro_data[0].rack_process == 'not_recognised') {
        temp = panel.riro_data[0]
        temp2 = panel.riro_data[1]
        panel.riro_data[0] = null
        panel.riro_data[1] = temp2
        panel.riro_data[2] = temp
        
      }
      else if (panel.riro_data[0].rack_process == 'not_recognised' && panel.riro_data[1].rack_process == 'rack_out') {
        temp = panel.riro_data[0]
        temp2 = panel.riro_data[1]
        panel.riro_data[0] = temp2
        panel.riro_data[1] = null
        panel.riro_data[2] = temp
       
      }
      else if (panel.riro_data[1].rack_process == 'not_recognised' && panel.riro_data[0].rack_process == 'rack_out') {

        temp2 = panel.riro_data[1]

        panel.riro_data[1] = null
        panel.riro_data[2] = temp2
      }
      else {
        panel.riro_data[2] = null
      }
    }
    }
});

  return data;
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


  sliceData() {
    this.total = of(this.tempData.length)
    this.jobsheetData = of((this.tempData.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
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
          this.getJobsheetData()
          this.GetJobsheetStatus()
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
      else if(Array.isArray( this.deleteJob.data.panel_data)){
        if(this.deleteJob.data.panel_data.length==0){
          this.server.DeleteEntireJob(this.deleteJob._id.$oid).subscribe((response:any)=>{
            if(response.success){
                this.server.notification(response.message)
                this.RefreshData()
            }
            else{
              this.server.notification(response.message,'Retry')
            }
          })
        }

      }
    }
    else {


      this.server.DeleteMechJobs(this.deleteJob._id.$oid).subscribe((response: any) => {
        deleteModal.classList.remove('loading')

        if (response.success) {
          this.server.notification(response.message)
          this.modalService.dismissAll()
          this.getJobsheetData()
          this.GetJobsheetStatus()
          this.sliceData()
        }
        else {
          this.server.notification(response.message)
        }
      },
        Err => {
          deleteModal.classList.remove('loading')

          this.server.notification('Error while deleting Job', 'Retry')
        })
    }

  }

  RefreshData() {
    this.selectedPanel = ''
    this.selectedPanels = []
    this.total = of(0)
    this.jobsheetData = of([])

    this.ShowData()
    this.GetJobsheetStatus()

  }

  ShowData() {
    var request: any
    request = this.server.GetJobSheetDataByfilter(this.ipSelected ? this.ipSelected : '', this.selectedDep ? this.selectedDep : '', this.panelSelected ? this.panelSelected : '', this.jobTypeSelected ? this.jobTypeSelected : '').subscribe((response: any) => {
      //table.classList.remove('loader')
      if (!this.isFilter) {
        if (response.success) {

          if (!this.isFilter) {
            this.total = of(response.message.length)
            this.CheckViolation(response.message)
            //  this.table!=null? this.table.classList.remove('loading'):''
            this.tempData = response.message
            this.tempData = this.ModifyData(this.tempData)
            this.tempData = this.SortLivewise(this.tempData)
            this.sliceData()
          }
        }
        else {
          this.table != null ? this.table.classList.remove('loading') : ''

          this.total = of(0)
          //this.jobsheetData = of(response.message)
          this.tempData = []
          this.sliceData()
        }

      }
    },
      (Err: any) => {

      }
    )

    this.httprequests.length > 4 ? (this.httprequests.push(request)) : ''


  }
  CheckViolation(details: any[]) {
    this.violCountTemp = 0
    details.forEach((data: any, index: number) => {
      if (data.type == 'HT') {
        if (data.exception_status) {
          (this.violCountTemp = this.violCountTemp + 1)
        }
      }


    })

    this.violationCount = of(this.violCountTemp)
  }


}