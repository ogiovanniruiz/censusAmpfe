import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {CampaignService} from '../../services/campaign/campaign.service'
import {OrganizationService} from '../../services/organization/organization.service'
import {MatPaginator} from '@angular/material';
import {ScriptEditorDialog} from '../../scripts/scriptEditor'
import {MatDialog} from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  templateUrl: './orgDetails.html',
})
  
export class OrgDetailsDialog implements OnInit{

  mode: String;
  showErrorMsg = false;
  errorMsg: String;
  phoneNumbers: Object
  dev = false;
  file: any;
  image: any;
  accountExists = false;
  needsAreaCode = false;
  releasingNumber = false;

  @ViewChild("areaCode", {static: false}) areaCode: ElementRef;

  constructor(public dialogRef: MatDialogRef<OrgDetailsDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              private sanitizer: DomSanitizer,
              public userService: UserService, 
              public campaignService: CampaignService,
              public orgService: OrganizationService
              , public dialog: MatDialog) {
                this.mode = data
              }
  
  onNoClick(): void {this.dialogRef.close()}
  closeDialog(): void{this.dialogRef.close()}

  createTwilioSubAccount(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.createTwilioSubAccount(orgID).subscribe(result =>{
      if(result) this.checkTwilioSubAccount()
      console.log(result)
    })
  }

  checkTwilioSubAccount(){

    var orgID = localStorage.getItem('orgID')
    this.orgService.checkTwilioSubAccount(orgID).subscribe(result =>{
      this.accountExists = result['status']
      if(this.accountExists) this.getOrgPhoneNumbers()

      console.log(result)
    })
  }

  buyPhoneNumber(){
    if(this.areaCode.nativeElement.value === ""){
      this.needsAreaCode = true;
      return
    }

    this.needsAreaCode = false;
    var orgID = localStorage.getItem('orgID')
    var areaCode = this.areaCode.nativeElement.value
    this.orgService.buyPhoneNumber(orgID, areaCode).subscribe(result =>{
      if(result['status']){
        this.getOrgPhoneNumbers()
      }
    })
  }

  releasePhoneNumber(phoneNumber){
    this.releasingNumber = true;

    var orgID = localStorage.getItem('orgID')
    this.orgService.releasePhoneNumber(orgID, phoneNumber).subscribe(result =>{
      if(result['status']){
        
        this.getOrgPhoneNumbers()
      }
    })

  }
  
  getOrgPhoneNumbers(){
    var orgID = localStorage.getItem('orgID')

    this.orgService.getOrgPhoneNumbers(orgID).subscribe((phonenumbers: [])  =>{
      this.releasingNumber = false;
      this.phoneNumbers = phonenumbers;
    })
  }

  openScriptEditor(){
    this.dialogRef.close()
    const dialogRef = this.dialog.open(ScriptEditorDialog, {width: '80%'});
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  fileChanged(e) {
    this.file = e.target.files[0];
  }

  upload(){

    if (this.file === undefined){
      this.showErrorMsg = true; 
      this.errorMsg = "No File Selected."
    } else{
      var formData = new FormData();
      
      var orgID = localStorage.getItem('orgID')
      formData.append('file', this.file);
      formData.append('orgID', orgID)

      this.uploadData(formData);
      this.showErrorMsg = false;     
    }
  }

  uploadData(formData){
    this.orgService.uploadLogo(formData).subscribe(result=>{
      console.log(result)
      if(result){
        if(result['msg'] === "Too Big"){
          this.showErrorMsg = true; 
          this.errorMsg = "Image is too big."
  
        }
      }

      this.getOrgLogo()
    })
  }

  getOrgLogo(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.getOrgLogo(orgID).subscribe((data: any)=>{
      if(data){
        var JSONdata = JSON.parse(data)

        let TYPED_ARRAY = new Uint8Array(JSONdata.image.data);
        let STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        this.image = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
      }
    })
  }

  enableTexting(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.enableTexting(orgID).subscribe(result =>{
      this.getOrgPhoneNumbers()
      console.log(result)
    })
  } 

  ngOnInit(){
    
    this.getOrgLogo()
    this.checkTwilioSubAccount()
    

    this.dev = JSON.parse(localStorage.getItem('userProfile'))['user']['dev']
  }
} 
