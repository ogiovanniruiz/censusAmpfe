import { Component, OnInit, ViewChild, ElementRef, Inject, ViewChildren, QueryList} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'

import {OrganizationService} from '../../services/organization/organization.service'
import {ActivityService} from '../../services/activity/activity.service'
import {TargetService} from '../../services/target/target.service'
import {DatePipe} from '@angular/common';


@Component({
  templateUrl: './eventFormDialog.html',
  providers: [DatePipe]
})

export class EventFormDialog implements OnInit{

  //Activity Details
  @ViewChild("whatWentWell", {static: false}) whatWentWell: ElementRef;
  @ViewChild("improve", {static: false}) improve: ElementRef;
  @ViewChild("concerns", {static: false}) concerns: ElementRef;
  @ViewChild("numVolunteers", {static: false}) numVolunteers: ElementRef;

  @ViewChild("notes", {static: false}) notes: ElementRef;
  @ViewChild("description", {static: false}) description: ElementRef;
  @ViewChild("impressions", {static: false}) impressions: ElementRef;
  impressConf: String;
  @ViewChild("radius", {static: false}) radius: ElementRef;

  //Language
  @ViewChildren('languageAnswers') languageAnswers:QueryList<any>;
  langBreakConf: String;
  @ViewChild("otherLangInfo", {static: false}) otherLangInfo: ElementRef;

  //HTC
  @ViewChild("numHTCImpress", {static: false}) numHTCImpress: ElementRef;
  htcConf: String;
  @ViewChildren('htcGroupAnswers') htcGroupAnswers:QueryList<any>;
  htcDataConf: String;
  @ViewChild("htcMethod", {static: false}) htcMethod: ElementRef;

  //Extra Details
  @ViewChild("website", {static: false}) website: ElementRef;
  @ViewChild("facebook", {static: false}) facebook: ElementRef;
  venueRating:String;
  participEngage: String;
  @ViewChild("youtube", {static: false}) youtube: ElementRef;
  @ViewChild('socialMedia', {static: false}) socialMedia:ElementRef;
  interactQuality: String;
  effectiveness: String;
  funding: string
  @ViewChild('volunteerHours', {static: false}) volunteerHours:ElementRef;
  volunteerHoursIsInteger = false;
  selectedActivityType = "Event"

  languages = ["arabic",
               "armenian",
               "assyrian_neo_aramaic",
               "cantonese",
               "chaldean_neo_aramaic",
               "chinese",
               "farsi",
               "filipino",
               "hindi",
               "hmong",
               "iu_mien",
               "japanese",
               "khmer",
               "korean",
               "mandarin",
               "min_nan_chinese",
               "portuguese",
               "punjabi",
               "russian",
               "spanish",
               "tagalog",
               "telugu",
               "thai",
               "ukrainian",
               "vietnamese",
              "ASL"
              ]

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
               "low_broadband_subscription_rate"]

  loadedLanguages = []

  loadedHTCGroups = []

  dateStart = this.data.event.activityMetaData.endDate
  activityType = "Event"
  cboName = this.data.event.orgCreatorName
  lat = this.data.event.location.coordinates[1]
  lng = this.data.event.location.coordinates[0]
  eventName = this.data.event.activityMetaData.name
  userName = ""
  address = ""
  address2 = ""
  startTime = ""
  endTime = ""
  parentOrg = "The Community Foundation of Riverside and San Bernardino"
  mode = this.data.mode;
  ready = false;
  event;
  submitDisabled = true;
  loading = false;
  errors = false;

  constructor(public dialogRef: MatDialogRef<EventFormDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public userService: UserService,
              public activityService: ActivityService,
              public campaignService: CampaignService,
              public targetService: TargetService,
              public orgService: OrganizationService,
              private datePipe: DatePipe) {}

  onNoClick(): void {this.dialogRef.close("CLOSED")}

  addLanguage(language: String){


    if(!this.loadedLanguages.includes(language)){
      this.loadedLanguages.push(language)
    }
  }

  removeLanguage(language: String){
    for(var i = 0; i < this.loadedLanguages.length; i++){
      if(this.loadedLanguages[i] === language){
        this.loadedLanguages.splice(i, 1)
      }
    }
  }

  addHTCGroup(group: String){
    if(!this.loadedHTCGroups.includes(group)){
      this.loadedHTCGroups.push(group)
    }
  }

  removeHTCGroup(group: String){
    for(var i = 0; i < this.loadedHTCGroups.length; i++){
      if(this.loadedHTCGroups[i] === group){
        this.loadedHTCGroups.splice(i, 1)
      }
    }
  }

  prefillData(event){
    var firstName = JSON.parse(localStorage.getItem('userProfile')).firstName
    var lastName = JSON.parse(localStorage.getItem('userProfile')).lastName
    this.userName = firstName + " " + lastName

    this.address = this.data.event.address.streetNum + " " + this.data.event.address.street + " " + this.data.event.address.suffix
    this.address2 = this.data.event.address.city + " " + this.data.event.address.state + " " + this.data.event.address.zip

    this.startTime = this.data.event.time.split("-")[0]
    this.endTime = this.data.event.time.split("-")[1]


    if(event.swordForm){
      

    this.selectedActivityType = event.swordForm.activity_type

    this.whatWentWell.nativeElement.value = event.swordForm.what_went_well
    this.improve.nativeElement.value = event.swordForm.what_could_be_improved
    this.concerns.nativeElement.value = event.swordForm.audience_questions_concerns
    this.numVolunteers.nativeElement.value = event.swordForm.total_number_of_paid_staffvolun

    this.notes.nativeElement.value = event.swordForm.additional_notes
    this.description.nativeElement.value = event.swordForm.description
    this.impressions.nativeElement.value = event.swordForm.total_number_of_impressions
    this.impressConf = event.swordForm.impression_data_accuracy_confid ? event.swordForm.impression_data_accuracy_confid : 'exact'
    if(event.swordForm.radius) this.radius.nativeElement.value = event.swordForm.radius
    

    this.langBreakConf = event.swordForm.lang_breakdown_data_confidence
    this.otherLangInfo.nativeElement.value = event.swordForm.lang_other_info

    this.numHTCImpress.nativeElement.value = event.swordForm.total_htc_of_impressions
    this.htcConf = event.swordForm.htc_data_accuracy_confidence ? event.swordForm.htc_data_accuracy_confidence : 'exact'
    this.htcDataConf = event.swordForm.htc_breakdown_data_confidence ? event.swordForm.htc_breakdown_data_confidence : 'exact'
    this.htcMethod.nativeElement.value = event.swordForm.htc_breakdown_methodology

    this.website.nativeElement.value = event.swordForm.activity_website
    this.facebook.nativeElement.value = event.swordForm.facebook_link
    this.venueRating = event.swordForm.venue_rating
    this.participEngage = event.swordForm.participant_engagement
    this.youtube.nativeElement.value = event.swordForm.youtubevideo_link
    this.socialMedia.nativeElement.value = event.swordForm.activity_social_media_chan
    this.interactQuality = event.swordForm.interaction_quality
    this.effectiveness = event.swordForm.overall_effectiveness
    this.volunteerHours.nativeElement.value = event.swordForm.funding_volunteer_hours

    if(event.swordForm.funding_county_direct){
      this.funding = "funding_county_direct"
     } else if(event.swordForm.funding_state_allocated){
       this.funding = "funding_state_allocated"

     } else if (event.swordForm.funding_acbo_direct){
       this.funding = "funding_acbo_direct"

     } else if(event.swordForm.funding_foundation){
       this.funding = "funding_foundation"
     } else if(event.swordForm.funding_private){
       this.funding = "funding_private"
     }

     for(var i = 0; i < this.languages.length; i++){
       var key = "lang_" + this.languages[i]
       if(event.swordForm[key]){
         this.loadedLanguages.push(this.languages[i])
       }
     }

     setTimeout(()=>{
       this.languageAnswers.forEach((div) => {
         var key = "lang_" + div.nativeElement.placeholder
         div.nativeElement.value = event.swordForm[key]
       });
     })

     for(var i = 0; i < this.htcGroups.length; i++){
       if(event.swordForm[this.htcGroups[i]]){
         this.loadedHTCGroups.push(this.htcGroups[i])
       }
     }

     setTimeout(()=>{
       this.htcGroupAnswers.forEach((div) => {
         div.nativeElement.value = event.swordForm[div.nativeElement.placeholder]
       });
     })

    } else {
      this.impressConf = 'exact';
      this.htcDataConf = 'exact';
      this.htcConf = 'exact';
    }

    if(this.mode === 'COMPLETE'){
      this.completeEventCheck()
    }

  }

  eventData(){
    var swordForm = {

      reporter_name: this.userName,
      cbo_name: this.cboName,
      parent_organization: this.parentOrg,

      //activity_type: this.activityType,
      activity_type: this.selectedActivityType,
      date_of_activity: this.datePipe.transform(this.dateStart, 'yyyy-MM-dd'),
      activity_end_date: this.datePipe.transform(this.dateStart, 'yyyy-MM-dd'),

      activity_lat: this.lat.toString(),
      activity_long: this.lng.toString(),
      activity_address: this.address + " " + this.address2,

      start_time: this.startTime,
      end_time: this.endTime,

      event_name: this.eventName,

      what_went_well:this.whatWentWell.nativeElement.value,
      what_could_be_improved:this.improve.nativeElement.value,
      audience_questions_concerns:this.concerns.nativeElement.value,
      total_number_of_paid_staffvolun:Number(this.numVolunteers.nativeElement.value),

      primary_organizer: this.cboName,

      additional_notes:this.notes.nativeElement.value,
      description:this.description.nativeElement.value,
      total_number_of_impressions: Number(this.impressions.nativeElement.value),
      impression_data_accuracy_confid:this.impressConf,
      radius:this.radius.nativeElement.value,

      lang_breakdown_data_confidence:this.langBreakConf,
      lang_other_info:this.otherLangInfo.nativeElement.value,

      total_htc_of_impressions:Number(this.numHTCImpress.nativeElement.value),
      htc_data_accuracy_confidence:this.htcConf,
      htc_breakdown_data_confidence:this.htcDataConf,
      htc_breakdown_methodology:this.htcMethod.nativeElement.value,

      activity_website:this.website.nativeElement.value,
      facebook_link:this.facebook.nativeElement.value,
      venue_rating: this.venueRating,
      participant_engagement:this.participEngage,
      youtubevideo_link:this.youtube.nativeElement.value,
      activity_social_media_chan: this.socialMedia.nativeElement.value,
      interaction_quality:this.interactQuality,
      overall_effectiveness:this.effectiveness,
      funding_volunteer_hours: Number(this.volunteerHours.nativeElement.value)
    }

    this.languageAnswers.forEach(div => {
      var question = "lang_" + div.nativeElement.placeholder
      var answer = div.nativeElement.value
      if(answer){
        swordForm[question] = Number(answer)
      }
    });

    this.htcGroupAnswers.forEach(div => {
      var question = div.nativeElement.placeholder
      var answer = div.nativeElement.value
      if(answer){
        swordForm[question] = Number(answer)
      }
    });

    if(this.funding){
      swordForm[this.funding] = true
    }

    if(swordForm.interaction_quality){
      swordForm.interaction_quality = swordForm.interaction_quality.toString()
    }

    for (let i = 0; i < this.htcGroups.length; i++) {
      let name = this.htcGroups[i]
      if(swordForm[name] === undefined) {
        swordForm[name] = Number(0);
      }
    }

    return swordForm
  }

  async editEvent() {
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = this.data.event._id
    var orgID = localStorage.getItem('orgID')
    const swordForm = await this.eventData()

    this.activityService.editActivity(campaignID, activityID, this.activityType, swordForm, orgID).subscribe(result =>{
      this.dialogRef.close(result)
    })
  }

  async completeEventCheck() {
    const swordForm = await this.eventData()
    if(swordForm.impression_data_accuracy_confid &&
       swordForm.htc_data_accuracy_confidence &&
       swordForm.htc_breakdown_data_confidence){
      this.submitDisabled = false;
    }
  }

  async completeEvent() {
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = this.data.event._id
    var orgID = localStorage.getItem('orgID')
    const swordForm = await this.eventData()

    this.activityService.editActivity(campaignID, activityID, this.activityType, swordForm, orgID).subscribe(result =>{})
    this.loading = true;

    const resultReport = await swordForm
    const report = {
      outreach_report: [
        {
          cbo_name: resultReport.cbo_name,
          parent_organization: resultReport.parent_organization,
          reporter_name: resultReport.reporter_name,
          activities: [
            swordForm
          ]
        }
      ]
    }

    report.outreach_report[0].activities[0].activity_type = await report.outreach_report[0].activities[0].activity_type.toLowerCase();
    if (report.outreach_report[0].activities[0].radius){
      report.outreach_report[0].activities[0].description = await report.outreach_report[0].activities[0].description + ' [Radius: ' + report.outreach_report[0].activities[0].radius + ']';
    }

    delete report.outreach_report[0].activities[0].cbo_name;
    delete report.outreach_report[0].activities[0].parent_organization;
    delete report.outreach_report[0].activities[0].reporter_name;
    delete report.outreach_report[0].activities[0].radius;

    await this.activityService.sendSwordOutreachAPI(campaignID, activityID, this.activityType, report).subscribe(async apiresults => {
      console.log(apiresults)
      if (apiresults['name'] !== 'Error') {
        this.activityService.completeActivity(campaignID, activityID, this.activityType).subscribe(result => {
          this.dialogRef.close(result)
          this.loading = false;
        });
      } else {
        this.errors = true;
      }
    },
    error => {
    this.errors = true;
    });

    
  }

  getEvent(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = this.data.event._id
    var activityType = localStorage.getItem('activityType');

    this.activityService.getActivity(campaignID, activityID, activityType).subscribe(event =>{
      this.prefillData(event)
    })
  }

  getParentOrg(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.campaignService.getParentOrg(campaignID).subscribe(results =>{
      this.parentOrg = results['parentOrg']
    })
  }

  closeDialog(){this.dialogRef.close()}

  ngOnInit(){
    this.getParentOrg()
    this.getEvent();
  }
}
