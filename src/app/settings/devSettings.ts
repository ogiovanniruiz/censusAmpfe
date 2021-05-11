import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../services/user/user.service'
import {CampaignService} from '../services/campaign/campaign.service'
import {Sort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material';

@Component({
    templateUrl: './devSettings.html',
  })
  
export class DevSettingsDialog implements OnInit{

  allUsers = [];

  displayMessage = false;
  userMessage: String;
  sortedUsers;
  editingLvl = false;
  editedUser: Object;
  isDev= false;

  totalsize: Number;
  currentPage = 0
  public pageSize = 10;

  public totalSize = 0;

  pageEvent: PageEvent;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  
  constructor(public dialogRef: MatDialogRef<DevSettingsDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public campaignService: CampaignService) {
               
              }
  
  onNoClick(): void {this.dialogRef.close("CLOSED")}

  closeSettings(){
    this.dialogRef.close("CLOSED")
  }

  getAllUsers(){
    var userProfile = JSON.parse(localStorage.getItem('userProfile'));
    this.isDev = userProfile.user.dev

    this.userService.getAllUsers(userProfile).subscribe(
      (profiles: any[]) => {
        this.allUsers = profiles;
        this.sortedUsers = this.allUsers.slice();
        this.totalSize = this.allUsers.length 
        this.iterator();
      }
    )
  }

  updateDevStatus(user: Object, developer: Boolean){    
    this.userService.updateDevStatus(user, developer).subscribe(
      result =>{ this.getAllUsers();}
    ) 
  }

  deleteUser(user: Object){
      if (confirm("Are sure you want to Annihilate this user?")){
        this.userService.deleteUser(user).subscribe(
            result=>{this.getAllUsers();}
        )
      }
  }


  ngOnInit(){
    this.getAllUsers();
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
    const part = this.allUsers.slice(start, end);
    this.sortedUsers = part;
  }

  sortData(sort: Sort) {
    const data = this.allUsers.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedUsers= data;
      return;
    }

    this.sortedUsers = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'firstName': return compare(a.firstName, b.firstName, isAsc);
        case 'lastName': return compare(a.lastName, b.lastName, isAsc);
        case 'email': return compare(a.user.loginEmail, b.user.loginEmail, isAsc);
        case 'permission': return compare(a.user.assetMapLvl, b.user.assetMapLvl, isAsc);
        default: return 0;
      }
    });

    this.sortedUsers.paginator = this.paginator;

  }
} 

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}