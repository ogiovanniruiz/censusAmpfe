import { Component, OnInit, ViewChild, ElementRef, Inject, ViewChildren, QueryList} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ActivityService} from '../../services/activity/activity.service';

@Component({
  templateUrl: './eventFormDialogCompleted.html'
})

export class EventFormDialogCompleted implements OnInit{

  //PrefIll Event Data
  userName = ""
  cboName = this.data.event.orgCreatorName
  parentOrg = "The Community Foundation of Riverside and San Bernardino"
  dateStart = this.data.event.activityMetaData.endDate
  lat = this.data.event.location.coordinates[1]
  lng = this.data.event.location.coordinates[0]
  address = ""
  address2 = ""
  startTime = ""
  endTime = ""
  eventName = this.data.event.activityMetaData.name

  //Activity Details
  whatWentWell: String;
  improve: String;
  concerns: String;
  numVolunteers: Number;
  selectedActivityType: String;
  notes: String;
  description: String;
  impressions: Number;
  impressConf: String;
  radius: String;


  //Language
  @ViewChildren('languageAnswers') languageAnswers:QueryList<any>;
  langBreakConf: String;
  otherLangInfo: String;

  //HTC
  numHTCImpress: Number;
  htcDataConf: String;
  htcConf: String;
  htcMethod: String;

  //Extra Details
  funding: String;
  website: String;
  facebook: String;
  venueRating:String;
  participEngage: String;

  volunteerHours: Number;
  youtube: String;
  socialMedia: String;
  interactQuality: String;
  effectiveness: String;

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
              ];
  loadedLanguages = [];

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
  loadedHTCGroups = [];

  constructor(public dialogRef: MatDialogRef<EventFormDialogCompleted>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public activityService: ActivityService) {}

  onNoClick(): void {this.dialogRef.close("CLOSED")}

  prefillData(event){
    var firstName = JSON.parse(localStorage.getItem('userProfile')).firstName
    var lastName = JSON.parse(localStorage.getItem('userProfile')).lastName
    this.userName = firstName + " " + lastName

    this.address = this.data.event.address.streetNum + " " + this.data.event.address.street + " " + this.data.event.address.suffix
    this.address2 = this.data.event.address.city + " " + this.data.event.address.state + " " + this.data.event.address.zip

    this.startTime = this.data.event.time.split("-")[0]
    this.endTime = this.data.event.time.split("-")[1]

    if(event.swordForm){
    this.whatWentWell = event.swordForm.what_went_well
    this.improve = event.swordForm.what_could_be_improved
    this.concerns = event.swordForm.audience_questions_concerns
    this.numVolunteers = event.swordForm.total_number_of_paid_staffvolun
    this.selectedActivityType = event.swordForm.activity_type

    this.notes = event.swordForm.additional_notes
    this.description = event.swordForm.description
    this.impressions = event.swordForm.total_number_of_impressions
    this.impressConf = event.swordForm.impression_data_accuracy_confid
    this.radius = event.swordForm.radius

    for(var i = 0; i < this.languages.length; i++){
      var key = "lang_" + this.languages[i]
      if(event.swordForm[key]){
        this.loadedLanguages.push(this.languages[i]+': '+event.swordForm[key])
      }
    }
    this.langBreakConf = event.swordForm.lang_breakdown_data_confidence
    this.otherLangInfo = event.swordForm.lang_other_info


    for(var i = 0; i < this.htcGroups.length; i++){
      if(event.swordForm[this.htcGroups[i]]){
        this.loadedHTCGroups.push(this.htcGroups[i]+': '+event.swordForm[this.htcGroups[i]])
      }
    }
    this.numHTCImpress = event.swordForm.total_htc_of_impressions
    this.htcDataConf = event.swordForm.htc_breakdown_data_confidence
    this.htcConf = event.swordForm.htc_data_accuracy_confidence
    this.htcMethod = event.swordForm.htc_breakdown_methodology

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
    this.website = event.swordForm.activity_website
    this.facebook = event.swordForm.facebook_link
    this.venueRating = event.swordForm.venue_rating
    this.participEngage = event.swordForm.participant_engagement
    this.volunteerHours = event.swordForm.funding_volunteer_hours
    this.youtube = event.swordForm.youtubevideo_link
    this.socialMedia = event.swordForm.activity_social_media_chan
    this.interactQuality = event.swordForm.interaction_quality
    this.effectiveness = event.swordForm.overall_effectiveness
    }
  }

  getEvent(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = this.data.event._id
    var activityType = localStorage.getItem('activityType');

    this.activityService.getActivity(campaignID, activityID, activityType).subscribe(event =>{
      this.prefillData(event)
    })
  }

  closeDialog(){this.dialogRef.close()}

  ngOnInit(){
    this.getEvent();
  }
}
