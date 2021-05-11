import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList} from '@angular/core';
import { ActivityService} from '../services/activity/activity.service'
import { ScriptService}  from '../services/script/script.service'
import {PersonService} from '../services/person/person.service'
import {TextingService} from '../services/texting/texting.service'

@Component({
  selector: 'app-texting',
  templateUrl: './texting.component.html',
  styleUrls: ['./texting.component.scss']
})
export class TextingComponent implements OnInit {

  activity: Object;
  scripts = []
  scriptIDs = [];
  quickResponses = [];
  people = []
  respondedPeople = [];
  initTextMsg: string;
  sendDisabled = false;
  phoneNums: any;
  selectedPerson: Object;
  textConversation = []
  showErrorMsg = false;
  errorMsg = ""
  idStatus = []
  targetIDs = []
  nonResponses = []

  userPhoneNumber: string;

  identifiedPeople = []

  receiverNameFlag = true;
  senderNameFlag = true;

  userFirstName: string;

  fullDisplayedText: string
  numTextSent: Number;
  numTotalResidents: Number;
  numTextReceived: Number

  numberAvailable = false;
  numPositives: Number;
  numIdentified: Number;
  orgLevel: String
  personCompleted = false;
  sendingText = false;
  loadingPeople = false;

  @ViewChild('inputResponse', {static: false}) inputResponse: ElementRef;
  @ViewChildren('radioAnswers') radioAnswers:QueryList<any>;
  @ViewChildren('textAnswers') textAnswers:QueryList<any>;

  constructor(private activityService: ActivityService, 
              private scriptService: ScriptService, 
              private personService: PersonService,
              private textingService: TextingService) { }

  ngOnInit() {
    this.getActivity();

    this.loadLockedPeople();
    
    this.userFirstName = JSON.parse(localStorage.getItem('userProfile')).firstName
    this.getOrgLevel();
  }

  getActivity(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var activityType = localStorage.getItem('activityType')

    this.activityService.getActivity(campaignID, activityID, activityType).subscribe(activity =>{
      this.activity = activity;
      var scriptIDs = this.activity['activityMetaData'].activityScriptIDs
      this.getActivityScripts(scriptIDs)

      this.quickResponses = this.activity['quickResponses']
      this.nonResponses = this.activity['activityMetaData']['nonResponses']
      this.initTextMsg = this.activity['initTextMsg']
      this.phoneNums = this.activity['phoneNums'];
      this.targetIDs = this.activity['activityMetaData']['targetIDs']

      this.receiverNameFlag = this.activity['sendReceiverName']
      this.senderNameFlag = this.activity['sendSenderName']

      this.numberAvailable = this.allocatePhoneNumber()
    })
  }

  loadLockedPeople(){
    this.loadingPeople = true;

    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')

    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id

    this.textingService.loadLockedPeople(campaignID, activityID, userID).subscribe((people: []) =>{
      this.loadingPeople = false;
      this.people = people
      console.log(people)
      this.sendDisabled = false;
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
        this.textingService.allocatePhoneNumber(userID, activityID, this.phoneNums[j], campaignID).subscribe(result =>{
          console.log(result)
        })
        this.userPhoneNumber = this.phoneNums[j].number
        return true;
      }
    }
    return false;
  }

  lockNewPeople(){

    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID')

    this.textingService.lockNewPeople(campaignID, activityID, userID, this.targetIDs, orgID).subscribe(result =>{
      if(result){
        this.loadLockedPeople()
      }
    })
  }

  sendInitText(person: Object){
    this.sendDisabled = true;
    this.sendingText = true;
    var activityID = localStorage.getItem('activityID')
    var orgID = localStorage.getItem('orgID')

    var fullInitTextMsg = this.initTextMsg

    if(this.senderNameFlag && this.receiverNameFlag){
      fullInitTextMsg = "this is " + this.userFirstName + fullInitTextMsg
    }

    if(this.senderNameFlag && !this.receiverNameFlag){
      fullInitTextMsg = "This is " + this.userFirstName + " " + fullInitTextMsg
    }

    if(this.receiverNameFlag){
      fullInitTextMsg = "Hello " + person['firstName'] + ", " + fullInitTextMsg
    }

    console.log(fullInitTextMsg)

    this.textingService.sendText(person, fullInitTextMsg, activityID, this.userPhoneNumber, orgID).subscribe(result =>{
      if(result){
        setTimeout(() =>{ this.loadLockedPeople(); this.sendingText = false}, 250);
      }
    })
    
  }

  sendFollowUpText(person: Object, message: String){

    if(message === ""){
      this.showErrorMsg = true;
      this.errorMsg = "Response needs an input..."

    } else{

      this.showErrorMsg = false;
      this.errorMsg = ""
      this.sendDisabled = true;
      var activityID = localStorage.getItem('activityID');
      var orgID = localStorage.getItem('orgID')
      console.log(person)
      var sendingPhoneNumber = this.userPhoneNumber

      for(var i = 0; i < person['textContactHistory'].length; i++){
        if(person['textContactHistory'][i].activityID === activityID){
          sendingPhoneNumber = person['textContactHistory'][i]['outgoingPhoneNum']
        }
      }

      this.textingService.sendText(person, message, activityID, sendingPhoneNumber, orgID).subscribe(person =>{
        if(person){
          this.selectPerson(person)
          this.inputResponse.nativeElement.value = ""
          this.sendDisabled = false;
        }
      })
    }
  }

  public onResponseChange(selectedResponse: String){
    this.inputResponse.nativeElement.value = selectedResponse;
    this.showErrorMsg = false;
  }

  getRespondedPeople(){
    this.loadingPeople = true;
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id

    this.textingService.getRespondedPeople(campaignID, activityID, userID, this.orgLevel).subscribe((respondedPeople: []) =>{
      this.loadingPeople = false;
      this.respondedPeople = respondedPeople;
      if(this.selectedPerson){
        this.getConversation(this.selectedPerson)
      }
    })
  }

  getOrgLevel(){
    var userProfile = JSON.parse(localStorage.getItem('userProfile'));

    var orgID = localStorage.getItem('orgID')
    var userOrgs = userProfile['user']['userOrgs']

    for (var i = 0; i< userOrgs.length; i++){
      if(userOrgs[i].orgID === orgID){
        this.orgLevel = userOrgs[i].level
      }
    }
  }


  getIdentifiedPeople(){

    if(this.orgLevel === "ADMINISTRATOR"){
      
      var activityID = localStorage.getItem('activityID')
      this.textingService.getIdentifiedPeople(activityID).subscribe((people: []) =>{
        this.identifiedPeople = people
      })
    }
  }

  getActivityScripts(scriptIDs){
    this.scriptService.getActivityScripts(scriptIDs).subscribe((scripts: []) =>{
      this.scripts = scripts
    })
  }

  getConversation(person: Object){

    this.selectedPerson = person
    this.checkComplete();
    this.textingService.getConversation(person).subscribe(fullPerson =>{
      var activityID = localStorage.getItem('activityID')
      for(var i = 0; i < fullPerson['textContactHistory'].length; i++){
        if(fullPerson['textContactHistory'][i].activityID === activityID){
          this.textConversation = fullPerson['textContactHistory'][i].textConv
        }  
      }
    })
  }

  selectPerson(person: Object){
    this.selectedPerson = person
    this.checkComplete();
    var activityID = localStorage.getItem('activityID')
    
    for(var i = 0; i < this.selectedPerson['textContactHistory'].length; i++ ){
      if(this.selectedPerson['textContactHistory'][i].activityID === activityID){
        this.textConversation = this.selectedPerson['textContactHistory'][i].textConv
      }
    }

    this.getIDStatus();
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
        var response = {question: question, responses: answer, idType: "NEUTRAL"}
        idResponses.push(response)
      }
    });

    return idResponses

  }

  idPerson(){

    var activityID = localStorage.getItem('activityID');
    var campaignID = parseInt(localStorage.getItem('campaignID'));
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID');

    for(var i = 0; i < this.scripts.length; i++){
      var idResponses = this.generateIdResponses(this.scripts[i]);
      this.textingService.idPerson(this.selectedPerson, idResponses, campaignID, activityID, "Texting", this.scripts[i], userID, orgID).subscribe(result =>{
        this.finishIdentification()
       })
      }
    }

  nonResponseId(nonResponse: String){

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
      idHistory.push({scriptID: this.scripts[i]._id,
                      idBy: userID,
                      idResponses: idResponses})
    }

    this.textingService.nonResponse(this.selectedPerson, idHistory, camapignID, activityID, orgID, idType).subscribe(person =>  {
      this.selectedPerson = undefined;
      this.getRespondedPeople()
    })
 
  }

  finishIdentification(){

    var activityID = localStorage.getItem('activityID');
    var activityType = localStorage.getItem('activityType')

    this.personService.finishIdentification(this.selectedPerson, activityID, activityType).subscribe(result=>{
      console.log(result)
      this.selectedPerson = undefined;
      this.getRespondedPeople()
    })
  }

  checkComplete(){
    var activityID = localStorage.getItem('activityID');
    if(this.selectedPerson){
      for(var i = 0; i < this.selectedPerson['textContactHistory'].length; i++){
        if(this.selectedPerson['textContactHistory'][i].activityID === activityID){
          this.personCompleted = this.selectedPerson['textContactHistory'][i].complete
        }
      }
    }
  }

  getIDStatus(){
    
    var idStatus = []

    if(this.selectedPerson['textContactHistory'].length === 0){

    }else{

      var activityID = localStorage.getItem('activityID')
      
      for(var j = 0; j < this.selectedPerson['textContactHistory'].length; j++){
        if(this.selectedPerson['textContactHistory'][j].activityID === activityID){
          for(var k = 0; k < this.selectedPerson['textContactHistory'][j].idHistory.length; k++){
            idStatus.push(this.selectedPerson['textContactHistory'][j].idHistory[k].scriptID)
          }
        }
      }
    }
    
    this.idStatus = idStatus
  }
}
