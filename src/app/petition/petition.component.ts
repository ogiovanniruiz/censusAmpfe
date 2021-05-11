import { Component, OnInit, ViewChildren, QueryList, ViewChild, ElementRef, ComponentFactoryResolver } from '@angular/core';
import {ActivityService} from '../services/activity/activity.service'
import {ScriptService} from '../services/script/script.service'
import {PersonService} from '../services/person/person.service'
import {FormControl} from '@angular/forms';
import {PetitionService} from '../services/petition/petition.service'
import {OrganizationService} from '../services/organization/organization.service'
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-petition',
  templateUrl: './petition.component.html',
  styleUrls: ['./petition.component.scss']
})
export class PetitionComponent implements OnInit {

  constructor(
              private sanitizer: DomSanitizer,
              private activityService: ActivityService, 
              public scriptService: ScriptService, 
              public personService: PersonService,
              public petitionService: PetitionService,
              public orgService: OrganizationService,
     
              ) {}

  activity: Object;
  scriptIDs = []
  scripts = []
  counties = ['SAN BERNARDINO', 'RIVERSIDE']
  countySelected = [];
  showExisting = false;
  preExistingPeople = []
  preferredMethodOfContact = new FormControl();
  selectedTags = new FormControl()
  showError = false;
  showNameError = false;
  tags = []
  orgLevel: string;
  numSub: Number
  dataLoaded = false;
  petitionName: string;
  file: any;
  image: any;
  loggedIn = false;

  @ViewChildren('radioAnswers') radioAnswers:QueryList<any>;
  @ViewChildren('textAnswers') textAnswers:QueryList<any>;
  @ViewChild('firstName', {static: false}) firstName: ElementRef
  @ViewChild('middleName', {static: false}) middleName: ElementRef
  @ViewChild('lastName', {static: false}) lastName: ElementRef
  @ViewChild('phone', {static: false}) phone: ElementRef
  @ViewChild('email', {static: false}) email: ElementRef
  @ViewChild('address', {static: false}) address: ElementRef
  @ViewChild('unit', {static: false}) unit: ElementRef
  @ViewChild('city', {static: false}) city: ElementRef
  @ViewChild('county', {static: false}) county: ElementRef
  @ViewChild('zip', {static: false}) zip: ElementRef

  getOrgLevel(){
    var orgID = localStorage.getItem('orgID')
    var userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if(userProfile){
      var userOrgs = userProfile['user']['userOrgs']

      for (var i = 0; i< userOrgs.length; i++){
        if(userOrgs[i].orgID === orgID){
          this.orgLevel = userOrgs[i].level
        }
      }
    }
  }

  getNumSub(){
    var activityID = localStorage.getItem('activityID')

    this.petitionService.getNumSub(activityID).subscribe(numSub => {
      console.log(numSub)
      this.numSub = numSub['total']
    })

  }

  getActivity(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')

    this.activityService.getActivity(campaignID, activityID, 'Petition').subscribe(activity =>{
      this.activity = activity
      this.scriptIDs = this.activity['activityMetaData']['activityScriptIDs']
      this.petitionName = this.activity['activityMetaData']['name']
      this.getActivityScripts()
    })
  }

  getActivityScripts(){
    this.scriptService.getActivityScripts(this.scriptIDs).subscribe((scripts: []) =>{
      this.scripts = scripts
      this.dataLoaded = true;
    })
  }
/*
  submitPetition(){
    var userID = "URL";

    if(localStorage.getItem('userProfile')){
      userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    }
    
    this.showError = false;
    this.showNameError = false;

    this.showError = false;
    this.showNameError = false;

    var addressString = this.address.nativeElement.value;
    var zip = this.zip.nativeElement.value;
    var city = this.city.nativeElement.value;
    var county = this.county['value']
    var unit = this.unit.nativeElement.value;

    var newPerson = { 
      firstName: this.firstName.nativeElement.value,
      middleName: this.middleName.nativeElement.value,  
      lastName: this.lastName.nativeElement.value, 
      phones: this.phone.nativeElement.value.replace("(", "").replace(")", "").replace("-","").replace(" ",""), 
      emails: this.email.nativeElement.value,
      creationInfo: {regType: "MANUAL", createdBy: userID}
    }

    if(this.firstName.nativeElement.value === "" || this.lastName.nativeElement.value === ""){
      this.showNameError = true
      return
    } 

    this.petitionService.submitPetition(newPerson, addressString, unit, city, county, zip).subscribe(person =>{

      if(person['status'] === "EXISTS"){
        this.preExistingPeople = person['person']
        this.showExisting = true
      
      }else if (person['status'] === "NEWPERSON"){
        for(var i = 0; i < this.scripts.length; i++){
          console.log(person)
          this.idPerson(person['person'], this.scripts[i])
        }

        this.assignPreferredMethodOfContact(person['person'])
      }   
    })

  }
*/
  createPerson(){
    var userID = "URL";

    if(localStorage.getItem('userProfile')){
      userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    }
    
    this.showError = false;
    this.showNameError = false;

    var addressString = this.address.nativeElement.value;
    var zip = this.zip.nativeElement.value;
    var city = this.city.nativeElement.value;
    var county = this.county['value']
    var unit = this.unit.nativeElement.value;

    var newPerson = { 
                      firstName: this.firstName.nativeElement.value,
                      middleName: this.middleName.nativeElement.value,  
                      lastName: this.lastName.nativeElement.value, 
                      phones: this.phone.nativeElement.value.replace("(", "").replace(")", "").replace("-","").replace(" ",""), 
                      emails: this.email.nativeElement.value,
                      creationInfo: {regType: "MANUAL", createdBy: userID}
                    }

    if(this.firstName.nativeElement.value === "" || this.lastName.nativeElement.value === ""){
      this.showNameError = true
      return
    } 

    this.petitionService.createPerson(newPerson, addressString, unit, city, county, zip).subscribe(person =>{

      if(person['status'] === "EXISTS"){
        this.preExistingPeople = person['person']
        this.showExisting = true
      
      }else if (person['status'] === "NEWPERSON"){
        for(var i = 0; i < this.scripts.length; i++){
          console.log(person)
          this.idPerson(person['person'], this.scripts[i])
        }

        this.assignPreferredMethodOfContact(person['person'])
      }   
    })
  }

  assignPreferredMethodOfContact(person: Object){
    var orgID = localStorage.getItem('orgID')
    var activityID = localStorage.getItem('activityID')
    this.personService.assignPreferredMethodOfContact(person, this.preferredMethodOfContact.value, orgID, activityID).subscribe(result =>{
      console.log(result)
    })
  }

  storeCounty(county){
    this.petitionService.storeCounty(county)
  }

  getCounty(){
    this.petitionService.getCounty().subscribe((county: any)=>{
      if(county != ''){
         this.countySelected = county
      }
    })
  }

  updatePersonData(person: Object){

    var addressString = this.address.nativeElement.value
    var orgID = localStorage.getItem('orgID')

    var newDetail = {firstName: this.firstName.nativeElement.value, 
                     lastName: this.lastName.nativeElement.value,
                     middleName: this.middleName.nativeElement.value, 
                     phone: this.phone.nativeElement.value, 
                     email: this.email.nativeElement.value,
                     address: addressString,
                     city: this.city.nativeElement.value,
                     zip: this.zip.nativeElement.value,
                     orgID: orgID
                    }

    this.petitionService.updatePerson(person, newDetail).subscribe(person =>{


      for(var i = 0; i < this.scripts.length; i++){
        this.idPerson(person, this.scripts[i])
      }

      this.assignPreferredMethodOfContact(person)
 
    })
  }

  idPerson(person: Object, script: Object){

    var userID = "URL";

    if(localStorage.getItem('userProfile')){
      userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    }

    var idResponses = this.generateIdResponses();

    var camapignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var orgID = localStorage.getItem('orgID')

    this.personService.idPerson(person, idResponses, camapignID, activityID, 'Petition', script, userID, orgID).subscribe(person =>  {
      this.finishIdentification(person)
    })
    
  }

  generateIdResponses(): any[]{
    var idResponses = [];

    this.radioAnswers.forEach(div => {
      var question = div.name
      var answer = div.viewModel
      
      if(answer){
        var responses = answer.split(",")[0]
        var idType = answer.split(',')[1]
        var response = {question: question, responses: responses, idType: idType}
        idResponses.push(response)
      }
    });

    this.textAnswers.forEach(div => {
      var question = div.nativeElement.name
      var answer = div.nativeElement.value

      if(answer){
        var response = {question: question, responses: answer, idType: "NONE"}
        idResponses.push(response)
      }
    });

    return idResponses

  }

  finishIdentification(person: Object){
    var activityID = localStorage.getItem('activityID');
    this.personService.finishIdentification(person, activityID, "Petition").subscribe(person=>{
      console.log(person)
      this.clear()
    })
  }

  clear(){
    location.reload();
  }



  getOrgLogo(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.getOrgLogo(orgID).subscribe((data: any)=>{

      if(data){
        var JSONdata = JSON.parse(data)

        let TYPED_ARRAY = new Uint8Array(JSONdata.image.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        this.image = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
      }
    })
  }

  wipePetitions(){
    var activityID = localStorage.getItem('activityID')
    this.petitionService.wipePetitions(activityID).subscribe(result =>{
      console.log(result)
      this.getNumSub()
    })

  }

  ngOnInit() {

    if(localStorage.getItem('userProfile')){
      this.loggedIn = true;
    }
    this.getOrgLevel();
    this.getActivity()
    this.getNumSub();
    this.getCounty();
    this.getOrgLogo();
  }

}
