import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../services/user/user.service'
import {CampaignService} from '../services/campaign/campaign.service'
import {OrganizationService} from '../services/organization/organization.service'
import {MatTableDataSource} from '@angular/material/table';
import {ScriptEditorDialog} from '../scripts/scriptEditor'


@Component({
    templateUrl: './orgsDialog.html',
  })
  
export class OrgsDialog implements OnInit{

  displayedColumns: string[] = ['name', 'description', 'approve', 'deny'];
  dataSource;

  allUsers = [];
  mode: String;
  campaignProfile: any;
  campaignOrgs: any
  requests: any;
  ready = false;
  dev = false;
  phoneNumbers: Object
  showErrorMsg = false
  errorMsg = ""
  campaignID;
  @ViewChild('parentOrg' , {static: false}) parentOrg:ElementRef;

  accountPhoneNumbers = []
  orgMembers = []
  loadingMembers = false;
  
  constructor(public dialogRef: MatDialogRef<OrgsDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public campaignService: CampaignService,
              public orgService: OrganizationService, public dialog: MatDialog) {   
              }
  
  onNoClick(): void {this.dialogRef.close()}

  openScriptEditor(){
    this.dialogRef.close()
    const dialogRef = this.dialog.open(ScriptEditorDialog, {width: '80%'});
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getParentOrg(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.campaignService.getParentOrg(campaignID).subscribe(results =>{
      this.parentOrg.nativeElement.value = results['parentOrg']
    })
  }

  updateParentOrg(newParentOrg){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.campaignService.updateParentOrg(campaignID, newParentOrg).subscribe(results =>{
      console.log(results)
      //this.parentOrg.nativeElement.value = results['parentOrg']

    })
  }

  getCampaignOrgs(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.orgService.getCampaignOrgs(campaignID).subscribe(orgs=>{
      this.campaignOrgs = orgs
    })
  }
  
  
  getCampaignRequests(){
    var campaignID =  parseInt(localStorage.getItem('campaignID'))
    this.campaignService.getCampaignRequests(campaignID).subscribe(requests =>{
      this.requests = requests
      this.dataSource = new MatTableDataSource(this.requests);
    })
  }

  manageRequest(orgID: String, action: String){
    var campaignID = parseInt(localStorage.getItem('campaignID'))

    this.campaignService.manageCampaignRequest(campaignID, orgID, action).subscribe(result=>{
      if(result){
       this.getCampaignOrgs();
       this.getCampaignRequests();
      }
    })
  }

  removeOrg(orgID: String){
    var campaignID = parseInt(localStorage.getItem('campaignID'))

    if (confirm('Are you sure you want to remove this Organization?')) {
      this.campaignService.removeOrg(campaignID, orgID).subscribe(result=>{
        if(result){
         this.getCampaignOrgs();
        }
      })
    }
  }

  getOrg(){
    var orgID = localStorage.getItem("orgID")
    this.campaignID = parseInt(localStorage.getItem('campaignID'))
    this.orgService.getOrganization(orgID).subscribe(org=>{
      this.getMemberList(org)
    })
  }

  getMemberList(orgDetail: Object){
    this.loadingMembers = true;
    this.orgService.getOrgMembers(orgDetail).subscribe(org =>
      {
        this.loadingMembers = false;
        this.orgMembers = org['members']
      }
    )
  }

  updateDataManager(member){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.userService.updateDataManager(member, campaignID).subscribe(member=>{
      for(var i = 0; i < this.orgMembers.length; i++){
        if(this.orgMembers[i]._id === member['_id']){
          this.orgMembers[i] = member
        }
      }
    })
  }

  ngAfterContentInit(){
    setTimeout(() =>{
      this.ready = true;
    })
  }

  ngOnInit(){
    this.getCampaignOrgs();
    this.getCampaignRequests();
    this.getParentOrg();
    this.getOrg()


    this.dev = JSON.parse(localStorage.getItem('userProfile'))['user']['dev']
  }
} 