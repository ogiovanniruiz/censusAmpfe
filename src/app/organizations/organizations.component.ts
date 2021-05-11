import { Component, OnInit } from '@angular/core';
import {OrganizationService} from '../services/organization/organization.service'
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import {MatDialog} from '@angular/material';
import {JoinCreateOrgDialog} from './orgDialogs/joinCreateOrgDialog'
import {UserService} from '../services/user/user.service'
import {OrgUserListDialog} from './orgDialogs/orgUserList'
import {Router} from "@angular/router";
import {AssetMapSettingsDialog} from '../settings/assetMapSettings'
import {UserAgreementDialog} from './orgDialogs/userAgreement'
import {EditOrgDialog} from './orgDialogs/editOrgDialog'
import {ParcelService} from '../services/parcel/parcel.service'

import {PersonService} from '../services/person/person.service'
import { fromEventPattern } from 'rxjs';
import { environment } from '../../environments/environment';
import {ReportService} from '../services/report/report.service';
import {UpdateService} from '../services/update/update.service';
import { CDK_TABLE_TEMPLATE } from '@angular/cdk/table';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit {

  leadOrgs = []
  volOrgs = []
  adminOrgs = []
  orgMembers = []

  userProfile: any;
  assetMapUserLvl = "TRIAL";

  gridColumns: Number;
  isDev = false;
  showAssetMap = environment.ASSET_MAP;
  dataLoaded = false;
  logo_dir = environment.LOGO_DIR;
  file: any;
  
  gridByBreakpoint = {
    xl: 4,
    lg: 4,
    md: 3,
    sm: 2,
    xs: 1
  }

  constructor(public orgService: OrganizationService, 
              private observableMedia: MediaObserver, 
              public personService: PersonService,
              public dialog: MatDialog, 
              public userService: UserService,
              public parcelService: ParcelService,
              public router: Router,
              public reportService: ReportService,
              public updateService: UpdateService
              ) {}

  getUserOrgs(){
    var userProfile = JSON.parse(localStorage.getItem('userProfile'));
    this.isDev = userProfile.user.dev;
    this.orgService.getUserOrgs(userProfile).subscribe(
      (orgs: any[]) => {
        this.adminOrgs = orgs['adminOrgs']
        this.leadOrgs = orgs['leadOrgs']
        this.volOrgs = orgs['volOrgs']
        this.dataLoaded = true;
      }
    )
  }

  enterOrganization(org: Object){
    localStorage.setItem('orgID', org['_id'])
    this.router.navigate(['/home']);
  }

  openCreateOrgForm(){
    
    const dialogRef = this.dialog.open(JoinCreateOrgDialog, {data: "CREATE",  width: '95%'});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.refreshUserProfile();
    });
  }

  editOrganization(org: Object){
    const dialogRef = this.dialog.open(EditOrgDialog, {data: org,  width: '95%'});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.refreshUserProfile();
    });
  }

  openRequestOrgForm(){
    const dialogRef = this.dialog.open(JoinCreateOrgDialog, {data: "REQUEST",  width: '95%'});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.refreshUserProfile();
    });
  }

  openMemberList(org: Object){
    localStorage.setItem('orgID', org['_id'])
    const dialogRef = this.dialog.open(OrgUserListDialog, {data: org, width: '95%'});
    dialogRef.afterClosed().subscribe(result => {
     this.refreshUserProfile();
    });
  }

  refreshUserProfile(){
    this.userProfile = JSON.parse(localStorage.getItem('userProfile'));

    this.userService.getUserProfile(this.userProfile).subscribe(person=>{

      if(person['user']['userAgreements'].length === 0) this.openUserAgreement(person)
      else {
        for(var i = 0; i < person['user']['userAgreements'].length; i++){
          if(person['user']['userAgreements'][i]['version'] === "1.0"){
            this.getUserOrgs()

            localStorage.setItem('userProfile', JSON.stringify(person))
            this.userProfile = person
            this.assetMapUserLvl = this.userProfile['user']['assetMapLvl']
            this.isDev =  this.userProfile['user']['dev']

            return
          }
        }
        this.openUserAgreement(person)
      }      
    })
  }

  openUserAgreement(person){
    const dialogRef = this.dialog.open(UserAgreementDialog, {height: "90%", autoFocus: false, disableClose: true, data: {person: person, version: "1.0"}});
    dialogRef.afterClosed().subscribe(result => {
      if(result['agreed']){
        this.getUserOrgs()

      }else{
        localStorage.removeItem('userProfile')
        this.userService.setUserProfile(null)
        this.router.navigate(['/']);
      }
      
    });

  }

  public enterAssetMap(){
    this.router.navigate(['/asset']);
  }

  openAssetMapSettingsDialog(): void {
    const dialogRef = this.dialog.open(AssetMapSettingsDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.refreshUserProfile();
    });
  }

  dbPatch(){
    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    this.orgService.dbPatch(userID).subscribe(result =>{
      this.getUserOrgs()
      this.refreshUserProfile();
    })
  }

  openUploadOccupancyForm(){
    const dialogRef = this.dialog.open(JoinCreateOrgDialog, {data: "UPLOAD"});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.refreshUserProfile();
    });
  }

  ngOnInit() {
    this.refreshUserProfile();
  }

  fileChanged(e) {
    this.file = e.target.files[0];
  }

  async updateTexts(){

    var updateReport = await this.updateService.updateReport()
    console.log(updateReport)
  }

  async updateImpressions(){
    var updateImpressions = await this.updateService.updateImpressions()
    console.log(updateImpressions)
  }

  async updateImpressions2(){
    var updateImpressions2 = await this.updateService.updateImpressions2()
    console.log(updateImpressions2)
  }

  async updateImpressions3(){
    var updateImpressions3 = await this.updateService.updateImpressions3()
    console.log(updateImpressions3)
  }

  async updateAddressGeocode(){
    var updateAddressGeocode = await this.updateService.updateAddressGeocode()
    console.log(updateAddressGeocode)
  }

  downloadAssets(){

    var filter = ""

    this.parcelService.getAssets(filter).subscribe(assets =>{

      var data = "{parcels: ["
      for(var i = 0; i < assets.length; i++){
        data = data + JSON.stringify(assets[i]) + ","
      }

      data = data + "]}"

      const blob = new Blob([data], {type: 'text/csv' });
      const url= window.URL.createObjectURL(blob);
         
      window.open(url);
    })
  }

  ngAfterContentInit() {
    this.observableMedia.media$.subscribe((change: MediaChange) => {
      this.gridColumns = this.gridByBreakpoint[change.mqAlias];
    });
  }

  downloadAllData(){
    console.log("DOWNLOADING>>>>")
    var campaignID = 3
    //this.personService.downloadAllContactData(campaignID).subscribe(result=>{
    //  console.log(result)
    //})

  }
}
