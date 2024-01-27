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
import { FormControl, Validators } from "@angular/forms";
import { Observable, of, Subscription } from "rxjs";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { ToastrService } from "ngx-toastr";
import { NgbDate, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Moment } from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import dayjs from "dayjs/esm";
@Component({
  selector: "app-crowd-count-violations",
  templateUrl: "./crowd-count-violations.component.html",
  styleUrls: ["./crowd-count-violations.component.css"],
})
export class CrowdCountViolationsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  isAlert: boolean = false;
  isalert: boolean = false;
  dataFetchStatus: string = "";
  tempdata: any[] = [];
  page: number = 1;
  pageSize: number = 30;
  audioOff: boolean = false;
  alertmessage: string = "";
  prevViolCount: number = 0;
  total: Observable<number> = of(0);
  violData: Observable<any[]> = of([]);
  loading: boolean = false;
  violLength: number = 0;
  updatedLen: number = 0;
  violdata: any[] = [];
  currentViol: any = null;
  show1: number = 30;
  show2: number = 40;
  show3: number = 50;
  fromDate: any = new Date();
  toDate: any = new Date();
  isdatewise: boolean = false;
  API: any;
  interval: any;
  loader2: boolean = false;
  interval2: any;
  excelBlob: any;
  Excel: boolean = false;
  isExcel: boolean = false;
  excelLoad: boolean = false;
  alert: boolean = true;
  imageData: any[] = [];
  ExcelRange: number;
  delay: number;
  objectKeys = Object.keys;
  isdate: boolean = false;

  selectedViolType: string | null = null;
  Subsciption!: Subscription;
  selectedCameraId: string | null = null;
  dropdownList: Observable<any[]> = of([]);

  excelFromDate: FormControl = new FormControl(new Date(), Validators.required);
  excelToDate: FormControl = new FormControl(new Date(), Validators.required);
  Images: any[] = [];
  loc2: FormControl = new FormControl("", Validators.required);
  @ViewChild("dangerAlert") Violation: ElementRef<any>;
  dropdownSettings!: IDropdownSettings;
  selectedItems: any = null;
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

  selectedMoments: { startDate: Moment; endDate: Moment } = null;
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

    this.excelFromDate.valueChanges.subscribe((data) => {
      this.isalert = false;
    });
    this.excelToDate.valueChanges.subscribe((data) => {
      this.isalert = false;
    });

    //..............................................
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: true,
      idField: "item_id",
      textField: "item_text",
      itemsShowLimit: 1,
      allowSearchFilter: true,
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

    //------------Reading the camera details--------------
    //uncomment while you work

    this.dataFetchStatus = "init";
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");

    if (!this.latest || this.isLatest) {
      this.webServer.LiveCCViolationData().subscribe(
        (Rdata: any) => {
          this.dataFetchStatus = "success";
          if (Rdata.success) {
            this.prevViolCount = Rdata.now_live_count;

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
    }
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
          .LiveCCViolationData(this.selectedCameraId, this.selectedViolType)
          .subscribe(
            (Rdata: any) => {
              this.dataFetchStatus = "success";
              if (Rdata.success) {
                var response = { ...Rdata };
                var cviol = [...Rdata.message];
                console.log(this.isLatest);
                // localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
                // var updatedLen = Number(localStorage.getItem("updatedLen"))
                // console.log(updatedLen)

                console.log(this.violLength);
                if (response.now_live_count - this.prevViolCount > 0) {
                  this.prevViolCount = response.now_live_count;
                  var diff =
                    response.now_live_count - response.previous_live_count;

                  if (this.alert) {
                    for (let i = diff - 1; i >= 0; i--) {
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
          this.webServer.LiveCCViolationData().subscribe(
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

  //function for searching

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
        .DatewiseCCViolations(
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
    this.isLatest = false;
    this.selectedViolType = this.selectedViolation
      ? <any>this.selectedViolation.data
      : null;
    this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null;
    this.Images = [];
    this.fromDate = this.selectedMoments.startDate.format(
      "YYYY-MM-DD HH:mm:ss"
    );
    this.toDate = this.selectedMoments.endDate.format("YYYY-MM-DD HH:mm:ss");
    this.Subsciption ? this.Subsciption.unsubscribe() : "";
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");

    this.pageSize = 30;
    this.page = 1;
    this.isdate = true;
    this.loading = true;
    this.webServer
      .DatewiseCCViolations(
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
                .DatewiseCCViolations(
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
          this.loading = false;
        }
      );

    //------------INTERWAL TO FETCH THE VIOLATIONS -------------
    this.interval2 = setInterval(() => {
      if (this.isdate) {
        if (Number(localStorage.getItem("updatedLen"))) {
          this.violLength = Number(localStorage.getItem("updatedLen"));
        }

        this.webServer.LiveCCViolationData().subscribe((Rdata: any) => {
          if (Rdata.success) {
            var cviol = Rdata.message;
            var response = { ...Rdata };

            if (response.now_live_count - response.previous_live_count > 0) {
              this.violdata = Rdata.message;
              //this.imageData = Rdata.message
              var diff = response.now_live_count - response.previous_live_count;
              //this.imageCarousal()

              if (this.alert) {
                for (let i = diff - 1; i >= 0; i--) {
                  if (this.alert) {
                    this.currentViol = this.violdata[i];

                    setTimeout(() => {
                      this.showViol();
                      !this.audioOff ? this.alertSound() : "";
                    }, 300);
                  }
                }
              }
            }
          }
        });
      }
    }, 3000);
  }

  //-----------------METHOD TO GO BACK TO LIVE-------------------------

  BackToToday() {
    this.page = 1;

    this.Images = [];
    this.latest = false;
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");
    this.loader2 = true;
    this.interval2 ? clearInterval(this.interval2) : "";
    this.isdate = false;
    this.tempdata = [];
    this.total = of(0);
    this.interval2 ? clearInterval(this.interval2) : "";
    this.isdate = false;
    this.tempdata = [];
    this.total = of(0);
    this.webServer.LiveCCViolationData().subscribe((Rdata: any) => {
      if (Rdata) {
        this.isLatest = false;
        table?.classList.remove("loading");
        this.imageData = Rdata.message;
        this.total = of(Rdata.message.length);
        if (!Rdata.success) {
          this.notification(Rdata.message);
        }
        var cviol = Rdata.message;
        Rdata.success ? (this.tempdata = Rdata.message) : (this.tempdata = []);
        this.sliceVD();
        this.isdatewise = false;
        localStorage.setItem("updatedLen", JSON.stringify(cviol.length));
        var updatedLen = Number(localStorage.getItem("updatedLen"));
      }
    });

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

  onViolationTypeSelect(event: any) {
    console.log(this.selectedViolation);
    console.log(event);
    console.log(event.item_id);
    !this.isdatewise ? (this.page = 1) : "";
    this.selectedViolType = this.selectedViolation.data;
    console.log(this.selectedViolType);
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
    this.selectedViolType = this.selectedViolation
      ? <any>this.selectedViolation.data
      : null;
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
    this.webServer.CreateCCViolationExcel(body).subscribe(
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
    var length;
    this.webServer
      .DatewiseCCViolations(
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
    }
  }

  //function to get the latest data
  GetLatestCCData() {
    this.loader2 = false;
    this.loaderLatest = true;
    this.latest = true;
    // this.interval2.subscribe()
    var table = document.getElementById("dataTable");
    table?.classList.add("loading");
    console.log(this.selectedViolType);
    this.webServer.GetLatestCCData(this.selectedCameraId).subscribe(
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
          this.notification(Rdata.message, "Retry");
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
    this.webServer.GetCCCameraDetails().subscribe((data: any) => {
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

  ResetFilters() {
    this.selectedMoments = null;
    this.selectedItems = null;
    this.selectedCameraId = null;

    this.dataread();
  }

  //function to get the live  violation data
  GetViolationData() {
    var table = document.getElementById("content");
    table?.classList.add("loading");

    if (!this.latest || this.isLatest) {
      this.webServer.LiveCCViolationData().subscribe(
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

            this.webServer.notification(response.message);
            this.dataread();
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

  ngOnDestroy() {
    this.modalService.dismissAll();
    clearInterval(this.interval);
    clearInterval(this.interval2);
    this.isalert = false;
  }
}
