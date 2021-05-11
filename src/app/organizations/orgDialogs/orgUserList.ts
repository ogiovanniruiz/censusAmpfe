import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'
import {Sort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material';
import {OrganizationService} from '../../services/organization/organization.service'

@Component({
    templateUrl: './orgUserList.html',
})

export class OrgUserListDialog implements OnInit{

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  orgMembers = []
  orgSelected: Object;
  displayMessage = false;
  userMessage: String;
  sortedUsers;
  editingLvl = false;
  editedUser: Object;
  isDev = false;
  mode = ""
  orgLevel: String;
  userProfile: Object;
  orgName: String

  phoneNumbers: any;
  loading;
  
  totalsize: Number;
  currentPage = 0
  public pageSize = 10;
  public totalSize = 0;
  pageEvent: PageEvent;

  constructor(public dialogRef: MatDialogRef<OrgUserListDialog>, 
      @Inject(MAT_DIALOG_DATA) public data: any, 
      public userService: UserService, 
      public campaignService: CampaignService,
      public orgService: OrganizationService) {
        this.orgSelected = data
        this.orgName = this.orgSelected['name']
      }

  getMemberList(orgDetail: Object){
    this.loading = true;
    this.dialogRef.updateSize('500px');
      this.orgService.getOrgMembers(orgDetail).subscribe(org =>
        {
          var totalList = org['members'].concat(org['requests']); 
          this.orgMembers= totalList
          this.sortedUsers = this.orgMembers.slice();
          this.totalSize = this.orgMembers.length;
          this.iterator();
          this.loading = false;
        }
      )
  }

  editMember(person:Object, org: Object, status: String){
    this.orgService.updateOrgLevel(person, org, status).subscribe(results=>{
      this.orgSelected = results;
      this.getMemberList(this.orgSelected)
      this.refreshUserProfile();      
    })
  }

  getOrgLevel(){
    var orgID = localStorage.getItem('orgID')
    var userOrgs = this.userProfile['user']['userOrgs']

    for (var i = 0; i< userOrgs.length; i++){
      if(userOrgs[i].orgID === orgID){
        this.orgLevel = userOrgs[i].level
      }
    }
  }

  refreshUserProfile(){
    var userProfile = JSON.parse(localStorage.getItem('userProfile'));
      
    this.userService.getUserProfile(userProfile).subscribe(newUserProfile=>{
      this.isDev = newUserProfile['user'].dev 
      localStorage.setItem('userProfile', JSON.stringify(newUserProfile))
      this.userProfile = newUserProfile
      this.getOrgLevel()

    })
  }

  onNoClick(): void {this.dialogRef.close("FINISHED")}

  return(){
    this.dialogRef.close("FINISHED")
  }

  //getOrgPhoneNumbers(){
  //  var orgID = localStorage.getItem('orgID')

   // this.orgService.getOrgPhoneNumbers(orgID).subscribe(phoneNumbers =>{
   //   console.log(phoneNumbers)
      
    //  this.phoneNumbers = phoneNumbers
   // })
 // }

  ngOnInit(){
    //this.getOrgPhoneNumbers();
    this.getMemberList(this.orgSelected)
    this.refreshUserProfile();
  }

  public handlePage(e: any) {
      this.currentPage = e.pageIndex;
      this.pageSize = e.pageSize;
      this.iterator();
      return e
  }

  private iterator() {
      const end = (this.currentPage + 1) * this.pageSize;
      const start = this.currentPage * this.pageSize;
      const part = this.orgMembers.slice(start, end);
      this.sortedUsers = part;
  }

  sortData(sort: Sort) {
      const data = this.orgMembers.slice();
      if (!sort.active || sort.direction === '') {
        this.sortedUsers= data;
        return;
      }
      this.sortedUsers = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'firstName': return compare(a.firstName, b.firstName, isAsc);
          case 'lastName': return compare(a.lastName, b.lastName, isAsc);
          default: return 0;
        }
      });
      this.sortedUsers.paginator = this.paginator;
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

