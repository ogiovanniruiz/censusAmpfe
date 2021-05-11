import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TargetService} from '../../services/target/target.service'
import {OrganizationService} from '../../services/organization/organization.service'
import { Options } from 'ng5-slider'
import { ActivityService} from '../../services/activity/activity.service'

@Component({
    templateUrl: './assetDialog.html',
  })
  
  export class AssetDialog implements OnInit{

    userOrgs;
    ready = false;
    registeredOrgs = [];
    displayMessage = false;
    userMessage = ""
    locked = false;
    @ViewChild('group', {static: false}) selectedOrg:ElementRef;
    @ViewChild('eventName', {static: false}) eventName: ElementRef;
    @ViewChild('picker', {static: false}) date: ElementRef;
    @ViewChild('time', {static: false}) time:ElementRef;

    options: Options = {floor: 0,
      ceil: 24,
      translate: (value: number): string => {

        if (value > 12) {
          value = value - 12
          if (value === 12) { return value.toString() + "AM" } 
          else { return value.toString() + "PM" }
        } else {
          if (value === 12) { return value.toString() + "PM" } 
          else if(value === 0) { return (12).toString() + "AM" } 
          else { return value.toString() + "AM" }
        }
      }};
  
    constructor(
        public dialogRef: MatDialogRef<AssetDialog>, 
        @Inject(MAT_DIALOG_DATA) public data: any, 
        public targetService: TargetService, 
        public orgService: OrganizationService,
        public activityService: ActivityService) {
        }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    createEvent(){

      var startTime = this.time['value']
      var endTime = this.time['highValue']

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
      var orgID = localStorage.getItem('orgID')

      var date = this.date['_selected'].toString().substring(0, 15);

      if(this.eventName.nativeElement.value != "" &&  this.date['_selected']){
        this.displayMessage = false;
        var activityDetail = {campaignID: campaignID, orgID: orgID, parcelData: this.data, activityType: "Event", createdBy: userID, activityName: this.eventName.nativeElement.value, date: date, startTime: startTime, endTime: endTime}

        this.activityService.createActivity(activityDetail).subscribe(activity => {
          this.dialogRef.close(activity);
        })

      } else{
        this.displayMessage = true;
        this.userMessage = "Please select a Date and name this event. "
      }

    }

    ngOnInit(){
      //this.getUserOrgs();
    }
}