import { DatePipe } from "@angular/common";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Query,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { ServerService } from "src/app/Services/server.service";
import { Lightbox, LightboxConfig } from "ngx-lightbox";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable, of, startWith, Subscription, switchMap } from "rxjs";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { ToastrService } from "ngx-toastr";
import {
  ModalDismissReasons,
  NgbDate,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Moment } from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import dayjs from "dayjs/esm";
import { DateFormaterPipe } from "src/app/common/date-formater.pipe";
@Component({
  selector: "app-ppeviolation",
  templateUrl: "./ppeviolation.component.html",
  styleUrls: ["./ppeviolation.component.css"],
})
export class PpeviolationComponent implements OnInit, OnDestroy, AfterViewInit {
  data: any[] = [];
  activeIndex: number = 0;
  isalert: boolean = false;
  imageUrl: string;
  prevLiveCount: number = 0;
  helmetFilterValue: FormControl<Number> = new FormControl<Number>(30, [
    Validators.pattern(new RegExp("^(?!-)[0-9]+$")),
    Validators.min(30),
  ]);
  vestFilterValue: FormControl<Number> = new FormControl<Number>(30, [
    Validators.pattern(new RegExp("^(?!-)[0-9]+$")),
    Validators.min(30),
  ]);
  tempdata: any[] = [];
  page: number = 1;
  pageSize: number = 30;
  collectionSize: number;
  cameraDetails: any[] = [];
  audioOff: boolean = false;
  alertmessage: string = "";
  total: Observable<number> = of(0);
  violData: Observable<any[]> = of([]);
  loading: boolean = false;
  filterOut: FormControl = new FormControl();
  excelLoader: boolean = false;
  violLength: number = 0;
  updatedLen: number = 0;
  violdata: any[] = [];
  currentViol!: any;
  show1: number = 30;
  show2: number = 40;
  show3: number = 50;
  dataFetchStatus: string = "init";
  fromDate: any = new Date();
  toDate: any = new Date();
  isdatewise: boolean = false;
  API: any;
  interval: any;
  loader2: boolean = false;
  Excel: boolean = false;
  date!: NgbDate;
  Edata: any[] = [];
  isExcel: boolean = false;
  excelLoad: boolean = false;
  alert: boolean = true;
  imageData: any[] = [];
  ExcelRange: number;
  time: any;
  delay: number;
  objectKeys = Object.keys;
  isdate: boolean = false;

  selectedViolType: string | null = null;
  Subsciption!: Subscription;
  selectedCameraId: string | null = null;
  dropdownList: Observable<any[]> = of([]);
  fromDateControl: FormControl = new FormControl(
    new Date().getTime(),
    Validators.required
  );
  toDateControl: FormControl = new FormControl(new Date(), Validators.required);
  excelFromDate: FormControl = new FormControl(new Date(), Validators.required);
  excelToDate: FormControl = new FormControl(new Date(), Validators.required);
  Images: any[] = [];
  loc2: FormControl = new FormControl("", Validators.required);
  @ViewChild("dangerAlert") Violation: ElementRef<any>;
  dropdownSettings!: IDropdownSettings;
  selectedItems!: any;
  violationTypeList: Observable<any[]> = of([
    { key: "0", label: "All Violations", icon: "pi", data: "all_violations" },
  ]);
  dropdownSettings2: any;
  selectedViolation!: any;
  loaderLatest: boolean = false;
  isLatest: boolean = false;
  latest: boolean = false;

  isEditTable: boolean = true;
  violationsList: any[] = [];
  ranges: any = {
    Today: [dayjs().hour(0).minute(0).second(0), dayjs()],
    Yesterday: [
      dayjs().subtract(1, "days").hour(0).minute(0).second(0),
      dayjs().subtract(1, "days"),
    ],
    "Last 7 Days": [
      dayjs().subtract(6, "days").hour(0).minute(0).second(0),
      dayjs(),
    ],
    "Last 30 Days": [
      dayjs().subtract(29, "days").hour(0).minute(0).second(0),
      dayjs(),
    ],
    "This Month": [
      dayjs().startOf("month").hour(0).minute(0).second(0),
      dayjs().endOf("month"),
    ],
    "Last Month": [
      dayjs().subtract(1, "month").startOf("month").hour(0).minute(0).second(0),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  };

  selectedMoments: { startDate: Moment; endDate: Moment };
  @ViewChildren(DaterangepickerDirective) pickerDirective: any;
  editViol: any;

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
    public Router: Router
  ) {
    console.log("ppe violations component");
    localStorage.getItem("audioOff") == "true"
      ? (this.audioOff = true)
      : (this.audioOff = false);
    localStorage.getItem("alert") == "true"
      ? (this.alert = true)
      : (this.alert = false);
    console.log(
      localStorage.getItem("audioOff"),
      localStorage.getItem("alert")
    );
    this.delay = this.webServer.logInterval;

    this.getCameraList();
    this.getViolationTypes();
    this.ExcelRange = 0;
    //.............lightbox configaration...........
    this._lightBoxConfig.showDownloadButton = false;
    this._lightBoxConfig.showZoom = true;
    this._lightBoxConfig.showImageNumberLabel = true;
    this._lightBoxConfig.fitImageInViewPort = true;
    this._lightBoxConfig.disableScrolling = false;
    this._lightBoxConfig.centerVertically = false;
    //..............................................

    this.API = webServer.IP;

    //..................for search..................
    this.filterOut.valueChanges
      .pipe((startWith(""), switchMap((text) => this.matches(text.strip()))))
      .subscribe((result) => {
        this.tempdata = result;
        //  console.log(result)
        this.violData = of(result);
        this.sliceVD();
      });
    this.excelFromDate.valueChanges.subscribe((data) => {
      this.isalert = false;
    });
    this.excelToDate.valueChanges.subscribe((data) => {
      this.isalert = false;
    });

    //..............................................
  }

  ngOnInit(): void {
    this.helmetFilterValue.valueChanges.subscribe((value: any) => {
      console.log(this.helmetFilterValue);
    });
    var fromDate = this.webServer.dateTransform(new Date()) + " " + "00:00:00";
    var toDate = this.webServer.dateTransform(new Date()) + " " + "23:59:59";
    this.fromDateControl.setValue(fromDate);
    this.toDateControl.setValue(toDate);

    this.dropdownSettings = {
      singleSelection: true,
      idField: "item_id",
      textField: "item_text",
      // selectAllText: 'Select All',
      // unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      // closeDropDownOnSelection: true,
      // noDataAvailablePlaceholderText: 'No cameras detected',
      // maxHeight: 197
    };

    this.dropdownSettings2 = {
      singleSelection: true,
      idField: "item_id",
      textField: "item_text",

      itemsShowLimit: 1,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      noDataAvailablePlaceholderText: "No violation types detected",
      maxHeight: 197,
    };

    //...........Reading previous violation data's length from local storage....
    this.violLength = Number(localStorage.getItem("updatedLen"));

    this.GetPPEFilterValues();

    //------------Reading the camera details--------------
    //uncomment while you work

    var table = document.getElementById("dataTable");
    table?.classList.add("loading");

    if (!this.latest || this.isLatest) {
      this.webServer.LivePPEViolationData().subscribe(
        (Rdata: any) => {
          if (Rdata.success) {
            table?.classList.remove("loading");

            var data = Rdata.message;
            this.prevLiveCount = Rdata.now_live_count;
            this.imageData = Rdata.message;
            this.tempdata = Rdata.message;
            Number(
              localStorage.setItem(
                "updatedLen",
                Rdata.message.length ? Rdata.message.length : 0
              )
            );
            this.tempdata = Rdata.message;
            this.total = of(this.tempdata.length);
            this.violData = of(Rdata.message);
            // console.log(this.violData)
            this.sliceVD();
          } else {
            table?.classList.remove("loading");
            this.notification(Rdata.message);
          }
        },
        (err) => {
          table?.classList.remove("loading");

          this.notification("Error While fetching the data");
        }
      );
    }
  }

  Reset() {
    this.selectedMoments = null;
    this.selectedItems = null;

    this.dataread();
  }

  ngAfterViewInit() {
    this.dataread();
  }

  openDatePicker(event: any) {
    var dateInput = document.getElementById("dateInput");
    dateInput.click();
  }

  public dataread() {
    this.interval = setInterval(() => {
      if (!this.isdate) {
        if (Number(localStorage.getItem("updatedLen"))) {
          this.violLength = Number(localStorage.getItem("updatedLen"));
        }
        this.Subsciption = this.webServer
          .LivePPEViolationData(this.selectedCameraId, this.selectedViolType)
          .subscribe(
            (Rdata: any) => {
              // console.log(Rdata)
              //    var table = document.getElementById('dataTable')
              // table?.classList.add('loading')
              this.dataFetchStatus = "success";
              if (Rdata.success) {
                var response = { ...Rdata };
                var cviol = [...Rdata.message];
                console.log(this.isLatest);
                //console.log(Rdata.message)
                localStorage.setItem(
                  "updatedLen",
                  JSON.stringify(cviol.length)
                );
                var updatedLen = Number(localStorage.getItem("updatedLen"));
                console.log(updatedLen);

                console.log(this.violLength);
                if (
                  response.now_live_count - response.previous_live_count >
                  0
                ) {
                  var diff =
                    response.now_live_count - response.previous_live_count;

                  if (this.alert) {
                    for (let i = diff - 1; i >= 0; i--) {
                      var todayi = new Date();
                      var tempi = new Date(cviol[i].timestamp);

                      //hooter configaration

                      if (this.alert) {
                        this.currentViol = cviol[i];

                        setTimeout(() => {
                          this.showViol();
                        }, 300);
                        !this.audioOff ? this.alertSound() : "";
                      }
                    }
                  }
                }
              }
            },
            (Err) => {
              this.dataFetchStatus = "Error";
            }
          );
        if (false) {
          this.webServer.LivePPEViolationData().subscribe(
            (Response: any) => {
              if (!this.latest) {
                if (Response.success === true) {
                  console.log(Response);
                  console.log(this.selectedCameraId);
                  console.log(Response.message);

                  this.imageData = Response.message;
                  this.tempdata = Response.message;
                  console.log(this.tempdata);
                  //  this.imageCarousal()
                  this.total = of(this.violdata.length);
                  this.loader2 = false;
                  this.isdatewise = false;

                  this.violData = of(Response.message);

                  data = Response.message;
                  this.sliceVD();
                  var data = Response.message;
                  this.violdata = Response.message;
                  // this.tempdata = this.violdata

                  if (this.tempdata.length > 0) {
                    this.Excel = true;
                  } else {
                    false;
                  }

                  this.sliceVD();
                } else {
                }
              }
            },
            (err: any) => {
              console.log(err);
            }
          );
        }
      }
    }, this.delay);
  }

  //modal to view the image

  //MODAL FOR VIOLATION
  showViol() {
    this.toasterService.error(
      <any>this.Violation.nativeElement.innerHTML,
      " ",
      {
        enableHtml: true,
        positionClass: "toast-top-right",
      }
    );
    // console.log(currentViol)
  }

  //function to show the  notification through snackbars
  notification(message: string, action?: string) {
    this.snackbar.open(message, action ? action : "", {
      duration: 4000,
      panelClass: ["error"],
      horizontalPosition: "end",
      verticalPosition: "bottom",
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  //function for searching

  matches(term: string): Observable<any[]> {
    var resultVD = this.tempdata.filter((viol: any) => {
      return (
        (<String>viol.cameraid).includes(term) ||
        viol.roi_violation_name.includes(term) ||
        viol.deviceid.includes(term) ||
        viol.camera_name.includes(term)
      );
    });

    this.tempdata = resultVD;
    const length = resultVD.length;
    this.sliceVD();
    return of(resultVD);
  }

  //function  to manage  the pagination
  sliceVD() {
    if (!this.isdate) {
      this.total = of(
        this.tempdata.slice(
          (this.page - 1) * this.pageSize,
          (this.page - 1) * this.pageSize + this.pageSize
        ).length
      );
      this.total = of(this.tempdata.length);
      this.violData = of(
        this.tempdata
          .map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div }))
          .slice(
            (this.page - 1) * this.pageSize,
            (this.page - 1) * this.pageSize + this.pageSize
          )
      );
    }
    if (this.isdate) {
      var table = document.getElementById("dataTable");
      table?.classList.add("loading");
      this.webServer
        .DatewisePPEViolations(
          this.fromDate,
          this.toDate,
          this.page,
          this.pageSize,
          this.selectedCameraId ? this.selectedCameraId : null,
          this.selectedViolType ? this.selectedViolType : null
        )
        .subscribe((Response: any) => {
          if (Response.success) {
            table?.classList.remove("loading");
            if (Response.message.length === 0) {
              this.notification("No violations found");
            }
            this.tempdata = Response.message;
            //this.imageData=
            this.violData = of(this.tempdata);
          }
        });
    }
  }

  //----------METHOD TO FETCH DATE WISE DATA-----------------

  Submit() {
    this.dataFetchStatus = "init";
    this.isLatest = false;
    this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null;
    this.Images = [];
    this.fromDate = this.selectedMoments.startDate.format(
      "YYYY-MM-DD HH:mm:ss"
    );
    this.toDate = this.selectedMoments.endDate.format("YYYY-MM-DD HH:mm:ss");
    this.Subsciption ? this.Subsciption.unsubscribe() : "";
    // this.table.nativeElement.querySelectorAll('table.table.table-striped.table-bordered')
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");

    this.pageSize = 30;
    this.page = 1;
    this.isdate = true;
    this.loading = true;
    this.webServer
      .DatewisePPEViolations(
        this.fromDate,
        this.toDate,
        null,
        null,
        this.selectedCameraId ? this.selectedCameraId : null,
        this.selectedViolType ? this.selectedViolType : null
      )
      .subscribe(
        (Response: any) => {
          this.dataFetchStatus = "init";
          if (Response.success) {
            if (Response.message.length == 0) {
              this.tempdata = [];
              this.violData = of([]);
              this.loading = false;
              this.isdatewise = true;
              this.total = of(0);
              table?.classList.remove("loading");
              this.notification(
                "No violations found for entered date and time"
              );
            }
            if (Response.message.length > 0) {
              this.imageData = Response.message;
              this.total = of(Response.message.length);
              this.webServer
                .DatewisePPEViolations(
                  this.fromDate,
                  this.toDate,
                  this.page,
                  this.pageSize,
                  this.selectedCameraId ? this.selectedCameraId : null,
                  this.selectedViolType ? this.selectedViolType : null
                )
                .subscribe(
                  (Response: any) => {
                    if (Response.success) {
                      this.loading = false;
                      table?.classList.remove("loading");
                      // console.log(Response.message)
                      if (Response.message.length === 0) {
                        this.notification("No violations found");
                        this.violData = of([]);
                        this.isdatewise = true;
                        this.loading = false;
                      } else {
                        this.tempdata = Response.message;
                        this.isdatewise = true;
                        //this.imageCarousal()
                        // console.log(this.tempdata)

                        this.violData = of(this.tempdata);
                        this.sliceVD();

                        this.loading = false;
                      }
                    }

                    this.loading = false;
                  },
                  (err) => {
                    this.dataFetchStatus = "Error";
                    this.loading = false;
                    this.notification("Error while fetching the data");
                  }
                );
            }
          } else {
            this.tempdata = [];
            this.violData = of([]);
            this.loading = false;
            this.isdatewise = true;
            this.total = of(0);
            table?.classList.remove("loading");
            table?.classList.remove("loading");
            this.notification("No violations found");
            this.loading = false;
          }
        },
        (err) => {
          this.dataFetchStatus = "Error";
          this.loading = false;
        }
      );
  }

  // fetching the violation  details by  ppe violation percentage

  SetPPEFilters() {
    this.dataFetchStatus = "init";
    this.webServer
      .ChangePPEFiltersData({
        ppepercentage: {
          helmet: this.helmetFilterValue.value,
          vest: this.vestFilterValue.value,
        },
      })
      .subscribe((response: any) => {
        this.dataFetchStatus = "success";
        this.GetPPEFilterValues();
        if (!this.isdatewise) {
          this.tempdata = [];
          this.total = of(0);
          this.violData = of([]);
          var table = document.getElementById("dataTable");
          table?.classList.add("loading");
          this.webServer.LivePPEViolationData().subscribe(
            (Rdata: any) => {
              if (Rdata.success) {
                table?.classList.remove("loading");

                var data = Rdata.message;

                this.imageData = Rdata.message;
                this.tempdata = Rdata.message;
                Number(
                  localStorage.setItem(
                    "updatedLen",
                    Rdata.message.length ? Rdata.message.length : 0
                  )
                );
                this.tempdata = Rdata.message;
                this.total = of(this.tempdata.length);
                this.violData = of(Rdata.message);
                // console.log(this.violData)
                this.sliceVD();
              } else {
                table?.classList.remove("loading");
                this.notification(Rdata.message);
              }
            },
            (err) => {
              this.dataFetchStatus = "Error";
              table?.classList.remove("loading");

              this.notification("Error While fetching the data");
            }
          );
        } else {
          this.Submit();
        }
      });
  }

  GetPPEFilterValues() {
    this.webServer.GetPPEFiltersData().subscribe(
      (response: any) => {
        if (response.success) {
          this.vestFilterValue.setValue(response.message.vest);
          this.helmetFilterValue.setValue(response.message.helmet);
        } else {
        }
      },
      (Err) => {}
    );
  }

  //-----------------METHOD TO GO BACK TO LIVE-------------------------

  BackToToday() {
    this.dataFetchStatus = "init";
    this.page = 1;

    this.Images = [];
    this.latest = false;
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");
    this.loader2 = true;
    this.isdate = false;
    this.tempdata = [];
    this.total = of(0);

    this.isdate = false;
    this.tempdata = [];
    this.total = of(0);
    this.webServer.LivePPEViolationData().subscribe(
      (Rdata: any) => {
        this.dataFetchStatus = "success";
        if (Rdata) {
          this.isLatest = false;
          table?.classList.remove("loading");
          this.imageData = Rdata.message;
          this.total = of(Rdata.message.length);
          if (!Rdata.success) {
            this.notification(Rdata.message);
          }
          var cviol = Rdata.message;
          Rdata.success
            ? (this.tempdata = Rdata.message)
            : (this.tempdata = []);
          this.sliceVD();
          this.isdatewise = false;
          localStorage.setItem("updatedLen", JSON.stringify(cviol.length));
          var updatedLen = Number(localStorage.getItem("updatedLen"));
        }
      },
      (Err) => {
        this.dataFetchStatus = "Error";
      }
    );

    this.dataread();
  }
  //----------FUNCTION TO TRANSFORM THE DATE----------------

  dateTransform(date: any) {
    const temp = new Date(date.year, date.month - 1, date.day);
    const FD = this.datepipe.transform(temp, "dd/MM/yyyy");

    return FD;
  }

  onCameraIdSelect(event: any) {
    !this.isdatewise ? (this.page = 1) : "";
    this.selectedCameraId = this.selectedItems.data;
    console.log(this.selectedItems);
    console.log(event);
  }

  imageCarousal(viol: any) {
    //  NgImageSliderServi
    this.Images = [];
    viol.imagename.forEach((imgname: string, index: number) => {
      console.log(imgname);
      this.Images[index] = {
        src: this.API + "/image/" + imgname,
        thumb: this.API + "/image/" + imgname,
        caption: imgname,
      };
    });

    this.open(0);
  }
  open(index: number): void {
    this._lightbox.open(this.Images, index);
  }
  close(): void {
    this._lightbox.close();
  }

  //fucntion to create and download the excel as per the given dates and other inputs
  async submitForm() {
    this.isalert = false;
    this.excelLoad = true;
    this.isExcel = false;
    this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null;

    var body = {
      from_date: this.selectedMoments.startDate.format("YYYY-MM-DD HH:mm:ss"),
      to_date: this.selectedMoments.endDate.format("YYYY-MM-DD HH:mm:ss"),
      cameraname: this.selectedItems
        ? this.selectedItems.data == "all_cameras"
          ? null
          : this.selectedItems.data
        : null,
    };

    var date1 = new Date(this.excelFromDate.value);
    var date2 = new Date(this.excelToDate.value);
    var Difference_In_Time = date2.getTime() - date1.getTime();
    const diffInDs = Difference_In_Time / (1000 * 3600 * 24);

    this.webServer.CreatePPEViolationExcel(body).subscribe(
      (Response: any) => {
        if (Response.success) {
          this.webServer.DownloadViolationExcel().subscribe(
            (response: HttpResponse<any>) => {
              var contentType =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

              const blob = new Blob([response.body], { type: ".xlsx" });
              // var fileName =  response.headers.get('Content-Disposition').split(';')[1];
              var fileName =
                "violation report" +
                " " +
                this.datepipe.transform(new Date(), "YYYY_MM_dd_h_mm_ss") +
                ".xlsx";
              const file = new File([blob], fileName, { type: ".xlsx" });
              saveAs(blob, fileName);
              this.excelLoad = false;
              this.isExcel = true;
            },
            (err) => {
              this.excelLoad = false;

              this.excelLoader = false;
            }
          );
        } else {
          this.notification(Response.message, "Retry");
          this.excelLoad = false;
          this.isExcel = false;
          this.alertmessage = Response.message;
          this.isalert = true;
        }
      },
      (err) => {
        this.excelLoad = false;

        this.isExcel = false;
        this.alertmessage = "Error while creating excel";
        this.notification(this.alertmessage, "Retry");
        this.isalert = true;
      }
    );
  }

  //-------METHOD TO DOWNLOAD THE EXCEL--------
  GetViolationLength(
    fromDate: any,
    toDate: any,
    cameraName: any,
    violationType?: any
  ) {
    this.excelLoader = true;
    var length;
    this.webServer
      .DatewisePPEViolations(
        fromDate,
        toDate,
        null,
        null,
        cameraName ? cameraName : null,
        violationType ? violationType : null
      )
      .subscribe((Response: any) => {
        if (Response.success) {
          length = Response.message.length;
        }
      });
    return length;
  }

  //-----NAVIGATE TO SETTINGS PAGE------
  settings() {
    this.router.navigate(["app/Settings"]);
  }

  //-----METHOD FOR ALERT SOUND------------
  alertSound() {
    let audio = new Audio();
    audio.src = "../../../assets/audio/alert.mp3";
    audio.load();
    audio.play();
  }

  //----------METHOD TO TOGGLE THE VOLUME-------
  volumeToggle() {
    if (!this.alert) {
      this.audioOff = true;
      localStorage.setItem("audioOff", "true");
    } else {
      this.audioOff = !this.audioOff;
      localStorage.setItem("audioOff", this.audioOff ? "true" : "false");
    }
  }

  //----------METHOD TO TOGGLE THE NOTIFICATION --------
  alertToggle() {
    this.alert = !this.alert;
    localStorage.setItem("alert", this.alert ? "true" : "false");
    if (!this.alert) {
      this.audioOff = true;
      localStorage.setItem("alert", "false");

      localStorage.setItem("audioOff", "true");
      this.toasterService.clear();
    }
  }

  //function to get the latest data
  GetLatestPPEData() {
    this.loader2 = false;
    this.loaderLatest = true;
    this.latest = true;
    // this.interval2.subscribe()
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");
    console.log(this.selectedViolType);
    this.webServer.GetLatestPPEData(this.selectedCameraId).subscribe(
      (Rdata: any) => {
        if (Rdata.success) {
          this.isLatest = true;
          table?.classList.remove("loading");
          this.loaderLatest = false;
          Rdata.message.length === 0
            ? this.notification("No violations found")
            : "";
          this.imageData = Rdata.message;
          this.tempdata = Rdata.message;
          console.log(this.tempdata);

          this.tempdata = Rdata.message;

          this.total = of(Rdata.message.length);
          this.violData = of(Rdata.message);
          this.sliceVD();
        } else {
          this.loaderLatest = false;
          table?.classList.remove("loading");
          this.notification("Error while fetching the data", "Retry");
        }
      },
      (err) => {
        this.loaderLatest = false;
        table?.classList.remove("loading");

        this.notification("Error While fetching the data", "Retry");
      }
    );
  }

  //----------------METHOD TO DOWNLOAD THE  IMAGE-------------

  downloadImage(img: any) {
    const imgUrl = img;
    const requestOptions = {
      headers: new HttpHeaders({
        responseType: "blob",
        // observe:'body'
      }),
      withCredentials: true,
    };
    console.log(imgUrl);
    const imgName = imgUrl.substr(imgUrl.lastIndexOf("/") + 1);

    this.http.get(imgUrl, { responseType: "blob" }).subscribe(
      (d: any) => {
        console.log("image url data", d);
        saveAs(d, imgName);
      },
      (err: any) => {
        console.log("error", err);
      }
    );
  }

  //fucntion to get the list of all available cameras
  getCameraList() {
    var cameralist: any[] = [];
    var cameraIdList: any[] = [];

    cameralist[0] = { key: "0", label: "All Cameras", data: "all_cameras" };
    this.webServer.GetPPECameraDetails().subscribe((data: any) => {
      if (data.success === true) {
        data.message.forEach((el: any, i: number) => {
          cameraIdList.push({ cameraid: i, cameraname: el });
        });
        cameraIdList = cameraIdList.filter((el, i, a) => i === a.indexOf(el));
        cameraIdList.forEach((element: any, i: number) => {
          // cameralist[i + 1] = { item_id: element.cameraid, item_text: element.cameraname }
          var obj;
          obj = {
            key: (i + 1).toString(),
            label: element.cameraname,
            data: element.cameraname,
          };

          cameralist.push(obj);
        });

        this.dropdownList = of(cameralist);
      }
    });
  }

  //function to fetch the available violation types
  getViolationTypes() {
    var violTypeList: any[] = [];
    var temp: any[] = [];

    this.violationsList[0] = {
      key: "0",
      label: "All Violations",
      data: "all_violations",
    };
    this.webServer.GetViolationList().subscribe((reponse: any) => {
      if (reponse.success) {
        reponse.message.forEach((element: any) => {
          temp.push(element);
        });

        temp.forEach((element: any, index: number) => {
          var obj;

          obj = {
            key: (index + 1).toString(),
            icon: "pi",
            label: element,
            data: element,
          };

          this.violationsList.push(obj);
        });
        this.violationTypeList = of(this.violationsList);
      }
    });
  }

  SelectViol(data: any, modal: any) {
    this.editViol = data;
    this.modalService.open(modal, { size: "xl", centered: true });
  }

  VerifyTrueViol(event: any, viol: any) {
    this.editViol = viol;
    this.webServer.VerifyViolation(this.editViol._id.$oid, true).subscribe(
      (response: any) => {
        this.webServer.notification(response.message);
        if (response.success) {
          this.modalService.dismissAll();
          if (this.isdatewise) this.Submit();
        }
        if (!this.isdatewise) {
          this.GetViolationData();
        }
      },
      (Err: any) => {
        this.webServer.notification("Error while the  Process", "Retry");
      }
    );
  }

  VerifyFalseViol(event: any, viol: any) {
    this.editViol = viol;
    this.webServer.VerifyViolation(this.editViol._id.$oid, false).subscribe(
      (response: any) => {
        this.webServer.notification(response.message);
        if (response.success) {
          this.modalService.dismissAll();
          if (this.isdatewise) this.Submit();
        }
        if (!this.isdatewise) {
          this.GetViolationData();
        }
      },
      (Err: any) => {
        this.webServer.notification("Error while the  Process", "Retry");
      }
    );
  }
  IsDeleteData(modal: any, violationData: any) {
    this.selectedViolation = violationData;
    this.modalService.open(modal);
  }
  DeleteViolationData() {
    this.webServer
      .DeleteViolationData(this.selectedViolation._id.$oid)
      .subscribe(
        (response: any) => {
          if (response.success) {
            this.modalService.dismissAll();
            this.RefreshViolationData();
            this.webServer.notification(response.message);
          } else {
            this.modalService.dismissAll();
            this.webServer.notification(response.message, "Retry");
          }
        },
        (Err) => {
          this.webServer.notification("Error while the process", "Retry");
        }
      );
  }
  RefreshViolationData() {
    if (!this.isdatewise && !this.isLatest) {
      var table = document.getElementById("dataTable");
      table?.classList.add("loading");

      this.webServer.LivePPEViolationData().subscribe(
        (Response: any) => {
          if (!this.latest) {
            table.classList.remove("loading");
            if (Response.success === true) {
              this.imageData = Response.message;
              this.tempdata = Response.message;
              //  this.imageCarousal()
              this.total = of(this.violdata.length);

              this.violData = of(Response.message);

              data = Response.message;
              this.sliceVD();
              var data = Response.message;
              this.violdata = Response.message;
              // this.tempdata = this.violdata

              if (this.tempdata.length > 0) {
                this.Excel = true;
              } else {
              }

              this.sliceVD();
            } else {
            }
          }
        },
        (err: any) => {
          table.classList.remove("loading");
          console.log(err);
        }
      );
    } else if (this.isdatewise && !this.isLatest) {
      var table = document.getElementById("dataTable");
      table?.classList.add("loading");

      this.pageSize = 30;
      this.page = 1;
      this.webServer
        .DatewisePPEViolations(
          this.fromDate,
          this.toDate,
          null,
          null,
          this.selectedCameraId ? this.selectedCameraId : null,
          this.selectedViolType ? this.selectedViolType : null
        )
        .subscribe(
          (Response: any) => {
            this.dataFetchStatus = "success";
            if (Response.success) {
              if (Response.message.length == 0) {
                this.tempdata = [];
                this.violData = of([]);

                this.total = of(0);
                table?.classList.remove("loading");
                this.notification(
                  "No violations found for entered date and time"
                );
              }
              if (Response.message.length > 0) {
                this.imageData = Response.message;
                this.total = of(Response.message.length);
                this.webServer
                  .DatewisePPEViolations(
                    this.fromDate,
                    this.toDate,
                    this.page,
                    this.pageSize,
                    this.selectedCameraId ? this.selectedCameraId : null,
                    this.selectedViolType ? this.selectedViolType : null
                  )
                  .subscribe(
                    (Response: any) => {
                      if (Response.success) {
                        table?.classList.remove("loading");
                        // console.log(Response.message)
                        if (Response.message.length === 0) {
                          this.notification("No violations found");
                          this.violData = of([]);
                        } else {
                          this.tempdata = Response.message;
                          //this.imageCarousal()
                          // console.log(this.tempdata)

                          this.violData = of(this.tempdata);
                          this.sliceVD();
                        }
                      }
                    },
                    (err) => {
                      this.dataFetchStatus = "Error";
                      this.notification("Error while fetching the data");
                    }
                  );
              }
            } else {
              this.tempdata = [];
              this.violData = of([]);

              this.total = of(0);
              table?.classList.remove("loading");
              table?.classList.remove("loading");
              this.notification("No violations found");
            }
          },
          (err) => {}
        );
    } else if (this.isLatest || this.latest) {
      this.GetLatestPPEData();
    }
  }

  //function to get the live  violation data
  GetViolationData() {
    var table = document.getElementById("content");
    table?.classList.add("loading");

    if (!this.latest || this.isLatest) {
      this.webServer.LivePPEViolationData().subscribe(
        (Rdata: any) => {
          if (Rdata.success) {
            table?.classList.remove("loading");

            var data = Rdata.message;

            this.imageData = Rdata.message;
            this.tempdata = Rdata.message;
            Number(
              localStorage.setItem(
                "updatedLen",
                Rdata.message.length ? Rdata.message.length : 0
              )
            );

            this.tempdata = Rdata.message;
            // this.imageCarousal()

            this.total = of(this.tempdata.length);
            this.violData = of(Rdata.message);
            this.sliceVD();
          } else {
            table?.classList.remove("loading");
            this.notification(Rdata.message);
          }
        },
        (err) => {
          table?.classList.remove("loading");

          this.notification("Error While fetching the data");
        }
      );
    }
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
    clearInterval(this.interval);

    this.isalert = false;

    this.toasterService.clear();
  }
}
