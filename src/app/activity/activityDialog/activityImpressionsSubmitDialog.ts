import { Component, OnInit, ViewChild, ElementRef, Inject, ViewChildren, QueryList} from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service';
import {CampaignService} from '../../services/campaign/campaign.service';
import {OrganizationService} from '../../services/organization/organization.service';
import {ActivityService} from '../../services/activity/activity.service';
import {TargetService} from '../../services/target/target.service';
import {ScriptService} from '../../services/script/script.service';
import {PetitionService} from '../../services/petition/petition.service';
import decode from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {DatePipe} from '@angular/common';

@Component({
  templateUrl: './activityImpressionsSubmitDialog.html',
  providers: [DatePipe]
})
  
export class ActivityImpressionsSubmitDialog implements OnInit{
  private API_URL = environment.API_URL;

  targets = []
  targetSelectedID: String;
  displayMessage = false;
  userMessage: String;
  activity;
  activityDate;
  mode: String;
  scripts = [];
  selectedScriptIds = []
  selectedTargetIds = []
  selectedNumberValues = []
  activityType: String;
  quickResponses = []
  phoneNumbers =[]
  userFirstName: String;

  selectedNumber: String

  receiverNameFlag = true;
  senderNameFlag = true;

  activityURL: string;

  file: any;

  loadingPledgeCards = false;

  showLoadedResults = false;
  loadedResults = ""
  unsuccessfulUploads = []
  dev = false

  orgName: String;
  swordForm = {};
  loading = false;
  errors = false;

  parentOrg = "The Community Foundation of Riverside and San Bernardino";

  htcGroups = ["immigrants_refugees",
    "middle_eastern_and_north_africa",
    "homeless_individuals_and_famili",
    "farmworkers",
    "veterans",
    "latinos",
    "asian_americans_pacific_islande",
    "african_americans",
    "native_americans_tribal_communi",
    "children_ages_0_5",
    "lesbian_gay_bisexual_transgende",
    "limited_english_proficient_indi",
    "people_with_disabilities",
    "seniorsolder_adults",
    "low_broadband_subscription_rate"];

  
  nonResponses = []
  selectedScripts; 
  selectedTargets;
  selectedNumbers;

  preselectedNumbers = []

  constructor(public dialogRef: MatDialogRef<ActivityImpressionsSubmitDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public activityService: ActivityService,
              public campaignService: CampaignService,
              public targetService: TargetService,
              public orgService: OrganizationService,
              public petitionService: PetitionService,
              public scriptService: ScriptService,
              private datePipe: DatePipe) {

                this.activity = Object.keys(data.activity).map(key => (data.activity[key]._id));
                this.activityDate = Object.keys(data.activity).map(key => ({[data.activity[key]._id]: data.activity[key].activityMetaData.date}));

                this.mode = data.mode;
              }

  onNoClick(): void {this.dialogRef.close()}

  closeDialog(){this.dialogRef.close()}

  async activitySwordSubmit() {
    var campaignID = parseInt(localStorage.getItem('campaignID'));
    var activityType = localStorage.getItem('activityType');
    var activityID = this.data.activity._id;

    const report = {
      outreach_report: [
        {
          cbo_name: this.orgName,
          parent_organization: this.parentOrg,
          reporter_name: JSON.parse(localStorage.getItem('userProfile')).firstName + " " + JSON.parse(localStorage.getItem('userProfile')).lastName,
          activities: this.swordForm
        }
      ]
    }

    console.log(report)

    await this.activityService.sendTextImpressionsSwordOutreachAPI(campaignID, activityID, activityType, report).subscribe(async apiresults => {
          console.log(apiresults)
          if (apiresults['name'] !== 'Error') {
            this.dialogRef.close(apiresults)
            this.loading = false;
          } else {
            this.errors = true;
          }
        },
        error => {
          console.log(error)
          this.errors = true;
    });
  }

  async activityData() {
    var campaignID = parseInt(localStorage.getItem('campaignID'));
    var orgID = localStorage.getItem('orgID');
    var activityType = localStorage.getItem('activityType');
    var activityID = this.activity;
    this.swordForm = {};

    await this.activityService.activityTextImpressionsSwordOutreachData(campaignID, orgID, activityID, activityType).subscribe(async (result : any) => {

      console.log(result)
      var htcGroups = {}
      var activities = []

      await this.htcGroups.forEach((key, i) => {
        htcGroups[this.htcGroups[i]] = Number(0);
      });

      if(activityType === 'Texting') {
        await result.forEach((key, index) => {
          activities.push({
            activity_type: 'nudgealert',
            activity_address: key['_id'].substring(0, 11),
            primary_organizer: this.orgName,
            date_of_activity: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            activity_end_date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            description: 'Texting',
            total_number_of_impressions: key['impressions'],
            impression_data_accuracy_confid: 'exact',
            total_htc_of_impressions: key['impressions'],
            htc_data_accuracy_confidence: 'exact',
            htc_breakdown_data_confidence: 'exact',
            survey_block_group_GEOID: key['_id'],
            survey_total_strong_yes: 0,
            survey_total_undecided: 0,
            survey_total_strong_no: 0,
          });
          activities[index] = {...activities[index], ...htcGroups};
        });
      }

      this.swordForm = activities;
      await this.activitySwordSubmit();
    });
  }

  async completeActivity() {
    this.loading = true;
    await this.activityData();
  }

  getParentOrg(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.campaignService.getParentOrg(campaignID).subscribe(results =>{
      this.parentOrg = results['parentOrg'];
    })
  }

  getOrgName(){
    var orgID = localStorage.getItem('orgID');
    this.orgService.getOrganization(orgID).subscribe(orgDetail =>{
      this.orgName = orgDetail['name'];
    })
  }

  close(){this.dialogRef.close()}

  ngOnInit(){
    this.activityType = localStorage.getItem('activityType')
    this.userFirstName = JSON.parse(localStorage.getItem('userProfile')).firstName
    this.dev = JSON.parse(localStorage.getItem('userProfile')).user.dev
    this.getParentOrg();
    this.getOrgName();
  }
}
