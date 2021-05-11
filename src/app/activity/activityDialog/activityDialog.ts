import { Component, OnInit, ViewChild, ElementRef, Inject, ViewChildren, QueryList} from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'
import {OrganizationService} from '../../services/organization/organization.service'
import {ActivityService} from '../../services/activity/activity.service'
import {TargetService} from '../../services/target/target.service'
import {ScriptService} from '../../services/script/script.service'
import {PetitionService} from '../../services/petition/petition.service'
import decode from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {DatePipe} from '@angular/common';

@Component({
  templateUrl: './activityDialog.html',
  providers: [DatePipe]
})
  
export class ActivityDialog implements OnInit{
  private API_URL = environment.API_URL;

  targets = []
  targetSelectedID: String;
  displayMessage = false;
  userMessage: String;
  activity: Object;
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

  @ViewChild('activityName', {static: true}) activityName: ElementRef
  @ViewChild('description' , {static: true}) description: ElementRef
  @ViewChild('newNonresponse' , {static: false}) newNonresponse:ElementRef; 
  @ViewChild('initTextMsg' , {static: false}) initTextMsg: ElementRef;
  @ViewChild('newQuickResponse' , {static: false}) newQuickResponse: ElementRef;

  @ViewChild('senderNameActive', {static: false}) senderNameActive: ElementRef;
  @ViewChild('receiverNameActive', {static: false}) receiverNameActive: ElementRef;
  
  nonResponses = []
  selectedScripts; 
  selectedTargets;
  selectedNumbers;

  preselectedNumbers = []

  constructor(public dialogRef: MatDialogRef<ActivityDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public activityService: ActivityService,
              public campaignService: CampaignService,
              public targetService: TargetService,
              public orgService: OrganizationService,
              public petitionService: PetitionService,
              public scriptService: ScriptService,
              private datePipe: DatePipe) {

                this.activity = data.activity;
                this.mode = data.mode;
              }

  onNoClick(): void {this.dialogRef.close()}

  getOrgPhoneNumbers(preselectedNumbers){
    var orgID = localStorage.getItem('orgID')
    var activityType = localStorage.getItem('activityType')

    this.orgService.getOrgPhoneNumbers(orgID).subscribe((phoneNumbers: []) =>{
      if(phoneNumbers){

        var numberValues = preselectedNumbers.map(x => x.number)
        for(var i = 0; i < phoneNumbers.length; i++){
          if(!numberValues.includes(phoneNumbers[i]['phoneNumber'])){
            this.phoneNumbers.push(phoneNumbers[i]['phoneNumber'])
          }
        }

        if (activityType === 'Texting') {
          this.orgService.getOrgPhoneNumbersFilter(orgID, this.phoneNumbers).subscribe((result: any) => {
            if (result.length) {
              const filteredPhoneNumbers = result[0].filteredNums;
              for (var i = 0; i < filteredPhoneNumbers.length; i++) {
                this.phoneNumbers = this.phoneNumbers.filter(function (e) {return e !== filteredPhoneNumbers[i]});
              }
            }
          });
        }

      }
    })
  }

  resetActivity(){
    var activityID = this.data.activity._id
    var activityType = localStorage.getItem('activityType')

    if (confirm('Are you sure you want reset this Activity?')) {
      this.activityService.resetActivity(activityID, activityType).subscribe(result =>{
        console.log(result)
      })
    }
  }

  getOrgTargets(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var orgID = localStorage.getItem('orgID')

    this.targetService.getOrgTargets(campaignID, orgID).subscribe((targets: [])=>{
      for( var i = 0; i < targets.length; i++){
        if(targets[i]['properties']['status'] === "LOCKED"){
          this.targets.push(targets[i])
        }
      }
    }) 
  }

  createActivity(sword){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id

    var activityType = localStorage.getItem('activityType')

    var orgID = localStorage.getItem('orgID')

    if(this.activityName.nativeElement.value === "" || this.selectedScriptIds.length === 0){
      this.displayMessage = true;
      this.userMessage = "The activity needs a name and at least one script."
      return
    } 

    if(activityType != 'Petition' && this.selectedTargetIds.length === 0){
      this.displayMessage = true;
      this.userMessage = "The activity needs a target."
      return
    }


    if((activityType === "Texting" || activityType === "Phonebank") && (this.selectedNumberValues.length === 0)){
      this.displayMessage = true;
      this.userMessage = "The activity needs outgoing phone numbers."
      return
    }

    if(activityType === "Texting" && this.initTextMsg.nativeElement.value === ""){

      this.displayMessage = true;
      this.userMessage = "The Texting Activity needs an initial Text Message."
      return
    }
    
  
    var activityDetail = {activityName: this.activityName.nativeElement.value,
                            activityType: activityType,
                            description: this.description.nativeElement.value,
                            targetIDs: this.selectedTargetIds,
                            campaignID: campaignID,
                            orgID: orgID,
                            createdBy: userID,
                            nonResponses: this.nonResponses,
                            activityScriptIDs: this.selectedScriptIds}

    if(activityType === "Texting"){
      activityDetail['quickResponses'] = this.quickResponses;
      activityDetail['initTextMsg'] = this.initTextMsg.nativeElement.value
      activityDetail['selectedNumbers'] = this.selectedNumberValues
      activityDetail['sendReceiverName'] = this.receiverNameFlag;
      activityDetail['sendSenderName'] = this.senderNameFlag;
      this.senderNameActive['checked'] = this.senderNameFlag;
      this.receiverNameActive['checked'] = this.receiverNameFlag;

    }

    if(activityType === "Phonebank"){
      activityDetail['selectedNumbers'] = this.selectedNumberValues;
    }

    this.activityService.createActivity(activityDetail).subscribe(result => {
      this.displayMessage = false;
      this.dialogRef.close(result)
    })
   
  }

  addQuickResponse(quickResponse: String){
    if(quickResponse === ""){
      console.log("NEEDS AN INPUT...")
    } else{
      if(!this.quickResponses.includes(quickResponse)){
        this.quickResponses.push(quickResponse)
      }
      this.newQuickResponse.nativeElement.value = ""
    }
  }

  removeQuickResponse(quickResponse: String){
    for(var i = 0; i < this.quickResponses.length; i++){
      if(this.quickResponses[i] === quickResponse){
        this.quickResponses.splice(i, 1)
      }
    }
  }

  editActivity(sword){
    var activityID = this.data.activity._id
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityType = localStorage.getItem('activityType')
    var orgID = localStorage.getItem('orgID')

    if(this.activityName.nativeElement.value === ""){
      this.displayMessage = true;
      this.userMessage = "The activity needs a name."

    } else {
      var newActivityDetail = {
                               activityName: this.activityName.nativeElement.value,
                               description: this.description.nativeElement.value,
                               targetIDs: this.selectedTargetIds,
                               nonResponses: this.nonResponses,
                               activityScriptIDs: this.selectedScriptIds
                              }

      if(this.activityType === "Texting"){

        var totalNumbers = this.selectedNumberValues

        newActivityDetail['initTextMsg'] = this.initTextMsg.nativeElement.value;
        newActivityDetail['quickResponses'] = this.quickResponses;
        newActivityDetail['selectedNumbers'] = totalNumbers
        newActivityDetail['sendReceiverName'] = this.receiverNameFlag;
        newActivityDetail['sendSenderName'] = this.senderNameFlag;
      }

      if(this.activityType === "Phonebank"){
        var totalNumbers = this.selectedNumberValues
        newActivityDetail['selectedNumbers'] = totalNumbers
      }

      if(sword){
        this.activityService.editActivity(campaignID, activityID, activityType, newActivityDetail, orgID).subscribe();
        return true;
      } else {
        this.activityService.editActivity(campaignID, activityID, activityType, newActivityDetail, orgID).subscribe(result =>{
          this.dialogRef.close(result);
        });
      }
    }
  }

  prefillActivtyData(){

    this.activityName.nativeElement.value = this.activity['activityMetaData']['name']
    if (this.activity['activityMetaData']['description']) this.description.nativeElement.value = this.activity['activityMetaData']['description']
    this.selectedTargetIds = this.activity['activityMetaData']['targetIDs']
    this.nonResponses = this.activity['activityMetaData']['nonResponses']
    this.selectedScriptIds = this.activity['activityMetaData']['activityScriptIDs']
    this.selectedTargetIds = this.activity['activityMetaData']['targetIDs']

    if(this.activityType === "Texting") {
      this.quickResponses = this.activity['quickResponses'];  
      this.selectedNumber = this.activity['phoneNum']

      this.receiverNameFlag = this.activity['sendReceiverName']
      this.senderNameFlag = this.activity['sendSenderName']
      
      setTimeout(()=>{
        this.initTextMsg.nativeElement.value = this.activity['initTextMsg'];
        this.senderNameActive['checked'] = this.senderNameFlag;
        this.receiverNameActive['checked'] = this.receiverNameFlag;
      })
    }



    if(this.activityType === "Petition"){
      this.activityURL = this.activity['url']
    }

    
    this.selectedScripts = new FormControl(this.selectedScriptIds);
    this.selectedTargets = new FormControl(this.selectedTargetIds)

    if(this.activityType === "Texting" || this.activityType === "Phonebank"){
      this.preselectedNumbers = this.activity['phoneNums']
      this.selectedNumbers = new FormControl(this.selectedNumberValues);
      this.getOrgPhoneNumbers(this.preselectedNumbers)
    }
  }

  deleteActivity(){
    var activityID = this.data.activity._id
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityType = localStorage.getItem('activityType')
    var orgID = localStorage.getItem('orgID')

    if (confirm('Are you sure you want to delete this activity?')) {

      this.activityService.deleteActivity(campaignID, activityID, activityType, orgID).subscribe(result =>{
        this.dialogRef.close(result)
      })
    } 
  }

  addNonresponse(){

    if(this.newNonresponse.nativeElement.value === ""){
      console.log("NEEDS AN INPUT...")

    } else{

      if(!this.nonResponses.includes(this.newNonresponse.nativeElement.value)){
        this.nonResponses.push(this.newNonresponse.nativeElement.value);
      } 
      
      this.newNonresponse.nativeElement.value = "";
    }
  }

  removeNonresponse(response){
    var filteredAry = this.nonResponses.filter(function(e) { return e !== response })
    this.nonResponses = filteredAry;
  }

  getAllScripts(){
    var orgID = localStorage.getItem('orgID')
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.scriptService.getAllScripts(orgID, campaignID).subscribe((scripts: []) =>{
      this.scripts = scripts
    })
  }

  scriptChecked(selectedScripts){
    this.selectedScriptIds = selectedScripts.value
  }

  numberChecked(selectedNumbers){
    this.selectedNumberValues = selectedNumbers.value
  }

  targetChecked(selectedTargets){
    this.selectedTargetIds = selectedTargets.value
  }

  toggleReceiverName(toggle){
    this.receiverNameFlag = !toggle.checked
  }

  toggleSenderName(toggle){
    this.senderNameFlag = !toggle.checked
  }

  closeDialog(){this.dialogRef.close()}

  generateLink(){
    var petitionDetails = {  activityID : this.data.activity._id,
                             campaignID : parseInt(localStorage.getItem('campaignID')),
                             orgID : localStorage.getItem('orgID'),
                          }

    this.petitionService.generateLink(petitionDetails).subscribe(link=>{
      this.activityURL = link['url']
    })
  }

  copyInputMessage(inputElement){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  fileChanged(e) {
    this.file = e.target.files[0];
  }

  upload(){

    if (this.file === undefined){

    } else{

      this.loadingPledgeCards = true;

      var formData = new FormData();
      var orgID = localStorage.getItem('orgID')
      var activityID = this.data.activity._id
      var campaignID = localStorage.getItem('campaignID')
      var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
      var script = this.scripts[0]

      formData.append('file', this.file);
      formData.append('orgID', orgID)
      formData.append('activityID', activityID)
      formData.append('campaignID', campaignID)
      formData.append('userID', userID)
      formData.append('scriptID', script._id)

      this.uploadData(formData);    
    }
  }

  uploadData(formData){
    this.petitionService.uploadPetitions(formData).subscribe(result =>{

      console.log(result)
      this.loadingPledgeCards = false;
      this.showLoadedResults = true;
      this.loadedResults = result['newPeople'] + result['existingPeople'];
    })
  }

  downloadUnseccessful(){
    var data = "firstName,middleName,lastName,phones,emails,address,unit,city,zip\n"

    for(var i = 0; i < this.unsuccessfulUploads.length; i++){
      var addressString = ""

      if(this.unsuccessfulUploads[i].address.prefix) addressString = addressString + this.unsuccessfulUploads[i].address.prefix + " "
      if(this.unsuccessfulUploads[i].address.streetNum) addressString = addressString + this.unsuccessfulUploads[i].address.streetNum +  " "
      if(this.unsuccessfulUploads[i].address.street) addressString = addressString + this.unsuccessfulUploads[i].address.street + " "
      if(this.unsuccessfulUploads[i].address.suffix) addressString = addressString + this.unsuccessfulUploads[i].address.suffix

      data = data + this.unsuccessfulUploads[i].firstName + "," + 
                    this.unsuccessfulUploads[i].middleName+ "," + 
                    this.unsuccessfulUploads[i].lastName + "," +
                    this.unsuccessfulUploads[i].phones + "," + 
                    this.unsuccessfulUploads[i].emails + "," +
                    addressString + "," +
                    this.unsuccessfulUploads[i].address.unit + "," +
                    this.unsuccessfulUploads[i].address.city + "," +
                    this.unsuccessfulUploads[i].address.zip + "\n"
    }

    const blob = new Blob([data], {type: 'text/csv' });
    const url= window.URL.createObjectURL(blob);
       
    window.open(url);
  }

  releaseNumber(number){
    var campaignID = localStorage.getItem('campaignID')
    var activityType = localStorage.getItem('activityType')
    var activityID = this.data.activity._id

    this.activityService.releaseNumber(campaignID, activityID, activityType, number).subscribe(result=>{
      if(result){
        this.preselectedNumbers = result['phoneNums']
        this.getOrgPhoneNumbers(this.preselectedNumbers)
      }
    })
  }

  async activitySwordSubmit() {
    var campaignID = parseInt(localStorage.getItem('campaignID'));
    var activityType = localStorage.getItem('activityType');
    var activityID = this.data.activity._id;

    console.log(this.swordForm)

    if(this.swordForm['length'] > 10000){
      console.log("TOO BIG")

    }

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

    //totalForm.push(subForm)

    var totalForm = []

    await this.activityService.sendSwordOutreachAPI(campaignID, activityID, activityType, report).subscribe(async apiresults => {
          if (apiresults['name'] !== 'Error') {
            console.log(apiresults)
            this.activityService.completeActivity(campaignID, activityID, activityType).subscribe(result => {
              this.dialogRef.close(result)
              this.loading = false;
            });
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
    console.log(orgID)
    var activityType = localStorage.getItem('activityType');
    var activityID = this.data.activity._id;
    console.log(activityID)
    this.swordForm = {};

    await this.activityService.activitySwordOutreachData(campaignID, orgID, activityID, activityType).subscribe(async (result : any) => {

      console.log(result)
      var htcGroups = {}
      var activities = []

      await this.htcGroups.forEach((key, i) => {
        htcGroups[this.htcGroups[i]] = Number(0);
      });

      if(activityType === 'Canvass') {
        await result.forEach((key, index) => {
          activities.push({
            activity_type: 'canvassing',
            activity_address: key['_id'].substring(0, 11),
            primary_organizer: this.orgName,
            date_of_activity: this.datePipe.transform(this.data.activity.activityMetaData.date, 'yyyy-MM-dd'),
            activity_end_date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            total_number_of_impressions: key['impressions'],
            impression_data_accuracy_confid: 'exact',
            total_htc_of_impressions: key['impressions'],
            htc_data_accuracy_confidence: 'exact',
            htc_breakdown_data_confidence: 'exact',
            survey_block_group_GEOID: key['_id'],
            survey_total_strong_yes: key['positive'],
            survey_total_undecided: key['neutral'],
            survey_total_strong_no: key['negative'],
          });
          activities[index] = {...activities[index], ...htcGroups};
        });
      } else if(activityType === 'Petition') {
        await result.forEach((key, index) => {
          activities.push({
            activity_type: 'pledge_cards',
            activity_address: key['_id'].substring(0, 11),
            primary_organizer: this.orgName,
            date_of_activity: this.datePipe.transform(this.data.activity.activityMetaData.date, 'yyyy-MM-dd'),
            activity_end_date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            total_number_of_impressions: key['identified'],
            impression_data_accuracy_confid: 'exact',
            total_htc_of_impressions: key['identified'],
            htc_data_accuracy_confidence: 'exact',
            htc_breakdown_data_confidence: 'exact',
          });
          activities[index] = {...activities[index], ...htcGroups};
        });
      } else if(activityType === 'Phonebank') {
        await result.forEach((key, index) => {
          activities.push({
            activity_type: 'phone_banking',
            activity_address: key['_id'].substring(0, 11),
            primary_organizer: this.orgName,
            date_of_activity: this.datePipe.transform(this.data.activity.activityMetaData.date, 'yyyy-MM-dd'),
            activity_end_date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            total_number_of_impressions: key['impressions'],
            impression_data_accuracy_confid: 'exact',
            total_htc_of_impressions: key['impressions'],
            htc_data_accuracy_confidence: 'exact',
            htc_breakdown_data_confidence: 'exact',
            survey_block_group_GEOID: key['_id'],
            survey_total_strong_yes: key['positive'],
            survey_total_undecided: key['neutral'],
            survey_total_strong_no: key['negative'],
          });
          activities[index] = {...activities[index], ...htcGroups};
        });
      } else if(activityType === 'Texting') {
        await result.forEach((key, index) => {
          activities.push({
            activity_type: 'nudgealert',
            activity_address: key['_id'].substring(0, 11),
            primary_organizer: this.orgName,
            date_of_activity: this.datePipe.transform(this.data.activity.activityMetaData.date, 'yyyy-MM-dd'),
            activity_end_date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            description: 'Texting',
            total_number_of_impressions: key['impressions'],
            impression_data_accuracy_confid: 'exact',
            total_htc_of_impressions: key['impressions'],
            htc_data_accuracy_confidence: 'exact',
            htc_breakdown_data_confidence: 'exact',
            survey_block_group_GEOID: key['_id'],
            survey_total_strong_yes: key['positive'],
            survey_total_undecided: key['neutral'],
            survey_total_strong_no: key['negative'],
          });
          activities[index] = {...activities[index], ...htcGroups};
        });
      }

      this.swordForm = activities;
      await this.activitySwordSubmit();
    });
  }

  async completeActivity() {
    if(!this.editActivity('sword')){
      return false;
    }

    if (confirm('Are you sure you want to submit to sword?')) {
      this.loading = true;
      await this.activityData();
    }
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
    this.getOrgTargets();
    this.getAllScripts();
    this.getParentOrg();
    this.getOrgName();

    if(this.mode === "EDIT"){
      this.prefillActivtyData()
    }
    else{
      this.getOrgPhoneNumbers([])

      this.selectedNumbers = new FormControl()
      this.selectedScripts = new FormControl()
      this.selectedTargets = new FormControl()}
    }
}
