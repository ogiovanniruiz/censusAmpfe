import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'
import {MatPaginator} from '@angular/material';

@Component({
  templateUrl: './joinCreateCampaign.html',
})
  
export class JoinCreateCampaignDialog implements OnInit{

  mode: String;
  displayMessage = false;
  userMessage: String;
  //thirdPartyCheckedFlag = false;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<JoinCreateCampaignDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public campaignService: CampaignService) {
                this.mode = data
              }
  
  onNoClick(): void {this.dialogRef.close()}
  closeDialog(): void{this.dialogRef.close()}

  createCampaign(name: String, description: String){
    var orgID = localStorage.getItem('orgID')
    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    
    this.campaignService.createCampaign(name, description, orgID, userID).subscribe(
      result => {this.dialogRef.close(result)}
    )
  }

  /*
  thirdPartyChecked(checked){
    this.thirdPartyCheckedFlag = checked
  }*/

  requestCampaign(requestedCampaignID: number){
    if(isNaN(requestedCampaignID)){
      this.displayMessage = true;
      this.userMessage = "Campaign ID should be a number.";

    } else{
      this.displayMessage = false;
      this.userMessage = ""

      var orgID = localStorage.getItem('orgID')
      this.campaignService.requestCampaign(orgID, requestedCampaignID).subscribe(
        result => {
          if(result['msg']){
            this.displayMessage = true;
            this.userMessage = result['msg'];
          } else {
            this.mode = "REQUESTSUCCESS"
            this.displayMessage = false;
  
          }
        }
      )
    }
  }

  ngOnInit(){}
} 
