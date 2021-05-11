import {Component, OnInit, ViewChildren, Inject, QueryList, Injectable, ElementRef, ViewChild, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ScriptService} from '../../services/script/script.service'
import {ParcelService} from '../../services/parcel/parcel.service'
import { Options } from 'ng5-slider'
import { UserService } from '../../services/user/user.service'


@Component({
  templateUrl: './editAsset.html'
})
  
export class EditAssetDialog implements OnInit{

  @ViewChild('locationName' , {static: false}) locationName:ElementRef
  @ViewChild('servicesProvided', {static: false}) servicesProvided:ElementRef
  @ViewChild('ageGroupsFinal', {static: false}) ageGroupsFinal:ElementRef

  @ViewChildren('subGroupServed') subGroupServed:QueryList<any>
  @ViewChildren('hoursOfOpFinal') hoursOfOpFinal:QueryList<any>
  @ViewChild('locationSub', {static: false}) locationSub:ElementRef
  @ViewChild('generalComments', {static: false}) generalComments:ElementRef

  @ViewChild('street', {static: false}) street:ElementRef
  @ViewChild('streetNum', {static: false}) streetNum:ElementRef
  @ViewChild('suffix', {static: false}) suffix:ElementRef
  @ViewChild('city', {static: false}) city:ElementRef
  @ViewChild('county', {static: false}) county:ElementRef;
  @ViewChild('zip', {static: false}) zip:ElementRef


  address1: String
  address2: String
  mode = "";

  ageGroupsSelected = [];
  adaSelected: String;
  languageCapacity = [];
  wifi: String;
  parking: String;
  daysOfOp = []
  locationType: String;
  locationSubType: String
  singleSelection: Object;
  multiSelection = [];
  multiSelectionTime = [];
  groupServed = []
  script: Object;
  userLocation: any;
  ethnicGroupError = false;

  displayMessage = false;
  userMessage = ''
  counties = ['SAN BERNARDINO', 'RIVERSIDE']

  manualRefreshEnabled: boolean = true;
  manualRefresh: EventEmitter<void> = new EventEmitter<void>();


  options: Options = {
    floor: 0,
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
  
  constructor(public dialogRef: MatDialogRef<EditAssetDialog>, 
              @Inject(MAT_DIALOG_DATA) public parcelData: any, 
              private scriptService: ScriptService, 
              public parcelService: ParcelService,
              private userService: UserService) 
  {
    if (parcelData.properties.address){
      this.address1 = parcelData.properties.address.streetNum + " " + parcelData.properties.address.street + " " +  parcelData.properties.address.suffix
      this.address2 = parcelData.properties.address.city + " " + parcelData.properties.address.state + " " + parcelData.properties.address.zip
    }
  }

  onNoClick(): void {this.dialogRef.close()}
  private getSurvey(){
    this.script = this.scriptService.getAssetScript()  
  }

  singleSelected(value){
    this.singleSelection = value;
  }

  multiSelected(value){
    if (!this.multiSelection.includes(value)){
      this.multiSelection.push(value)
    } else {
      for( var i = 0; i < this.multiSelection.length; i++){ 
        if (this.multiSelection[i] === value) {
            this.multiSelection.splice(i, 1); 
        }
      }
    }
  }

  multiSelectedTime(selectedDay){
    var days = this.multiSelectionTime.map(x => x.day);
    if (!days.includes(selectedDay)){
      this.multiSelectionTime.push({day:selectedDay, open: "9", close: "17"})
    } else {
      for( var i = 0; i < this.multiSelectionTime.length; i++){ 
        if (days[i] === selectedDay) {
            this.multiSelectionTime.splice(i, 1); 
        }
      }
    }
  }

  modifyAddress(){
    this.mode = 'EDITPARCEL'
    var address  = this.parcelData.properties.address
    setTimeout(() => {

    if (address.streetNum) this.streetNum.nativeElement.value = address.streetNum
    if (address.street) this.street.nativeElement.value = address.street
    if (address.suffix) this.suffix.nativeElement.value = address.suffix
    if (address.city) this.city.nativeElement.value = address.city
    if (address.county) this.county['value'] = address.county
    if (address.zip) this.zip.nativeElement.value = address.zip

    })

  }

  editAsset(){
    this.mode = "EDITASSET"

    var responses = this.parcelData.properties.asset.idResponses
    var locationName: String;
    var servicesProvided: String;
    var ageGroupsServed: []
    var languageCapacity: []
    var hoursOfOperation: []
    var ada: String
    var wifi: String
    var parking: String;
    var locationType: String;
    var groupServed: []
    var generalComments;
    
    var x: string | number;

    for (x in responses){
      if (responses[x].question === "Location Name") locationName = responses[x].responses;
      if (responses[x].question === "Services Provided") servicesProvided = responses[x].responses;
      if (responses[x].question === "Age Groups Served") ageGroupsServed = responses[x].responses;
      if (responses[x].question === "Language Capacity") languageCapacity = responses[x].responses;
      if (responses[x].question === "ADA Accessible") ada = responses[x].responses;
      if (responses[x].question === "Wifi Available") wifi = responses[x].responses;
      if (responses[x].question === "Parking Type") parking = responses[x].responses;
      if (responses[x].question === "Hours of Operation") hoursOfOperation = responses[x].responses;
      if (responses[x].question === "Location Type") {locationType = responses[x].responses;}
      if (responses[x].question === "Racial/Ethinic Group Served") groupServed = responses[x].responses;
      if (responses[x].question === "General Comments") generalComments = responses[x].responses;
    }

    setTimeout(() => {
      if (locationName) this.locationName.nativeElement.value = locationName
      if (servicesProvided) this.servicesProvided.nativeElement.value = servicesProvided
      if (generalComments) this.generalComments.nativeElement.value = generalComments
      this.ageGroupsSelected = ageGroupsServed
      this.adaSelected = ada

      this.wifi = wifi
      this.parking = parking
      this.languageCapacity = languageCapacity

      if (locationType) {
        this.script[9].responses.forEach(function(element: any) {
          if(element.response === locationType.split(":")[0]){this.singleSelection = element}        
        }, this);
        this.locationType = locationType.split(":")[0]
        if(locationType.split(":")[1]){this.locationSubType = locationType.split(":")[1]}
      }

      if (groupServed){
        var groups = []
        var groupsReformatted = {}

        groupServed.forEach(function(element: any){
          groups.push(Object.keys(element)[0]);
          groupsReformatted[Object.keys(element)[0]] = element[Object.keys(element)[0]]
        });

        this.script[6].responses.forEach(function(element: any) {
          if(groups.includes(element.response)) this.multiSelection.push(element)
        },this)
        
        this.groupServed = groups
        setTimeout(() => {
          this.subGroupServed.forEach(div => {div.value = groupsReformatted[div.placeholder]})
        });
      }

      if(hoursOfOperation){
        var daysOfOp = []

        hoursOfOperation.forEach(function(element: any){
          var day = element.split(":")[0]
          var hours = element.split(":")[1]
          var open = hours.split("-")[0]
          var close = hours.split("-")[1]
          daysOfOp.push(day)
          this.multiSelectionTime.push({day:day, open:open, close:close})
          
        },this)
        this.daysOfOp = daysOfOp 
        
      }
    })
  }

  deleteAsset(){
    this.dialogRef.close({mode: "DELETE"})
  }

  saveAsset(){
    var idResponses = [];

    if(this.locationName.nativeElement.value){
      var question = this.locationName.nativeElement.placeholder
      var answer = this.locationName.nativeElement.value
      var response = {question: question, responses: answer}
      idResponses.push(response)
    }

    if(this.servicesProvided.nativeElement.value){
      var question = this.servicesProvided.nativeElement.placeholder
      var answer = this.servicesProvided.nativeElement.value
      var response = {question: question, responses: answer}
      idResponses.push(response)
    }

    if(this.ageGroupsFinal['value']){
      var question = this.ageGroupsFinal['placeholder']
      var answer = this.ageGroupsFinal['value']
      var response = {question: question, responses: answer}
      idResponses.push(response)
    }

    if(this.adaSelected){
      var adaAnswer = this.adaSelected
      var adaResponse = {question: "ADA Accessible", responses: adaAnswer}
      idResponses.push(adaResponse)
    }

    if(this.parking){
      var parkingAnswer = this.parking
      var parkingResponse = {question: "Parking Type", responses: parkingAnswer}
      idResponses.push(parkingResponse)
    }

    if(this.wifi){
      var wifiAnswer = this.wifi
      var wifiResponse = {question: "Wifi Available", responses: wifiAnswer}
      idResponses.push(wifiResponse)
    }

    if(this.languageCapacity){
      var languageAnswer = this.languageCapacity
      var languageResponse = {question: "Language Capacity", responses: languageAnswer}
      idResponses.push(languageResponse)
    }

    if(this.locationType){
      var locationAnswer = ""
      this.script[9].responses.forEach(function(element: any) {
        if(this.locationType === element.response) {
          if(!element.hasChildren){
            locationAnswer = this.locationType
          }else {
            locationAnswer = this.locationType + ":" + this.locationSubType
          }
        }
      },this)

      var locationResponse = {question: "Location Type", responses: locationAnswer}
      idResponses.push(locationResponse)
    }

    if(this.groupServed.length > 0 ){
      var groupServedResponse = {question: "Racial/Ethinic Group Served", responses: []}
      this.ethnicGroupError = false;


      this.subGroupServed.forEach(div =>{
        var group = {}
        var data = div.value

        if(!data) {
          this.ethnicGroupError = true
          return
        }

        if(data.length === 0) {
          this.ethnicGroupError = true
          return
        }

        if(Array.isArray(data)){

          group[div.placeholder] = data
          groupServedResponse['responses'].push(group)

        } else{
          group[data] = []
          groupServedResponse['responses'].push(group)
        }
      })
      
      idResponses.push(groupServedResponse)
    }

    
    if(this.hoursOfOpFinal.length > 0){
      var multiChildResponseTime = {question: "", responses: []};
      multiChildResponseTime['question'] = "Hours of Operation" 
      
      this.hoursOfOpFinal.forEach(div=>{
        
        var open = div.value
        var close = div.highValue
        var day = div.elementRef.nativeElement.id
        multiChildResponseTime['responses'].push(day + ":" + open + "-" + close)
      })

      idResponses.push(multiChildResponseTime)
   
    }

    if(this.generalComments.nativeElement.value){
      var question = this.generalComments.nativeElement.placeholder
      var answer = this.generalComments.nativeElement.value
      var response = {question: question, responses: answer}
      idResponses.push(response)
    }

    var userID = JSON.parse(localStorage.getItem("userProfile"))['user']['_id']
    
    var assetDetail = { scriptID: "AssetMapper",
                        comment: "Edited by an Admin.",
                        idResponses: idResponses,
                        idBy: userID,
                        locationIdentified: {type: "Point", coordinates: this.userLocation}
                      }

    if(!this.ethnicGroupError){

      this.parcelService.createAsset(assetDetail, this.parcelData.properties).subscribe((savedParcel: any[])=> {
        this.dialogRef.close(savedParcel);
      });      
    }
  }

  saveParcel(){
    var capStreet = this.street.nativeElement.value.toUpperCase();
    var capSuffix = this.suffix.nativeElement.value.toUpperCase();
    var capCity = this.city.nativeElement.value.toUpperCase();
    
    var capCounty = this.county['value']
    
    var address = { streetNum: this.streetNum.nativeElement.value,
                    street: capStreet,
                    suffix: capSuffix,
                    city: capCity,
                    county: capCounty,
                    state: "CA",
                    zip: this.zip.nativeElement.value
                  }

    this.parcelData['address'] = address

    if (
        address.streetNum === '' || 
        address.street === '' || 
        address.city === '' || 
        address.county === '' || 
        address.zip === ''){
  
        this.displayMessage =  true;
        this.userMessage = "Please fill in required fields."

    } else{
      this.parcelService.editParcel(this.parcelData).subscribe( savedParcel =>{
        this.dialogRef.close(savedParcel)
          
      })
    }
  }

  cancel(){this.dialogRef.close()}

  ngAfterViewInit() {}

  ngOnInit() {
    
    this.getSurvey()

    var userLocation = localStorage.getItem('userLocation')
    this.userLocation = [parseFloat(userLocation.split(",")[1]), parseFloat(userLocation.split(",")[0])]
  }
}