import { Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
    templateUrl: './passwordresetDialog.html',
  })
  
export class PasswordResetDialog implements OnInit{
  
  constructor(public dialogRef: MatDialogRef<PasswordResetDialog>) {}

  onNoClick(): void {this.dialogRef.close()}

  ngOnInit(){
  }
} 
