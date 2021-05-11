import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'
import {OrganizationService} from '../../services/organization/organization.service'

@Component({
    templateUrl: './editOrgDialog.html',
})
  
export class EditOrgDialog implements OnInit{

  @ViewChild('editOrgName', {static: true}) editOrgName: ElementRef
  @ViewChild('editOrgDescription', {static: true}) editOrgDescription: ElementRef
  constructor(public dialogRef: MatDialogRef<EditOrgDialog>, 
            @Inject(MAT_DIALOG_DATA) public data: any, 
            public userService: UserService, 
            public campaignService: CampaignService,
            public orgService: OrganizationService) {
            }

  onNoClick(): void {this.dialogRef.close("CLOSED")}

  editOrganization(){
    var orgName = this.editOrgName.nativeElement.value
    var orgDescription = this.editOrgDescription.nativeElement.value
    var orgID = this.data._id

    this.orgService.editOrganization(orgName, orgDescription, orgID).subscribe(result=>{
      this.dialogRef.close(result)
    })
  }

  prefillOrgData(){
    this.editOrgName.nativeElement.value = this.data.name
    this.editOrgDescription.nativeElement.value = this.data.description
  }
  
  return(){this.dialogRef.close("CLOSED")}
  
  ngOnInit(){
    this.prefillOrgData();

  }
} 