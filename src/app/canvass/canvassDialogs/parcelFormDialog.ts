import { Component, OnInit, ViewChildren, ElementRef, Inject, QueryList, ViewChild, Input} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {PersonService} from '../../services/person/person.service'
import {ScriptService} from '../../services/script/script.service'
import {ActivityService} from '../../services/activity/activity.service'
import {ParcelService} from '../../services/parcel/parcel.service'
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { ConnectionService } from 'ng-connection-service';
import {FormControl, NgControlStatus} from '@angular/forms';
import { CanvassService } from '../../services/canvass/canvass.service';
import { StorageMap } from '@ngx-pwa/local-storage';


import * as UUID from 'uuid';
@Component({
  templateUrl: './parcelFormDialog.html',
  styleUrls: ['../canvass.component.scss']
})
  
export class ParcelFormDialog implements OnInit{
  houseHold = []
  scripts = []
  nonResponses = []
  idStatus = []
  userMessage = ""
  showMessage = false
  userLocation: any;
  gridColumns: Number;
  personExists = false;

  unitExists = false;

  complete = []
  showNameError = false; 
  preExistingPeople = []

  connectionError = false;

  addressLoaded = false;
  submittingID = false;
  panelOpenState = false;

  canvassContactHistory = {
    campaignID: parseInt(localStorage.getItem('campaignID')),
    activityID: localStorage.getItem('activityID'),
    orgID: localStorage.getItem('orgID'),
  }

  @ViewChildren('radioAnswers') radioAnswers:QueryList<any>;
  @ViewChildren('textAnswers') textAnswers:QueryList<any>;
  @ViewChild('newFirstName', {static: false}) firstName: ElementRef;
  @ViewChild('newLastName', {static: false}) lastName: ElementRef;
  @ViewChild('newMiddleName', {static: false}) middleName: ElementRef;
  @ViewChild('newPhoneNum', {static: false}) phones: ElementRef;
  @ViewChild('newEmail', {static: false}) emails: ElementRef;
  @ViewChild('unitNumber', {static: false}) unitNumber: ElementRef;
  preferredMethodOfContact = new FormControl();

  address: {streetNum: string, prefix: string, street: string, suffix: string, unit: string,city: string, zip:  string, state: string, location: {}, county: string}

  addressString1: string;
  addressString2: string;

  gridByBreakpoint = {
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 2
  }

  isConnected = this.data.connected
  connectionStatus: string;
  
  constructor(public dialog: MatDialog, 
              public dialogRef: MatDialogRef<ParcelFormDialog>, 
              private observableMedia: MediaObserver,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public personService: PersonService,
              public scriptService: ScriptService,
              public activityService: ActivityService,
              public canvassService: CanvassService,
              private connectionService: ConnectionService,
              private storage: StorageMap,
              public parcelService: ParcelService) {
                
                this.address = this.data.address
                this.nonResponses = this.data.activity.activityMetaData.nonResponses
                
                this.buildAddress();

                if(this.data.connected){this.connectionStatus = "You are online"}
                else{this.connectionStatus = "You are offline"}

                this.connectionService.monitor().subscribe(isConnected => {
                  this.isConnected = isConnected;

                  if(this.isConnected){this.connectionStatus = "You are online"}
                  else{this.connectionStatus = "You are offline"}
                })
                
              }

  buildAddress(){
    if(this.address.streetNum) this.addressString1 = this.address.streetNum
    if(this.address.prefix) this.addressString1 = this.addressString1 + " " + this.address.prefix
    if(this.address.street) this.addressString1 = this.addressString1 + " " + this.address.street
    if(this.address.suffix) this.addressString1 = this.addressString1 + " " + this.address.suffix
    if(this.address.unit) {this.addressString1 = this.addressString1 + " " + this.address.unit;
    this.unitExists = true
  }
    if(this.address.city) this.addressString2 = this.address.city
    if(this.address.state) this.addressString2 = this.addressString2 + " " +  this.address.state
    if(this.address.zip) this.addressString2 = this.addressString2 + " " + this.address.zip
  }

  addUnitNumber(){
    for(var i = 0; i < this.houseHold.length; i++){
      this.canvassService.addUnit(this.houseHold[i], this.unitNumber.nativeElement.value).subscribe(result =>{
        console.log(result)
      })
    }

    this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
      for(var j = 0; j < this.houseHold.length; j++){
        for(var i = 0; i < personDataLayer.length; i++){
          if(personDataLayer[i]['_id'] ===  this.houseHold[j]['_id']){
            personDataLayer[i]['address']['unit'] = this.unitNumber.nativeElement.value
             
          }
          if(personDataLayer[i]['clientID'] ===  this.houseHold[j]['clientID']){
            personDataLayer[i]['address']['unit'] = this.unitNumber.nativeElement.value
            
         }
        }
      }

      this.address.unit = this.unitNumber.nativeElement.value
      this.buildAddress()

      this.storage.set('personDataLayer', personDataLayer).subscribe(() => {});
    })
  }



  reverseGeocode(location){    
    console.log("REVERSE GEOCODING")
    this.canvassService.reverseGeocode(location).subscribe((address: any) =>{

      this.address = address;
      this.addressLoaded = true;
      this.buildAddress();

      this.canvassService.getStoredParcels().subscribe((parcelDataLayer: any[]) =>{

        for(var i = 0; i < parcelDataLayer.length; i++){

          if (parcelDataLayer[i]['properties']['location']['coordinates'][0] === location.coordinates[0] && 
              parcelDataLayer[i]['properties']['location']['coordinates'][1] === location.coordinates[1])
          {
            parcelDataLayer[i].properties.address = this.address
            this.data.address = this.address 
          }
        }
        this.canvassService.storeParcels(parcelDataLayer);
      }) 
          
    })
  }

  close(){this.dialogRef.close()}

  getHouseHold(){
    var residents = []
    this.storage.get('personDataLayer').subscribe((personDataLayer: [])=>{
      for(var i = 0; i < personDataLayer.length; i++){
        if(personDataLayer[i]['address']['streetNum'] === this.address.streetNum && 
           personDataLayer[i]['address']['prefix'] === this.address.prefix && 
           personDataLayer[i]['address']['street'] === this.address.street &&
           personDataLayer[i]['address']['suffix'] === this.address.suffix &&
           personDataLayer[i]['address']['unit'] === this.address.unit
           ){
          residents.push(personDataLayer[i])
        }
      }

      this.submittingID = false;
      
      this.houseHold = residents
      this.getIDStatus(this.houseHold);
    })
  }

  createPerson(){
    this.submittingID = true;

    if(this.firstName.nativeElement.value === "" || this.lastName.nativeElement.value === ""){
      this.showNameError = true;
      setTimeout(() =>{ this.submittingID = false;}, 500);
      return
    }

    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    var activityID = localStorage.getItem('activityID')
    var orgID = localStorage.getItem('orgID')

    let clientID = UUID.v4().toString()

    var newPerson = { 
                      firstName: this.firstName.nativeElement.value,
                      middleName: this.middleName.nativeElement.value, 
                      lastName: this.lastName.nativeElement.value, 
                      phones: this.phones.nativeElement.value, 
                      emails: this.emails.nativeElement.value,
                      address: this.address,
                      creationInfo: {regType: "MANUAL", createdBy: userID},
                      petitionContactHistory: [],
                      phonebankContactHistory: [],
                      canvassContactHistory: [],
                      textContactHistory: [],
                      preferredMethodContact: [],
                      clientID: clientID
                    }

    if(this.preferredMethodOfContact.value){
      for(var i = 0; i< this.preferredMethodOfContact.value.length; i++){
        newPerson.preferredMethodContact.push({method: this.preferredMethodOfContact.value[i], orgID: orgID, optInProof: activityID})
      }
    }

    newPerson.address.location = this.data.location

    this.firstName.nativeElement.value = ""
    this.lastName.nativeElement.value = ""
    this.middleName.nativeElement.value = ""
    this.phones.nativeElement.value = ""
    this.emails.nativeElement.value = ""
    this.preferredMethodOfContact.setValue([])

    this.showNameError = false;

    if(this.isConnected) {
      this.connectionError = false;

      if(this.houseHold.length > 0){
        for(var i = 0; i < this.houseHold.length; i++){

          if(!this.houseHold[i].firstName && !this.houseHold[i].lastName){

            this.canvassService.editPerson(newPerson, this.houseHold[i]).subscribe(result =>{
              this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
                for(var j = 0; j < personDataLayer.length; j++){
                  if(personDataLayer[j].clientID === result['clientID']){
                    personDataLayer[j] = result;
                    break
                  }
                }
                this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
                  this.panelOpenState = false;
                  this.getHouseHold()
                });
              })
            })
           return
          }
        }

      }
      
      this.canvassService.createPerson(newPerson).subscribe(result =>{
        console.log(result)
        if(result['status'] === "NEWPERSON"){
         
          this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
            personDataLayer.push(newPerson)
            this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
              this.panelOpenState = false;
              this.getHouseHold()
            });
          })
        }
      }, error =>{console.log(error)})
      return 
      
 
    } else{
      this.connectionError = true;
    } 
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

  idPerson(person: Object, script: Object){

    this.connectionError = false;
    if(!this.isConnected){
      this.connectionError = true;
      return
    }

    this.submittingID = true;
    var idResponses = this.generateIdResponses();

    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID')
    var locationIdentified = {type: "Point", coordinates: this.userLocation }

    var idHistory = {scriptID: script['_id'],
                     idBy: userID,
                     idResponses: idResponses,
                     locationIdentified: locationIdentified
                    }

    var canvassContactHistory = {
      identified: true,
      campaignID: campaignID,
      activityID: activityID,
      orgID: orgID,
      idHistory: [idHistory]
    }
      
    this.canvassService.idPerson(person, canvassContactHistory).subscribe(result =>  {
      console.log(result)
      this.submittingID = false;

      this.localIdPerson(person, canvassContactHistory)
    })
    this.connectionError = false;
   
    
  }

  localIdPerson(person: Object, canvassContactHistory){
    console.log(canvassContactHistory)

    this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
      for(var i = 0; i < personDataLayer.length; i++){
        if(personDataLayer[i].clientID && person['clientID']){
          if(personDataLayer[i].clientID === person['clientID']){
            if(personDataLayer[i].canvassContactHistory.length === 0){
              personDataLayer[i].canvassContactHistory.push(canvassContactHistory)
              this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
                this.getHouseHold()
              });

            }else{

              var activityExists = false;

              for (var j = 0; j < personDataLayer[i].canvassContactHistory.length; j++){
                if(personDataLayer[i].canvassContactHistory[j].activityID === canvassContactHistory.activityID){
                  
                  personDataLayer[i].canvassContactHistory[j].identified = canvassContactHistory.identified;
                  personDataLayer[i].canvassContactHistory[j].refused = canvassContactHistory.refused;
                  personDataLayer[i].canvassContactHistory[j].nonResponse = canvassContactHistory.nonResponse;
                  personDataLayer[i].canvassContactHistory[j].idHistory.push(canvassContactHistory.idHistory[0])
                  activityExists = true;
                  break
                }
              } 

              if(!activityExists) personDataLayer[i].canvassContactHistory.push(canvassContactHistory)

              this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
                this.getHouseHold()
              });

            }
            break
          }
        }
        
        if(personDataLayer[i]._id && person['_id']){
          if(personDataLayer[i]._id === person['_id'] ){
            if(personDataLayer[i].canvassContactHistory.length === 0){
              personDataLayer[i].canvassContactHistory.push(canvassContactHistory)
              this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
                this.getHouseHold()
              });
  
            }else{
  
              var activityExists = false;
              for (var j = 0; j < personDataLayer[i].canvassContactHistory.length; j++){
                if(personDataLayer[i].canvassContactHistory[j].activityID === canvassContactHistory.activityID){
                  personDataLayer[i].canvassContactHistory[j].identified = canvassContactHistory.identified;
                  personDataLayer[i].canvassContactHistory[j].refused = canvassContactHistory.refused;
                  personDataLayer[i].canvassContactHistory[j].nonResponse = canvassContactHistory.nonResponse;
                  personDataLayer[i].canvassContactHistory[j].idHistory.push(canvassContactHistory.idHistory[0])
                  activityExists = true;
                  break
                }
              } 
              
              if(!activityExists) personDataLayer[i].canvassContactHistory.push(canvassContactHistory)
              
              this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
                this.getHouseHold()
              });
            }
     
            break
          }
        }
      }                     
    })

    return canvassContactHistory
  }

  getIDStatus(houseHold: any[]){

    var campaignID = parseInt(localStorage.getItem('campaignID'))

    var idStatus = []
    for(var i = 0; i < houseHold.length; i++){

      if(houseHold[i].canvassContactHistory.length === 0){
        idStatus.push({personID: houseHold[i]._id, scripts: [], refused: false, nonResponse: false, identified: false})

      }else{

        var activityID = localStorage.getItem('activityID')

        if(houseHold[i]._id) idStatus.push({personID: houseHold[i]._id, scripts: [], refused: false})
        else idStatus.push({ clientID: houseHold[i].clientID, scripts: [],refused: false})
        
        for(var j = 0; j < houseHold[i].canvassContactHistory.length; j++){
          if(houseHold[i].canvassContactHistory[j]){
          if(houseHold[i].canvassContactHistory[j].activityID === activityID){

            if(houseHold[i].canvassContactHistory[j].refused === true){
              idStatus[i].refused = true
            }

            if(houseHold[i].canvassContactHistory[j].nonResponse === true){
              idStatus[i].nonResponse = true
            }

            if(houseHold[i].canvassContactHistory[j].identified === true){
              idStatus[i].identified = true
            }
            
            for(var k = 0; k < houseHold[i].canvassContactHistory[j].idHistory.length; k++){
              idStatus[i].scripts.push(houseHold[i].canvassContactHistory[j].idHistory[k].scriptID)
            }
            
          }
        }
        }

        for(var j = 0; j < houseHold[i].canvassContactHistory.length; j++){
          if(houseHold[i].canvassContactHistory[j]){
            if(houseHold[i].canvassContactHistory[j].activityID === activityID){
              if(houseHold[i].canvassContactHistory[j].identified){
                this.complete.push(true)
              }else{
                this.complete.push(false)
              }
              break
            }
          }
        }
      }
    }
 
    setTimeout(() =>{ this.submittingID = false;}, 500);  
    this.idStatus = idStatus
  }

  nonResponseId(nonResponse: String){
    this.submittingID = true;
    this.connectionError = false;
    if(!this.isConnected){
      this.connectionError = true;
      return
    }

    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var userID = JSON.parse(localStorage.getItem('userProfile')).user._id
    var orgID = localStorage.getItem('orgID')

    var idResponses = [];
    var response = {}

    if(nonResponse === 'REFUSED'){response = {question: "nonResponse", responses: nonResponse, idType: "REFUSED"}} 
    else {response = {question: "nonResponse", responses: nonResponse, idType: "NONRESPONSE"}}
    
    idResponses.push(response)

    var locationIdentified = {type: "Point", coordinates: this.userLocation }

    var idHistory = {idBy: userID, 
                     locationIdentified: locationIdentified,
                     idResponses: idResponses,
                     scriptID: ""
                    }

    var canvassContactHistory = {
       campaignID: campaignID,
       activityID: activityID,
       orgID: orgID,
       idHistory: [idHistory], 
       identified: false,
       refused: false,
       nonResponse: true
    }

    if(nonResponse === 'REFUSED'){canvassContactHistory.refused = true}

    if(this.houseHold.length === 0){
      var address = this.address
      address.location = this.data.location
      this.createBlankPerson(this.address, canvassContactHistory)
    }else{
      var data = {
                  houseHold: this.houseHold,
                  canvassContactHistory: canvassContactHistory,
                  scripts: this.scripts
                }

      this.canvassService.nonResponse(data).subscribe(result=>{
        this.localNonResponse(result)

      })
    }
  }

  localNonResponse(data){   
    this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
      for(var i = 0; i < data.length; i++){
        for(var j = 0; j < personDataLayer.length; j++){
          if(personDataLayer[j].clientID && data[i]['clientID']){
            if(personDataLayer[j].clientID === data[i]['clientID']){
              personDataLayer[j] = data[i]
              break
            }
          }
  
          if(personDataLayer[j]._id && data[i]['_id']){
            if(personDataLayer[j]._id === data[i]['_id'] ){
              personDataLayer[j] = data[i]
              break
            }
          }
        } 
      }

      this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
        this.submittingID = false;
        this.dialogRef.close("SUCCESS");
      });
    })
  }

  createBlankPerson(address, canvassContactHistory){

    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    let clientID = UUID.v4().toString();

    var newPerson = { 
                      address: address,
                      creationInfo: {regType: "MANUAL", createdBy: userID},
                      petitionContactHistory: [],
                      phonebankContactHistory: [],
                      canvassContactHistory: [canvassContactHistory],
                      textContactHistory: [],
                      preferredMethodContact: [],
                      clientID: clientID
                    }

    if(this.isConnected) {
      this.canvassService.createPerson(newPerson).subscribe(result =>{
        console.log(result)
        if(result['status'] === "NEWPERSON"){

          this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
            
            personDataLayer.push(newPerson)
            this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
              this.dialogRef.close(result);
            });
          })

        }
      }, error =>{console.log(error)})

      return  
    }else{
      this.connectionError = true;
    }
  }

  removePerson(person){
    this.canvassService.removePerson(person).subscribe(result =>{
      if(result){
        this.canvassService.getStoredPeople().subscribe((personDataLayer: any) =>{
          for(var i = 0; i < personDataLayer.length; i++){
           
            if(personDataLayer[i]['clientID'] && person.clientID){
              if(personDataLayer[i]['clientID'] === person.clientID){
                personDataLayer.splice(i,1)
                break
              }
            } else if(personDataLayer[i]['_id'] && person._id){
              if(personDataLayer[i]['_id'] === person._id){
                personDataLayer.splice(i,1)
                break
              }
            }
          }
          this.storage.set('personDataLayer', personDataLayer).subscribe(() => {
            this.getHouseHold()
          });
        })
      }else{
        console.log("FAILED")
      }
    })
  }

  getStoredScripts(){ 
    this.canvassService.getStoredScripts().subscribe((scripts: []) =>{
      this.scripts = scripts
    });
  }

  closeCreatePanel(){
    this.panelOpenState = false;
  }

  ngOnInit(){

    if(Object.entries(this.data.address).length === 0 && this.data.address.constructor === Object){
      this.reverseGeocode(this.data.location)
    }else{
      if(this.address.streetNum === '0' || this.address.streetNum === 'None'){
        this.reverseGeocode(this.data.parcelLocation)
      }else{
        this.addressLoaded = true;
        this.getHouseHold();
      }
    }

    this.getStoredScripts();
    
    var userLocation = localStorage.getItem('userLocation')
    this.userLocation = [parseFloat(userLocation.split(",")[1]), parseFloat(userLocation.split(",")[0])]
  }

  ngAfterContentInit() {
    this.observableMedia.media$.subscribe((change: MediaChange) => {
      this.gridColumns = this.gridByBreakpoint[change.mqAlias];
    });
  }

} 