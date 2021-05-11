import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../services/user/user.service'
import {CampaignService} from '../services/campaign/campaign.service'
import {ContactService} from '../services/contact/contact.service'

@Component({
    templateUrl: './contactForm.html',
  })
  
export class ContactFormDialog implements OnInit{

  isBug = false;
  sending = false;


  @ViewChild('subject', {static: false}) subject:ElementRef;
  @ViewChild('message', {static: false}) message:ElementRef;

  constructor(public dialogRef: MatDialogRef<ContactFormDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public userService: UserService, 
              public campaignService: CampaignService,
              public contactService: ContactService) {


                console.log(data)
              }
  
  onNoClick(): void {this.dialogRef.close()}

  sendEmail(){

    this.sending = true;
    var subject = this.subject.nativeElement.value
    var message = this.message.nativeElement.value
    var userProfile = JSON.parse(localStorage.getItem('userProfile'))
    var orgID = localStorage.getItem('orgID')
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    
    this.contactService.sendEmail(subject, message, userProfile, orgID, activityID, campaignID, this.isBug, this.data).subscribe(result =>{
      if(result){
        this.dialogRef.close(result)
      } 
    })
  }

  closeSettings(){
    this.dialogRef.close()
  }

  ngOnInit(){}

}