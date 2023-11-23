import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServerService } from 'src/app/Services/server.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit ,AfterViewInit{
   isCollapse:boolean=false
  constructor(private router:Router,public server:ServerService,private ModalService:NgbModal) { 
  
    this.server.isCollapse.subscribe((value:any)=>{
      this.isCollapse=value
      console.log('iscollapse',this.isCollapse)

    })
   
    console.log(this.isCollapse,'collapse')
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    if(localStorage.getItem('isCollapse')=='true'){
      this.isCollapse=true
      var sidebarWrapper=document.getElementById('sidebarWrapper')
  var sidebar=document.getElementById('sidebar')
  // var header=document.getElementById('header')
  var footer=document.getElementById('footer')
  var wrapper=document.getElementsByClassName('dashboard-wrapper')[0]
  // header.classList.toggle('active')
  sidebar.classList.toggle('active')
  footer.classList.toggle('active')
  wrapper.classList.toggle('active')
  this.server.isCollapse.next(true)
    }
    else{
      this.isCollapse=false
    }
    console.log('iscollapse',this.isCollapse)
  }
  Logout(){
    this.ModalService.dismissAll()
    localStorage.removeItem('session')
    console.log('logout')
    this.router.navigate(['/login'])
  
}

LogoutModal(modal:any){
  this.ModalService.open(modal,{centered:true})
}


toggleSidebar(){
  this.isCollapse=!this.isCollapse
  localStorage.setItem('isCollapse',this.isCollapse==true?'true':'false')
  var sidebarWrapper=document.getElementById('sidebarWrapper')
  var sidebar=document.getElementById('sidebar')
  // var header=document.getElementById('header')
  var footer=document.getElementById('footer')
  var wrapper=document.getElementsByClassName('dashboard-wrapper')[0]
  console.log(wrapper)
//  sidebarWrapper.classList.toggle('active')
  // header.classList.toggle('active')
  sidebar.classList.toggle('active')
  footer.classList.toggle('active')
  wrapper.classList.toggle('active')
  this.server.isCollapse.next(this.isCollapse)
}
}
