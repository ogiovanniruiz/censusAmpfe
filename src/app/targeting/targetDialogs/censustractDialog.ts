import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TargetService} from '../../services/target/target.service'
import {OrganizationService} from '../../services/organization/organization.service'
import { ParcelService } from 'src/app/services/parcel/parcel.service';

@Component({
    templateUrl: './censustractDialog.html',
  })
  
  export class CensusTractDialog implements OnInit{

    userOrgs;
    ready = false;
    registeredOrgs = [];
    displayMessage = false;
    userMessage = ""
    locked = false;
    numHouseHolds: Number;
    dataLoaded = true;
    dev = false;
    orgID: String;
    userProfile: Object;
    dataManager = false;
  
    constructor(
        public dialogRef: MatDialogRef<CensusTractDialog>, 
        @Inject(MAT_DIALOG_DATA) public data: any, 
        public targetService: TargetService, 
        public parcelService: ParcelService,
        public orgService: OrganizationService) {
        }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    getUserOrgs(){
      var userProfile = JSON.parse(localStorage.getItem('userProfile'));
      this.dev = userProfile['user']['dev']

      this.orgService.getUserOrgs(userProfile).subscribe(
        (orgs: any[]) => {this.userOrgs = orgs['adminOrgs']}
      )
    }

    getOrgDetails(targets){
      var campaignID = parseInt(localStorage.getItem('campaignID'));
      var thisCampaignTargets = []

      for(var i = 0; i < targets.length; i++){
        if(targets[i].campaignID === campaignID  && targets[i].params.id  === this.data.properties.geoid){
          thisCampaignTargets.push(targets[i])
        }
      }

      for(var i=0; i <thisCampaignTargets.length; i++){
        if (thisCampaignTargets[i].status === "LOCKED") this.locked = true;
        else {
          this.locked = false;
          if( i > thisCampaignTargets.length -2){setTimeout(()=> {this.ready = true})}
        }
        this.orgService.getOrganization(thisCampaignTargets[i].orgID).subscribe(orgDetail =>{
          this.registeredOrgs.push(orgDetail)
        })
      }
    }

    createTarget(){

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
      var orgID = localStorage.getItem('orgID')

      this.displayMessage = false;

      var registeredOrgIds = this.registeredOrgs.map(org => org._id)

      if(registeredOrgIds.includes(orgID)){
        this.userMessage = "This organization has already registered for this target."
        this.displayMessage = true;
      } else {

        this.userMessage = ""
        this.displayMessage = false
        var targetDetail = {campaignID: campaignID, orgID: orgID, tractData: this.data.properties, type: "CENSUSTRACT", userID: userID}
        this.targetService.createTarget(targetDetail).subscribe(target => {
          this.dialogRef.close(target);
        })
      }
      
    }

    removeTarget(orgID){

      var id = this.data.properties.geoid

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      this.targetService.removeTarget(orgID, campaignID, id, "CENSUSTRACT").subscribe(target => {
        this.dialogRef.close(target);
      })
    }

    lockTarget(orgID){
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      this.targetService.lockTarget(orgID, this.data.properties, campaignID).subscribe(target => {
        this.dialogRef.close(target);
      })
    }

    unlockTarget(orgID){
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      this.targetService.unlockTarget(orgID, this.data.properties, campaignID).subscribe(target => {
        this.dialogRef.close(target);
      })

    }

    getAllTargetProperties(){
      var campaignID = parseInt(localStorage.getItem('campaignID'));
      this.targetService.getAllTargetProperties(campaignID).subscribe((targets: [any])=>{
        var targetGeoids = targets.map(target => target.params.id)

        if(targetGeoids.includes(this.data.properties.geoid)){
          this.getOrgDetails(targets);
        }
      })
    }

    getDataManagerStatus(){
      var campaignID = parseInt(localStorage.getItem('campaignID'));
      var dataManagementArray = this.userProfile['user']['dataManager']
  
      for (var i = 0; i< dataManagementArray.length; i++){
        if(dataManagementArray[i] === campaignID ){
          this.dataManager = true;
        }
      }
    }




    ngOnInit(){
      this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
      this.getUserOrgs();
      this.getAllTargetProperties();
      this.getDataManagerStatus();

      this.orgID = localStorage.getItem('orgID')
    }


}