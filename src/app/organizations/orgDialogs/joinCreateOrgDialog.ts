import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'
import {MatPaginator} from '@angular/material';
import {OrganizationService} from '../../services/organization/organization.service'
import {MatTableDataSource} from '@angular/material/table';
import {CensustractService} from '../../services/censustract/censustract.service'

@Component({
    templateUrl: './joinCreateOrgDialog.html',
})
  
export class JoinCreateOrgDialog implements OnInit{

    displayedColumns: string[] = ['name', 'actions'];
    dataSource;

    file: any;
    showErrorMsg = false;
    errorMsg = '';
    uploading = false;

    applyFilter(filterValue: string) {
      if (filterValue.length > 1){
        this.getAllOrgs(filterValue);
      } else{
        this.dataSource = undefined
      }
    }

    orgSelected: Object;

    displayMessage = false;
    userMessage: String;
    isDev = false;
    mode = ""
    
    @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

    constructor(private censustractService: CensustractService, public dialogRef: MatDialogRef<JoinCreateOrgDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public campaignService: CampaignService,
              public orgService: OrganizationService) {

              this.mode = data

              }
  
    onNoClick(): void {this.dialogRef.close("CLOSED")}

    closeSettings(){this.dialogRef.close("CLOSED")}

    getAllOrgs(filterValue){
      var userProfile = JSON.parse(localStorage.getItem('userProfile'));
      this.orgService.getAllOrgs(userProfile).subscribe(
          (orgs: any[]) => {
            this.dataSource = new MatTableDataSource(orgs);
            this.dataSource.filter = filterValue.trim().toLowerCase();
          }
      )
    }

    createOrganization(name: String, description: String){
      var userProfile = JSON.parse(localStorage.getItem('userProfile'));
      var userID = userProfile.user._id

      this.orgService.createOrganization(name, description, userID).subscribe(
        result => {
          this.dialogRef.close(result)
        }
      )
    }
    
    sendOrgRequest(requestedOrgID: String){
      var userProfile = JSON.parse(localStorage.getItem('userProfile'));
      var userID = userProfile.user._id

      this.orgService.requestOrganization(userID, requestedOrgID).subscribe(
        result => {  
          if(result['msg']){
            this.displayMessage = true;
            this.userMessage = result['msg']
          } else{
              this.mode = "REQUESTSUCCESS"
              this.displayMessage = false;
          }
        }
      )
    }

    closeDialog(){this.dialogRef.close()}

    fileChanged(e) {
      this.file = e.target.files[0];
    }

    checkUpload(){
      if (this.file === undefined){
        this.showErrorMsg = true; 
        this.errorMsg = "No File Selected."
      } else {
        var formData = new FormData();
        // var orgID = localStorage.getItem('orgID')
        formData.append('file', this.file);
        // formData.append('orgID', orgID)
        this.uploadData(formData);
        this.uploading = true;
        this.showErrorMsg = false;
      }
    }

    uploadData(formData){
      this.censustractService.uploadOccupancy(formData).subscribe(result =>{
        console.log(result)
      })
    }

    refreshUserProfile(){
      var userProfile = JSON.parse(localStorage.getItem('userProfile'));
      this.userService.getUserProfile(userProfile).subscribe(newUserProfile=>{
        this.isDev = newUserProfile['user'].dev 
        localStorage.setItem('userProfile', JSON.stringify(newUserProfile))
  
      })
    }

    ngOnInit(){}
} 
