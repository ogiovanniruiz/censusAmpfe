import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service'
import {Router} from "@angular/router";

@Component({
    templateUrl: './userAgreement.html',
    styleUrls: ['../organizations.component.scss']
})

export class UserAgreementDialog implements OnInit{

  constructor(public dialogRef: MatDialogRef<UserAgreementDialog>, 
      @Inject(MAT_DIALOG_DATA) public data: any, 
      public userService: UserService, 
      public router: Router) {}

  version = this.data.version
  checked = false;

  submitAgreement(){
    this.userService.submitAgreement(this.data).subscribe(result =>{
      if(result['success']){
        this.dialogRef.close({agreed: true})
      }
    })
  }

  cancel(){
    this.dialogRef.close({agreed: false})
  }

  ngOnInit(){}


}

