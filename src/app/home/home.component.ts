import { Component, OnInit,  ViewChild, AfterContentInit, HostListener} from '@angular/core';
import { Router } from "@angular/router";
import { MatGridList } from '@angular/material';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import {JoinCreateCampaignDialog} from './campaignDialogs/joinCreateCampaign'
import {MatDialog} from '@angular/material';
import { UserService} from '../services/user/user.service'
import {CampaignService} from '../services/campaign/campaign.service'
import {OrganizationService} from '../services/organization/organization.service'
import { OrgDetailsDialog } from './campaignDialogs/orgDetails';
import {StorageMap} from '@ngx-pwa/local-storage';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  @ViewChild('grid', {static: true}) grid: MatGridList;

  gridByBreakpoint = {
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }

  campaigns: any;
  userProfile: any;
  isDev: Boolean
  orgLevel: String
  orgName: String;
  dataLoaded = false;
  
  constructor(private userService: UserService, 
              private router: Router, 
              private observableMedia: MediaObserver, 
              public dialog: MatDialog, 
              public campaignService: CampaignService,
              public orgService: OrganizationService,
              private storage: StorageMap) {
    this.campaignService.userCampaigns.subscribe(
      campaigns => {this.campaigns = campaigns;
    })
  }

  getOrgDetail(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.getOrganization(orgID).subscribe(orgDetail =>{
      this.orgName = orgDetail['name']
      
      
    })
  }

  public enterCampaign(campaignID: Number){
    if(campaignID.toString() !== localStorage.getItem('campaignID')){
      this.storage.delete('orgSummaryTime').subscribe(() => {});
      this.storage.delete('petitionSummaryTime').subscribe(() => {});
      this.storage.delete('phonebankingSummaryTime').subscribe(() => {});
    }
    var stringID = campaignID.toString();
    localStorage.setItem('campaignID', stringID);
    this.router.navigate(['/dashboard']);
  }

  openJoinCreateCampaignDialog(mode: String): void {
    const dialogRef = this.dialog.open(JoinCreateCampaignDialog, {data: mode});
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.getOrgCampaigns()
        this.refreshUserProfile();
      }
    });
  }

  getOrgCampaigns(){
    var orgID = localStorage.getItem('orgID')
    this.campaignService.getOrgCampaigns(orgID).subscribe(campaigns =>{
      this.campaigns = campaigns
      this.dataLoaded = true;
      
    })
  }

  refreshUserProfile(){
    this.userProfile = JSON.parse(localStorage.getItem('userProfile'));

    this.userService.getUserProfile(this.userProfile).subscribe(result=>{
      localStorage.setItem('userProfile', JSON.stringify(result))
      this.userProfile = result
      this.isDev =  this.userProfile['user']['dev']
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

  openMembership(){
    this.router.navigate(['/membership']);
  }

  openDetails(){
    const dialogRef = this.dialog.open(OrgDetailsDialog, {data: "mode"});
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.getOrgCampaigns()
        this.refreshUserProfile();
      }
    });

  }

  ngOnInit() {
    this.grid.cols = 1;    
    this.refreshUserProfile();
    this.getOrgCampaigns();
    this.getOrgLevel();
    this.getOrgDetail();
  }

  ngAfterContentInit() {
    this.observableMedia.media$.subscribe((change: MediaChange) => {
      this.grid.cols = this.gridByBreakpoint[change.mqAlias];
    });
  }
}
