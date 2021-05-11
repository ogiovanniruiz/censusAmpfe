import { Component, OnInit, ViewChildren, QueryList} from '@angular/core';
import {ActivityService} from '../services/activity/activity.service'
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import {PhonebankService} from '../services/phonebank/phonebank.service'
import {ScriptService} from '../services/script/script.service'
import {PersonService} from '../services/person/person.service'
import { PlatformLocation } from '@angular/common'
import {ContactFormDialog} from '../settings/contactForm'
import {MatDialog} from '@angular/material';
declare const Twilio: any;

@Component({
  selector: 'app-phonebank',
  templateUrl: './phonebank.component.html',
  styleUrls: ['./phonebank.component.scss']
})
export class PhonebankComponent implements OnInit {

  activity: Object;
  nonResponses = []
  targetIDs = []
  gridColumns: Number;
  houseHold: any;
  idStatus = []
  scripts = []
  scriptIDs = []
  phoneNum: String;
  inCall = false;
  showMessage = false;
  selectedPerson: Object;
  numberAvailable = false;

  userPhoneNumber: string;
  phoneNums: any;
  expanded: number = -1;
  needsResponses = false;
  status = "Loading Phonebank..."
  errorMessage;
  loading = true;

  @ViewChildren('radioAnswers') radioAnswers:QueryList<any>;
  @ViewChildren('textAnswers') textAnswers:QueryList<any>;

  gridByBreakpoint = {
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 2
  }

  constructor(public personService: PersonService, 
              private activityService: ActivityService,
              private observableMedia: MediaObserver, 
              public dialog: MatDialog,
              private phonebankService: PhonebankService, 
              public scriptService: ScriptService,location: PlatformLocation) { 

                location.onPopState(() => {
                  Twilio.Device.destroy();
                });
              }

  getActivity(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var activityType = localStorage.getItem('activityType')

    this.activityService.getActivity(campaignID, activityID, activityType).subscribe(activity =>{
      if(activity){
        
        this.activity = activity
        this.nonResponses = this.activity['activityMetaData']['nonResponses'];
        this.targetIDs = this.activity['activityMetaData']['targetIDs']
        this.scriptIDs = this.activity['activityMetaData']['activityScriptIDs']
        this.phoneNums = this.activity['phoneNums'];
        this.getActivityScripts()
        this.numberAvailable = this.allocatePhoneNumber()
        if(!this.numberAvailable){
          this.status = "No Outgoing Phone Numbers Allocated. Admin should allocate more numbers."
          this.loading = false;
        }else{
          this.getTwilioToken()
          this.loadLockedHouseHold();
        }
      }else{
        this.status = "No Activity Available due to an unknow error."
        this.errorMessage = "FAILED TO FETCH ACTIVITY."
      }
    }, error=>{
      this.errorMessage = "FAILED TO FETCH ACTIVITY."
      console.log(error)
    })
  }

  allocatePhoneNumber(): boolean {
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id

    for(var i = 0; i < this.phoneNums.length; i++){
      if(this.phoneNums[i].userID ===  userID){
        this.userPhoneNumber = this.phoneNums[i].number
        return true;
      }
    }

    for( var j = 0; j < this.phoneNums.length; j++){
      if(this.phoneNums[j].available === true){
        this.phonebankService.allocatePhoneNumber(userID, activityID, this.phoneNums[j], campaignID).subscribe(result =>{
          console.log("PHONENUMBERS ALLOCATED")
        
        })
        this.userPhoneNumber = this.phoneNums[j].number
        return true;
      }
    }
    return false;
  }

  public getTwilioToken(){
    this.status = "Fetching Calling Token..."
    Twilio.Device.destroy()
    var orgID = localStorage.getItem('orgID')

    this.phonebankService.getTwilioToken(orgID).subscribe(result=>{
      var token = result['token'];
      Twilio.Device.setup(token);

      Twilio.Device.ready(function() {
        this.errorMessage = "Calling Token Ready."
        this.status = "Calling Token Ready."
        console.log("READY")
      });

    })
  }

  loadLockedHouseHold(){
    this.status = "Loading Household..."
    this.houseHold = null
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')

    this.phonebankService.getLockedHouseHold(userID, campaignID, activityID).subscribe(houseHold =>{
      console.log(houseHold)

      if(houseHold['length'] > 0){
        this.loading = false;
        this.status = null
        this.houseHold = houseHold;
      }else{
        this.lockNewHousehold()
      }
    }, error=>{
      console.log(error)
      this.errorMessage = "FAILED TO LOAD THE HOUSEHOLD."
    })
  }

  lockNewHousehold(){
    this.status = "No house loaded, locking a new household..."
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    console.log(activityID)
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID')

    this.phonebankService.lockHouseHold(campaignID, activityID, userID, this.targetIDs, orgID).subscribe(lockedPeople =>{
      if(lockedPeople['status'] === true){
        this.loadLockedHouseHold();
      }else{
        this.status = "All members of this list have been contacted."
        this.loading = false;
      }
    }, error=>{
      console.log(error)
      console.log("THERE WAS AN ERROR LOCKING THE HOUSEHOLD.")
    }) 
  }

  generateIdResponses(script): any[]{
    var idResponses = [];

    var questions = script.questions.map(x => {return x.question})

    this.radioAnswers.forEach(div => {
      var question = div.name
      var answer = div.viewModel
      
      if(answer && questions.includes(question)){
        var responses = answer.split(",")[0]
        var idType = answer.split(',')[1]
        var response = {question: question, responses: responses, idType: idType}
        idResponses.push(response)
      }
    });

    this.textAnswers.forEach(div => {
      var question = div.nativeElement.name
      var answer = div.nativeElement.value

      if(answer && questions.includes(question)){
        var response = {question: question, responses: answer, idType: "NONE"}
        idResponses.push(response)
      }
    });

    return idResponses
  }

  idPerson(person: Object){
    
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID')
    var camapignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')

    var idHistory = []

    for(var i = 0; i < this.scripts.length; i++){
      var idResponses = this.generateIdResponses(this.scripts[i]);
      if(idResponses.length > 0){
        idHistory.push({scriptID: this.scripts[i]._id,
          idBy: userID,
          idResponses: idResponses})    
      }
    }

    if(idHistory.length === 0){
      this.needsResponses = true;
    }else{
      this.loading = true;
      this.needsResponses = false;
      this.phonebankService.idPerson(person, idHistory, camapignID, activityID, userID, orgID, this.houseHold).subscribe(result =>  {
        console.log(result)
        if(result['status']){
          this.loadLockedHouseHold();
        }else{
          this.status = "Failed to update record due to an unknown error."
          this.errorMessage = "THERE WAS AN ERROR SENDING THE RESPONSE."

        }
      }, error=> {
        console.log(error)
        this.errorMessage = "THERE WAS AN ERROR SENDING THE RESPONSE."
      })
    }
  }

  nonResponseId(nonResponse: String){
    this.loading = true;

    var camapignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID')
    
    var idResponses = [];

    var response = {}
    var idType = ''

    if(nonResponse === 'REFUSED'){
      idType = 'REFUSED'
      response = {question: "nonResponse", responses: nonResponse, idType: "REFUSED"}
    } else{
      idType = 'NONRESPONSE'
      response = {question: "nonResponse", responses: nonResponse, idType: "NONRESPONSE"}
    }

    idResponses.push(response)

    var idHistory = []

    for(var i = 0; i < this.scripts.length; i++){
      if(idResponses.length > 0){
        idHistory.push({scriptID: this.scripts[i]._id,
          idBy: userID,
          idResponses: idResponses})    
      }
    }

    this.phonebankService.nonResponse(this.houseHold, idHistory, camapignID, activityID, orgID, idType).subscribe(result =>  {
      console.log(result)
      if(result['status']){
        this.loadLockedHouseHold();
      }else{
        this.status = "Failed to update record due to an unknown error."
        this.errorMessage = "THERE WAS AN ERROR SENDING THE RESPONSE."

      }
    }, error =>{
      console.log(error)
      this.errorMessage = "THERE WAS AN ERROR SENDING THE RESPONSE."
    })
  }

  getActivityScripts(){
    this.scriptService.getActivityScripts(this.scriptIDs).subscribe((scripts: []) =>{
      this.scripts = scripts
    })
  }

  call(person: Object){
    
    Twilio.Device.connect({number: person['phones'], origin: this.userPhoneNumber});
    this.inCall = true;

    Twilio.Device.connect(function(){
      console.log("CONNECTED");
      this.errorMessage = "Connected"
    }); 

    Twilio.Device.error(function(error){
      console.log(error);
      this.errorMessage = "CALL FAILURE"
      console.log("ERROR");
    });

    Twilio.Device.disconnect(function() {
      console.log("DISCONNECTED");
      this.errorMessage = "Disconnected"
    });
  }

  endCall(){
    this.inCall = false;
    Twilio.Device.disconnectAll();
  }

  ngOnInit(){
    this.getActivity()
  }

  openContactDialog(): void {
    var activityID = localStorage.getItem('activityID');
    this.dialog.open(ContactFormDialog, {width: '95%', data: {houseHold: this.houseHold, activityID: activityID}});
  }

  ngAfterContentInit() {
    this.observableMedia.media$.subscribe((change: MediaChange) => {
      this.gridColumns = this.gridByBreakpoint[change.mqAlias];
    });
  }

}
