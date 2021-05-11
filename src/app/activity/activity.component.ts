import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridList } from '@angular/material';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material';
import {ActivityDialog} from '../activity/activityDialog/activityDialog';
import {ActivityImpressionsSubmitDialog} from '../activity/activityDialog/activityImpressionsSubmitDialog';
import { Router } from '@angular/router';
import {ActivityService} from '../services/activity/activity.service';
import {ReportService} from '../services/report/report.service';
import {TextingService} from '../services/texting/texting.service'

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  @ViewChild('grid', {static: true}) grid: MatGridList;

  userProfile: any;
  dev = false;
  orgLevel: String
  activityType: String;
  activities = []
  completedActivities = []
  activitiesKnocks = []
  activitiesKnocksCompleted = []
  dataLoaded = false;
  file: any;

  gridByBreakpoint = {
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }

  constructor(private observableMedia: MediaObserver, 
              public dialog: MatDialog, 
              public activityService: ActivityService, 
              public reportService: ReportService, 
              public router: Router,
              public textService: TextingService) { }

  refreshUserProfile(){
    this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
    this.dev =  this.userProfile['user']['dev']
  }

  getOrgLevel(){
    var orgID = localStorage.getItem('orgID')
    var userOrgs = this.userProfile['user']['userOrgs']

    for (var i = 0; i< userOrgs.length; i++){
      if(userOrgs[i].orgID === orgID){
        this.orgLevel = userOrgs[i].level
      }
    }
  }

  enterActivity(activity){

    localStorage.setItem('activityID', activity._id)
    if(this.activityType === "Canvass"){
      this.router.navigate(['/canvass']);
    } else if(this.activityType === "Texting" ){
      this.router.navigate(['/texting']);
    } else if(this.activityType === "Phonebank" ){
      this.router.navigate(['/phonebank']);
    }else if(this.activityType === "Petition" ){
      this.router.navigate(['/petition']);
    }

  }

  createEditActivity(mode: String, activity: Object){
    const dialogRef = this.dialog.open(ActivityDialog,  {width: '95%', data: {mode: mode, activity: activity}, disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.refreshUserProfile(); this.getActivities();
    });
  }

  submitImpressionActivities(mode: String, activity: Object){
    const dialogRef = this.dialog.open(ActivityImpressionsSubmitDialog,  {width: '95%', data: {mode: mode, activity: activity}, disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.refreshUserProfile(); this.getActivities();
    });
  }

  getActivities(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var orgID = localStorage.getItem('orgID')

    this.activityService.getActivities(campaignID, orgID, this.activityType).subscribe(async (activities: []) =>{
      this.activities = await activities.filter(function (item) { return !item['activityMetaData']['complete']; });
      this.completedActivities = await activities.filter(function (item) { return item['activityMetaData']['complete']; });

      this.dataLoaded = true;
      if(this.activityType === "Canvass"){
        for (let i in this.activities) {
          this.activitiesKnocks[i] = []
          await this.reportService.getActivitiesSummaryReport(this.activities[i]).subscribe(
            async (reports: any[]) => {
                this.activitiesKnocks[i] = await reports[0];
            }
          )
        }
        for (let j in this.completedActivities) {
          this.activitiesKnocksCompleted[j] = []
          await this.reportService.getActivitiesSummaryReport(this.completedActivities[j]).subscribe(
              async (reports: any[]) => {
                this.activitiesKnocksCompleted[j] = await reports[0];
              }
          )
        }
      }
    })
  }

  ngOnInit() {
    this.grid.cols = 1;
    this.refreshUserProfile();
    this.activityType = localStorage.getItem('activityType')
    this.getActivities();
    this.getOrgLevel()
  }

  ngAfterContentInit() {
    this.observableMedia.media$.subscribe((change: MediaChange) => {
      this.grid.cols = this.gridByBreakpoint[change.mqAlias];
    });
  }

  upload(){
    var orgID = localStorage.getItem('orgID')
    this.textService.pullTexts(orgID).subscribe(result =>{
      console.log(result)
    })
  }
}
