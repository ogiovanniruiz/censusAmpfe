import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { MatGridList } from '@angular/material';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Router } from "@angular/router";
import { UserService } from '../services/user/user.service';
import {MatDialog} from '@angular/material';
import {OrgsDialog } from './orgsDialog';
import {CampaignService} from '../services/campaign/campaign.service'
import {ReportService} from '../services/report/report.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  orgLevel: String;
  userProfile: Object;
  campaignName: String; 
  dev = false;
  dataLoaded = false;
  dataManager = false;
  @ViewChild('picker', {static: false}) date: ElementRef;

  @ViewChild('grid', {static: true}) grid: MatGridList;

  gridByBreakpoint = {
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }

  constructor(private observableMedia: MediaObserver,public router: Router, public reportService: ReportService, public userService: UserService, public dialog: MatDialog, public campaignService: CampaignService) { }

  enterTargetingModule(){
    this.router.navigate(['/targeting']);
  }
  
  enterEventsModule(){
    //var date = this.date['_selected'] ? new Date(this.date['_selected']).toISOString().slice(0, 10) : '';
    //localStorage.setItem('selectedEventDate', date)
    localStorage.setItem('activityType', "Event")
    this.router.navigate(['/events']);
  }


  openOrgsDialog(){
    const dialogRef = this.dialog.open(OrgsDialog);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        console.log("CLOSED...")
      }
    });
  }

  getCampaignDetail(){
    var campaignID = parseInt(localStorage.getItem('campaignID'));

    this.campaignService.getCampaign(campaignID).subscribe(campaignDetail=>{
      this.campaignName = campaignDetail['name']
      
    })
  }

  refreshUserProfile(){
    this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    this.dev = this.userProfile['user']['dev']

    this.userService.getUserProfile(this.userProfile).subscribe(result=>{
      localStorage.setItem('userProfile', JSON.stringify(result))
      this.userProfile = result
      this.getOrgLevel()
    })
  }

  getOrgLevel(){
    var orgID = localStorage.getItem('orgID')
    var userOrgs = this.userProfile['user']['userOrgs']

    for (var i = 0; i< userOrgs.length; i++){
      if(userOrgs[i].orgID === orgID){
        this.orgLevel = userOrgs[i].level
      }
    }
    this.dataLoaded = true;
  }

  getDataManagerStatus(){
    var campaignID = parseInt(localStorage.getItem('campaignID'));
    var dataManagementArray = this.userProfile['user']['dataManager']

    for (var i = 0; i< dataManagementArray.length; i++){
      if(dataManagementArray[i] === campaignID ){
        this.dataManager = true;
      }
    }
  }

  getReport(){
    this.router.navigate(['/reports']);
  }

  public enterActivityDashboard(activity_type){
    localStorage.setItem('activityType', activity_type)
    this.router.navigate(['/activity']);
  }

  ngOnInit() {
    this.grid.cols = 1;
    this.refreshUserProfile();
    this.getCampaignDetail();
    this.getDataManagerStatus();
  }

  ngAfterContentInit() {
    this.observableMedia.media$.subscribe((change: MediaChange) => {
      this.grid.cols = this.gridByBreakpoint[change.mqAlias];
    });
  }
}
