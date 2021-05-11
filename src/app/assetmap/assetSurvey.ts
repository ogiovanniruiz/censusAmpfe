import {Component, OnInit, ViewChildren, Inject, QueryList, Injectable, ElementRef, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ParcelService} from '../services/parcel/parcel.service'
import {ScriptService} from '../services/script/script.service'
import { UserService } from '../services/user/user.service'
import { Options } from 'ng5-slider'



@Component({
  templateUrl: './assetSurvey.html'
})
  
export class AssetSurveyDialog implements OnInit{
  @ViewChildren('textAnswers') textAnswers:QueryList<any>;
  @ViewChildren('singleSelectAnswers') singleSelectAnswers:QueryList<any>;
  @ViewChildren('multiSelectAnswers') multiSelectAnswers:QueryList<any>;
  @ViewChildren('multiSelectAnswersWChildren') multiSelectAnswersChildren:QueryList<any>;
  @ViewChildren('multiSelectAnswersChildrenTIME') multiSelectAnswersChildrenTIME:QueryList<any>;
  @ViewChildren('time') time:QueryList<any>;
  @ViewChildren('radioAnswers') radioAnswers:QueryList<any>;
  @ViewChild('generalComments' , {static: false}) generalComments:ElementRef;

  @ViewChild('streetNum' , {static: false}) streetNum:ElementRef;
  @ViewChild('street' , {static: false}) street:ElementRef;
  @ViewChild('suffix' , {static: false}) suffix:ElementRef;
  @ViewChild('city' , {static: false}) city:ElementRef;
  @ViewChild('county' , {static: false}) county:ElementRef;
  @ViewChild('state' , {static: false}) state:ElementRef;
  @ViewChild('zip' , {static: false}) zip:ElementRef;

  //@ViewChild('owner1' , {static: false}) owner1:ElementRef;
  //@ViewChild('owner2' , {static: false}) owner2:ElementRef;



  address1: String;
  address2: String;
  singleSelection: string;
  multiSelection = [];
  multiSelectionTime = [];
  script: Object;
  createAssetFlag = false;
  displayMessage = false;
  userMessage: string;

  yelpDataAvailable: Boolean;
  loadingYelpData =  false;
  yelpData = [];
  yelpDataSelected: Object;
  userLocation: any;
  ethnicGroupError = false;
  locationNameError = false;

  badAddressFlag = false;

  counties = ['SAN BERNARDINO', 'RIVERSIDE']

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

  constructor(public dialogRef: MatDialogRef<AssetSurveyDialog>, @Inject(MAT_DIALOG_DATA) public parcelData: any, 
                private parcelService: ParcelService,
                private scriptService: ScriptService,
                private userService: UserService) 
  {
    if (parcelData.properties.address){
      this.address1 = parcelData.properties.address.streetNum + " " + parcelData.properties.address.street + " " +  parcelData.properties.address.suffix
      this.address2 = parcelData.properties.address.city + " " + parcelData.properties.address.state + " " + parcelData.properties.address.zip
      this.getYelpAPI(parcelData.properties.location.coordinates[1], parcelData.properties.location.coordinates[0]);
      if (parcelData.properties.address.street === 'null' || parcelData.properties.address.street === null){
        this.badAddressFlag = true
      }
    } else {
      this.address1 = "Latitude: " + parcelData.properties.location.coordinates[1]
      this.address2 = "Longitude: " + parcelData.properties.location.coordinates[0]
      this.createAssetFlag = true;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private getSurvey(){
    this.script = this.scriptService.getAssetScript()
  }

  yelpValue(value: Object){
    this.yelpDataSelected = value;
  }

  enableManualSurvey(){
    this.yelpDataAvailable = false;
  }

  modifyAddress(){
    this.createAssetFlag = true;
  }

  continue(){
    this.createAssetFlag =  false;
    this.yelpDataAvailable = false;

    this.textAnswers.changes.subscribe(c => { c.toArray().forEach(div => {
      
      var services = []

      for(var i = 0; i < this.yelpDataSelected['categories'].length; i++){
        services.push(this.yelpDataSelected['categories'][i].title)
      }

      setTimeout(() => {
        if(div.nativeElement.placeholder === "Location Name"){
          div.nativeElement.value = this.yelpDataSelected['name']
        } 

        if (div.nativeElement.placeholder === "Services Provided"){
          div.nativeElement.value = services
        }
      });

    }) });

  }

  getYelpAPI(lat, lng){
    //this.loadingYelpData =  true;
    this.yelpDataAvailable = false;

    /*
    this.parcelService.pullYelpAPI(lat, lng).subscribe(yelpData => {

      if (yelpData['businesses'].length > 0){
        this.yelpDataAvailable = true;
        this.yelpData = yelpData['businesses']
      } else{
        this.yelpDataAvailable = false;
      }

      this.loadingYelpData =  false;
    })*/
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

  multiSelectedTime(value){
    if (!this.multiSelectionTime.includes(value)) {
      this.multiSelectionTime.push(value)
    } else {
      for (var i = 0; i < this.multiSelectionTime.length; i++){ 
        if (this.multiSelectionTime[i] === value) {
            this.multiSelectionTime.splice(i, 1); 
        }
      }
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

    if(!this.badAddressFlag){
      this.parcelData.properties['address'] = address
      this.parcelData.properties['type'] = "NONRESIDENTIAL"
      this.parcelData.properties['assessorCodes'] = {realUse: "userGenerated", primary: "UG"}
    }else {
      this.parcelData['address'] = address
      this.parcelData['type'] = "NONRESIDENTIAL"
      this.parcelData['assessorCodes'] = {realUse: "userGenerated", primary: "UG"}
    
    
    
    }

    if (
        address.streetNum === '' || 
        address.street === '' || 
        address.city === '' || 
        address.county === '' || 
        address.zip === ''){
  
        this.displayMessage =  true;
        this.userMessage = "Please fill in required fields."

    } else{

      if (this.badAddressFlag){

        this.parcelService.editParcel(this.parcelData).subscribe( savedParcel =>{
          this.address1 = savedParcel.properties.address.streetNum + " " + savedParcel.properties.address.street + " " +  savedParcel.properties.address.suffix
          this.address2 = savedParcel.properties.address.city + " " + savedParcel.properties.address.state + " " + savedParcel.properties.address.zip
          this.createAssetFlag = false
          this.badAddressFlag = false
        })
      
      }else {
        this.parcelService.createParcel(this.parcelData, address).subscribe((savedParcel:any[])=>{this.dialogRef.close(savedParcel)});
      }
    } 
  }

  saveAsset(){
    var idResponses = [];

    this.textAnswers.forEach(div => {
      var question = div.nativeElement.placeholder
      var answer = div.nativeElement.value

      if(question === "Location Name"){
        this.locationNameError = false;
        if(answer === "" || answer === undefined){

          this.locationNameError = true

        }
      }

      if(answer){
        var response = {question: question, responses: answer}
        idResponses.push(response)
      }
    });

    this.singleSelectAnswers.forEach(div => {
      var question = div.placeholder
      var answer = div.value
      if(answer){
        var response = {question: question, responses: answer}
        idResponses.push(response) 
      }
    });

    this.multiSelectAnswers.forEach(div => {
      var question = div.placeholder
      var answer = div.value
      if(answer){
        var response = {question: question, responses: answer}
        idResponses.push(response) 
      }
    });

    if(this.multiSelectAnswersChildren.length > 0){

      var multiChildResponse = {question: "", responses: []};
      this.ethnicGroupError = false;
      this.multiSelectAnswersChildren.forEach(div => {

        multiChildResponse['question'] = div.placeholder
        var answer = {}

        var data = div.value

        if(!data) {
          this.ethnicGroupError = true
          return
        }

        if(data.length === 0) {
          this.ethnicGroupError = true
          return
        }

        if (data[0].includes(":")){
          var group = data[0].split(":")[0]
          var element = data.map(element => element.split(":")[1]);
          
          answer[group] = element
          multiChildResponse['responses'].push(answer)
        } else {
          answer[data] = []
          multiChildResponse['responses'].push(answer)
        }
  
      })

      idResponses.push(multiChildResponse)
    }


    if(this.time.length >0){
      var multiChildResponseTime = {question: "", responses: []};

      this.time.forEach(div =>{

        multiChildResponseTime['question'] = "Hours of Operation"
        var open = div.value
        var close = div.highValue
        var day = div.elementRef.nativeElement.id
        multiChildResponseTime['responses'].push(day + ":" + open + "-" + close)
      })

      idResponses.push(multiChildResponseTime)
    }

    this.radioAnswers.forEach(div => {
        var question = div.name
        var answer = div.viewModel
        if(answer){
          var response = {question: question, responses: answer}
          idResponses.push(response)
        }
    });

    if(this.generalComments.nativeElement.value){
      var response ={question: "General Comments", responses: this.generalComments.nativeElement.value}
      idResponses.push(response)
    }

    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']

    var assetDetail = { scriptID: "AssetMapper",
                        idBy: userID,
                        comment: "Created through UI.",
                        idResponses: idResponses,
                        //locationIdentified: {type: "Point", coordinates: this.userLocation }
                      }

    if(!this.ethnicGroupError && !this.locationNameError){
      this.parcelService.createAsset(assetDetail, this.parcelData.properties).subscribe((savedParcel: any[])=> {
        this.dialogRef.close(savedParcel);
      }); 
    }
    
    
  }

  cancel(){this.dialogRef.close()}
  
  ngAfterViewInit(){}
  
  ngOnInit() {
    this.getSurvey()

    //var userLocation = localStorage.getItem('userLocation')
    //this.userLocation = [parseFloat(userLocation.split(",")[1]), parseFloat(userLocation.split(",")[0])]

  }
}
