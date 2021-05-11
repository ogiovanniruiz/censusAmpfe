import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {UserService} from '../services/user/user.service';
import {PasswordResetDialog} from './passwordresetDialog';

import { environment } from '../../environments/environment';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})
export class PasswordresetComponent implements OnInit {

  displayMessage = false;
  userMessage: string;

  resetMessage: string;
  resetUpdate: string;
  upr: string;

  logo_dir = environment.LOGO_DIR;

  dialogRef: any;

  constructor(private router: Router, private user: UserService, private route: ActivatedRoute, public dialog: MatDialog) {}

  public cancel(){
    this.router.navigate(['/']);
  }

  public submitPasswordReset(email: string){
    if (email === ''){
      this.displayMessage = true;
      this.userMessage = 'Form is incomplete.';
    } else {
      this.user.passwordReset(email).subscribe(
          (res: any) => {
            this.displayMessage = false;

            if (res.msg === 'Email Sent' || res.msg === 'User not found'){
              this.resetMessage = res.msg;
            } else if (res.msg === 'OAuth'){
              this.resetMessage = res.msg;
              this.dialogRef = this.dialog.open(PasswordResetDialog);
              this.dialogRef.afterClosed().subscribe(result => {});
            }  else {
              this.resetMessage = 'Error';
            }
          });
    }
  }

  public submitNewPassword(password: string, password_repeat: string){
    if (password !== password_repeat){
      this.displayMessage = true;
      this.userMessage = 'Passwords do not match.';
    } else {
      this.user.setNewPassword(this.upr, password).subscribe(
          (res: any[]) => {
            this.displayMessage = false;
            if(res){
              this.resetUpdate = 'Updated';
            } else {
              this.resetUpdate = 'Error';
            }
          });
    }
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.upr = params.upr;
    });
  }

}
