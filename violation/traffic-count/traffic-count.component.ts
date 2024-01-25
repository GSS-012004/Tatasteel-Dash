import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { BarControllerChartOptions, ChartOptions, ChartConfiguration,ChartType, LabelItem } from 'chart.js';
import { BarController, Chart } from 'chart.js/dist';
import { Moment } from 'moment';
import chart from 'chart.js/dist';
import { utils } from 'xlsx';
// import { ChartComponent } from 'ng-apexcharts';
// import { Label } from 'ng2-charts';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { TrafficCountService } from './traffic-count.service';
import { ServerService } from 'src/app/Services/server.service';
import { Observable, of, range } from 'rxjs';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-traffic-count',
  templateUrl: './traffic-count.component.html',
  styleUrls: ['./traffic-count.component.css'],
  providers:[TrafficCountService]
})
export class TrafficCountComponent implements OnInit,AfterViewInit,OnDestroy {
  selectedMoments: { startDate: Moment | any, endDate: Moment | any }={startDate:null,endDate:null}
   tcData:Observable<TreeNode[]>=of([])
   dataInterval:any=null
   isGraph:boolean=false
  graphData:any[]=[]
   tempData:any[]=[]
   selectedCamera:any
   page:number=1
   dataFetchStatus:any='init'
   size:number=10
   fromDate:any
   toDate:any
   lastUpdatedDate:string=''

   isLive:boolean=true
   cameraList:Observable<any[]>=of([])
  barChartOptions: any= {
    scaleShowVerticalLines: false,
    borderRadius:10,
    spacing:0.2,//not worked
    spanGaps:5,
    categoryPercentage:0.75,
    barPercentage:0.9,
    responsive: true,
    elements: {
      line: {
              fillt: false
      },
    
    },
    scales: {

        x: {
          grid: {
            display: false,
            stacked: true,
          }
        },
        y: {
          grid: {
            display: false,
            stacked: true,
          },
        },
        
      },
   
    plugins: {
     
      legend: {
        display: true,
      },
      
    }
    
    }

    barChartOptions2: any= {
      // barThickness:30,
      scaleShowVerticalLines: false,
  
      borderRadius:10,
      spacing:0.2,//not worked
      spanGaps:5,
      categoryPercentage:0.75,
      barPercentage:0.9,
  
      
      // barThickness:3,
      
      responsive: true,
      elements: {
        line: {
                fill: false
        },
      
      },
  
        scales: {
          x: {
            display: false,
            min: 0.5,
            max: 2.5,
            offset: false
          },
          y: {
            display: false,
            min: 0.5,
            max: 2.5
          }
        }
     
        ,
     
      plugins: {
        // title: {
        //   display: true,
        //   text: 'Chart.js Bar Chart - Stacked'
        // },
        legend: {
          display: true,
        },
        
      }
      
      }
   

  barControllerChartOptions:any={barThickness:6}
  barChartLabels: any[] = ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins:any = [];
  barChartData: any[] = [
    // { data: [49, 30, 89, 90, 15, 33],label:'Occupiency', type:'line', borderColor:'orange',backgroundColor:'white', pointStyle: 'circle',
    // pointRadius: 4,
    // pointHoverRadius: 8},
  
    { data: [], label: 'Entry', stack: 'Stack 0',backgroundColor:'#ccc',barThickness:12,borderRadius:7},
    { data: [], label: 'Entry', stack: 'Stack 0',backgroundColor:'#D8D8D9',barThickness:12,borderRadius:7},

    { data: [], label: 'Exit', stack: 'Stack 1',backgroundColor:'#134276',barThickness:10,borderRadius:7},
    { data: [], label: 'Exit', stack: 'Stack 1',backgroundColor:'#82beff',barThickness:10,borderRadius:7},

   
  ];

  barChartData2: any[] = [
    { data: [49, 30, 89, 90, 15, 33],label:'Occupiency', type:'line', borderColor:'orange',backgroundColor:'white', pointStyle: 'circle',
    pointRadius: 4,
    pointHoverRadius: 8},
  
    {  data: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}],
     label: 'Entry',backgroundColor:'#ccc',barThickness:12,borderRadius:7,  width: (chart:any) => (chart.chartArea || {}).width / 2 - 1,
     height: (chart:any) => (chart.chartArea || {}).height / 2 - 1,},
 

   
  ];

  constructor(public AppServer:ServerService,public APIService:TrafficCountService) { 
    clearInterval(this.AppServer.liveViolInterval)
    clearInterval(this.AppServer.ccLiveInterval)
  }

  ngOnInit(): void {
    this.getCameraList()
  }
  ngAfterViewInit(): void {
   this.tempData=[]
    var dataContainer=document.getElementById('data-container')
    dataContainer.classList.add('loading')
    this.APIService.GetTCLiveData().subscribe((response:any)=>{
      console.log(response.message)
      dataContainer.classList.remove('loading')
    this.dataFetchStatus='success'
            this.lastUpdatedDate=this.AppServer.dateTransformbyPattern(new Date(),"YYYY-MM-dd HH:mm:ss")
           if(response.success){
            response.message.forEach((element:any) => {
              this.tempData.push(...element.data)
         });
         console.log(this.tempData)
         this.tcData=of(this.tempData)
            console.log(this.tempData)
            this.tcData=of(this.tempData)
           }
           else{
            this.AppServer.notification(response.message,'Retry')
           }
    },
    Err=>{
      dataContainer.classList.remove('loading')

      this.dataFetchStatus='Error'
     this.AppServer.notification('Error while fetching the data','Retry')
      
    })
    
  }
  dateUpdated(event:any){
    
    console.log(event)
    this.fromDate = this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss')
    this.toDate = this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss')
    this.GetTCDataByFilters()

  }
 
  GetLiveData(){
    if(this.isLive){
    this.tempData=[]
    var dataContainer=document.getElementById('data-container')
    dataContainer?  dataContainer.classList.add('loading'):''
    this.APIService.GetTCLiveData().subscribe((response:any)=>{
      console.log(response.message)
      dataContainer?dataContainer.classList.remove('loading'):''
  this.lastUpdatedDate=this.AppServer.dateTransformbyPattern(new Date(),'YYYY-MM-dd HH:mm:ss')
           if(response.success){
            response.message.forEach((data:any) => {
              // console.log(data)
              // var temp={data:data.data[0],children:data.data.slice(1,data.data.length).map((element:any) => {
              //  return {data:element}
              // })}
              // console.log(temp)
              // this.tempData.push(temp)
            });
            response.message.forEach((element:any) => {
                 this.tempData.push(...element.data)
              
            });
          
            console.log(this.tempData)
            this.tcData=of(this.tempData)
           }
           else{
            this.AppServer.notification(response.message,'Retry')
           }
    },
    Err=>{
      dataContainer.classList.remove('loading')

      dataContainer?dataContainer.classList.remove('loading'):''
      this.AppServer.notification('Error while fetching the data','Retry')

    })
    
  }
  }
  OnTabChange(event:any){
    console.log(event)
  }
  getCameraList() {
    var cameralist: any[] = []
    var cameraIdList: any[] = []

    cameralist[0] = { key: '0', label: 'All Cameras', data: 'all_cameras' }
    this.AppServer.GetCCCameraDetails().subscribe((data: any) => {
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


        this.cameraList = of(cameralist)
      }

    })

  }
  
  onCameraIdSelect(event: any) {
    // !this.isdatewise ? this.page = 1 : ''
    // this = this.selectedItems.data
    // console.log(this.selectedItems)
    console.log(event)
    this.GetTCDataByFilters()


  }
  ResetFilters(){
    //this.selectedMoments={startDate:null,endDate:null}
    this.selectedMoments=null
    this.selectedCamera=null
    this.isLive=true
    this.GetLiveData()

  }

  RefreshDetails(){
    this.ResetFilters()
    this.GetLiveData()
  }

  GetTCDataByFilters(){
    this.isLive=false
    var dataContainer=document.getElementById('data-container')
    dataContainer.classList.add('loading')
    this.tempData=[]
    this.dataFetchStatus='init'
    this.APIService.GetTCDataByFilters(this.fromDate,this.toDate,this.page,this.size,this.selectedCamera?this.selectedCamera.data:null).subscribe((response:any)=>{
      dataContainer.classList.remove('loading')      
      this.dataFetchStatus='success'
      if(response.success){
             
              response.message.forEach((element:any) => {
                this.tempData.push(...element.data)
           });
           console.log(this.tempData)
           this.tcData=of(this.tempData)
              
            }  
            else{
              this.tcData=of([])
              this.AppServer.notification(response.message)
            }
    },
    Err=>{
      this.dataFetchStatus='Error'
      dataContainer.classList.remove('loading')

      this.tcData=of([])
      this.AppServer.notification('Error while fetching the data','Retry')
    })

  }

  GetGraphOfCamera(data:any){
    this.barChartData= [
      // { data: [49, 30, 89, 90, 15, 33],label:'Occupiency', type:'line', borderColor:'orange',backgroundColor:'white', pointStyle: 'circle',
      // pointRadius: 4,
      // pointHoverRadius: 8},
    
      { data: [], label: 'Entry', stack: 'Stack 0',backgroundColor:'#ccc',barThickness:12,borderRadius:7},
      { data: [], label: 'Entry', stack: 'Stack 0',backgroundColor:'#D8D8D9',barThickness:12,borderRadius:7},
  
      { data: [], label: 'Exit', stack: 'Stack 1',backgroundColor:'#134276',barThickness:10,borderRadius:7},
      { data: [], label: 'Exit', stack: 'Stack 1',backgroundColor:'#82beff',barThickness:10,borderRadius:7},
  
     
    ];
    this.isGraph=true
    var lineNames:any[]=[]
    var timestamps:any[]=[]
    var tempData=this.tempData.filter((element:any)=>{
      return element.camera_name==data.camera_name
    })
    for(let i=0;i<tempData.length;i++){
        if( !(lineNames.indexOf(tempData[i].line_name)>=0))  {
          lineNames.push(tempData[i].line_name)
        }
          timestamps.push(tempData[i].timestamp)

    }
                
     for(let i=0;i<lineNames.length;i++){
             for(let j=0;j<tempData.length;j++){
                if(tempData[j].line_name==lineNames[i]){
                  this.barChartData[1].label=tempData[j].direction
                  tempData[j].direction=="entry"?this.barChartData[i].stack="Stack 0":this.barChartData[i].stack="Stack 1"
                  if(tempData[j].direction=="entry"){
                    this.barChartData[i].stack="Stack 0"
                    this.barChartData[0].data.push(tempData[j].count.person)

                    this.barChartData[i].label=`entry <br/>${tempData[j].line_name}`
                  }
                  else{
                    this.barChartData[i].stack="Stack 1"
                    this.barChartData[1].data.push(tempData[j].count.person)

                    this.barChartData[1].label=`exit+${tempData[j].line_name}`
                  }
                }
              }
             
    }
    this.barChartLabels=timestamps
    console.log(tempData)
    console.log('graph',this.barChartData)
  }

  ngOnDestroy(): void {
    clearInterval(this.dataInterval)
  }


}
