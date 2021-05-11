import { Component, OnInit, ViewChild, ElementRef, Inject, ViewChildren, QueryList} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'

import {OrganizationService} from '../../services/organization/organization.service'
import {ActivityService} from '../../services/activity/activity.service'
import {TargetService} from '../../services/target/target.service'
import {PersonService} from '../../services/person/person.service'
import {FormControl} from '@angular/forms';

@Component({
  templateUrl: './memberDialog.html',
})

export class MemberDialog implements OnInit{

  @ViewChild("firstName", {static: true}) firstName: ElementRef;
  @ViewChild("middleName", {static: true}) middleName: ElementRef;
  @ViewChild("lastName",{static: true}) lastName: ElementRef;
  @ViewChild("phone", {static: true}) phone: ElementRef;
  @ViewChild("email", {static: true}) email: ElementRef;
  @ViewChild("streetNum", {static: true}) streetNum: ElementRef;
  @ViewChild("prefix", {static: true}) prefix: ElementRef;
  @ViewChild("street", {static: true}) street: ElementRef;
  @ViewChild("suffix", {static: true}) suffix: ElementRef;
  @ViewChild("unit", {static: true}) unit: ElementRef;
  @ViewChild("city", {static: true}) city: ElementRef;
  @ViewChild("county", {static: true}) county: ElementRef;
  @ViewChild("party", {static: true}) party: ElementRef;
  @ViewChild("dob", {static: true}) dob: ElementRef;
  @ViewChild("gender", {static: true}) gender: ElementRef;
  @ViewChild("state", {static: true}) state: ElementRef;
  @ViewChild("zip", {static: true}) zip: ElementRef;

  phonebankContactHistory = []
  canvassContactHistory = []
  textContactHistory = []
  petitionContactHistory = []
  personExists = false;
  tags = []

  selectedTags = new FormControl()

  states: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  counties: string[] = ['RIVERSIDE', 'SAN BERNARDINO']


  constructor(public dialogRef: MatDialogRef<MemberDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any,
              public userService: UserService,
              public personService: PersonService,
              public orgService: OrganizationService) {}

  onNoClick(): void {this.dialogRef.close("CLOSED")}

  getOrgTags(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.getOrgTags(orgID).subscribe((result: []) =>{
      this.tags = result
    })
  }

  prefillData(){

    var orgID = localStorage.getItem('orgID')
    this.firstName.nativeElement.value = this.data.person.firstName
    this.lastName.nativeElement.value = this.data.person.lastName
    this.middleName.nativeElement.value = this.data.person.middleName

    this.phone.nativeElement.value = this.data.person.phones
    this.email.nativeElement.value = this.data.person.emails
    
    if(this.data.person.address){
      if(this.data.person.address.streetNum) this.streetNum.nativeElement.value = this.data.person.address.streetNum
      if(this.data.person.address.prefix) this.prefix.nativeElement.value = this.data.person.address.prefix
      if(this.data.person.address.street) this.street.nativeElement.value = this.data.person.address.street
      if(this.data.person.address.suffix) this.suffix.nativeElement.value = this.data.person.address.suffix
      if(this.data.person.address.unit) this.unit.nativeElement.value = this.data.person.address.unit
      if(this.data.person.address.city) this.city.nativeElement.value = this.data.person.address.city
      if(this.data.person.address.county) this.county['value'] = this.data.person.address.county
      if(this.data.person.address.state) this.state['value'] = this.data.person.address.state
      if(this.data.person.address.zip) this.zip.nativeElement.value = this.data.person.address.zip
    }

    for(var i = 0; i < this.data.person.membership.length; i++){
      if(this.data.person.membership[i].orgID === orgID){
        this.selectedTags.setValue(this.data.person.membership[i].tags)
      }
    }

    if(this.data.person.demographics ){

      if(this.data.person.demographics.dob) this.dob.nativeElement.value = this.data.person.demographics.dob
      if(this.data.person.demographics.gender) this.gender['value'] = this.data.person.demographics.gender
    }
    if(this.data.person.voterInfo){

      if(this.data.person.voterInfo.party) this.party.nativeElement.value = this.data.person.voterInfo.party

    }

    if(this.data.person.textContactHistory){
      this.textContactHistory = this.data.person.textContactHistory
    }

    if(this.data.person.phonebankContactHistory.length > 0){
      this.phonebankContactHistory = this.data.person.phonebankContactHistory
    }
    if(this.data.person.canvassContactHistory){
      this.canvassContactHistory = this.data.person.canvassContactHistory
    }
    if(this.data.person.petitionContactHistory){
      this.petitionContactHistory = this.data.person.petitionContactHistory
    }

  }

  savePerson(firstName: String, middleName: String, lastName: String, phone: String, email: String, streetNum: String, prefix: String, street: String, suffix: String, unit: String, city: String, county: String, state: string, zip: string, dob: String, gender: String, party: String){
    var orgID = localStorage.getItem('orgID')
    var newDetail = {firstName: firstName,
                     middleName: middleName,
                     lastName: lastName,
                     phone: phone,
                     email: email,
                     streetNum: streetNum,
                     prefix: prefix,
                     street: street,
                     suffix: suffix,
                     unit: unit,
                     city: city,
                     state: state,
                     zip: zip,
                     tags: this.selectedTags.value,
                     orgID: orgID,
                    
                     county: county,
                     dob: dob,
                     gender: gender,
                     party: party}

    if(this.data.mode === "EDIT"){
      this.personService.editPerson(this.data.person, newDetail).subscribe(result=>{
        console.log(result)
        this.dialogRef.close("CLOSED")
      })
    } else if(this.data.mode === "CREATE"){

      var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']


      var detail = {firstName: firstName,
                    middleName: middleName,
                       lastName: lastName,
                       phones: [phone],
                       emails: [email],
                       address: {
                                  streetNum: streetNum,
                                  prefix: prefix,
                                  street: street,
                                  suffix: suffix,
                                  unit: unit,
                                  city: city,
                                  county: county,
                                  state: state,
                                  zip: zip
                                }
                        ,demographics: {dob: dob,
                                       gender: gender,

                        },voterInfro: { party: party},
                        creationInfo: {regType: "MANUAL", createdBy: userID},
                        membership: [{orgID:  orgID, tags: this.selectedTags.value}]  
                      }

      //detail['membership'] = orgID
/*
      this.personService.createPerson(detail).subscribe(result =>{

        if(result['status'] === "EXISTS"){
          this.personExists = true;
          
        }else if( result['status'] === "NEWPERSON"){
          this.dialogRef.close("CLOSED")
        }
      })

      */
    }

  }

  cancel(){this.dialogRef.close()}

  ngOnInit(){
    if(this.data.mode === "EDIT"){
      this.prefillData();
    }

    this.getOrgTags();
  }
}
