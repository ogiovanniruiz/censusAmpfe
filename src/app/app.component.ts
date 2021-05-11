import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators, NgControlStatus} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {Router} from "@angular/router";

import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler} from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

import {MatDialog} from '@angular/material';
import {ScriptEditorDialog} from './scripts/scriptEditor'
import {DevSettingsDialog} from './settings/devSettings'
import {UserProfileDialog} from './settings/userProfile'
import {UserService} from './services/user/user.service'
import {ContactFormDialog} from './settings/contactForm'

import { environment } from '../environments/environment';

import { version } from '../../package.json';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit{

  constructor(private oauthService: OAuthService, private userService: UserService, public router: Router, public dialog: MatDialog) {
    this.configureWithNewConfigApi();

    this.userService.userProfile.subscribe(
      profile=> {
        if (profile){
          this.isDev = profile['user'].dev
          this.userProfile = profile;
        } else{
          this.userProfile = null
        }
      })
  }

  public version: string = version;

  public synced: boolean = true;
  public serverVersion: string;
  public checkingVersion: boolean = false;

  displayMessage = false;
  userMessage: string;
  isDev = false;
  userProfile;

  logo_dir = environment.LOGO_DIR;
  theme = environment.THEME;

  @ViewChild('email', {static: false}) email: ElementRef
  @ViewChild('password', {static: false}) password: ElementRef

  private configureWithNewConfigApi() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  googleLogin() {

    if(this.synced){
      this.oauthService.initImplicitFlow();
    }else{
      alert("You do not have the latest version of Amplify.")

    }
    
  }

  localLogin(){

    if(this.synced){
      this.userService.loginUser(this.email.nativeElement.value, this.password.nativeElement.value).subscribe(
        (profile: any[])=> {
          if(!profile['person']){
            this.displayMessage =  true;
            this.userMessage = "Profile does not exist. Please Register."
          }else {
            this.displayMessage = false;
            this.isDev = profile['person']['user'].dev
  
            localStorage.setItem('userProfile', JSON.stringify(profile['person']));
            this.userService.setUserProfile(profile['person'])
            localStorage.setItem('jwt', profile['jwt'])
            this.router.navigate(['/organizations']);
            //localStorage.setItem('orgID', 'NONE')
          }
        }
      )
    } else{
      alert("You do not have the latest version of Amplify.")
    }

  }

  localRegister(){
    if(this.synced){
      this.displayMessage = false;
      this.router.navigate(['/register']);
    } else{
      alert("You do not have the latest version of Amplify.")
    }

  }

  localForgotPassword(){
    if(this.synced){
      this.displayMessage = false;
      this.router.navigate(['/passwordreset']);
    } else{
      alert("You do not have the latest version of Amplify.")
    }

  }

  openUserProfileDialog(): void {
    const dialogRef = this.dialog.open(UserProfileDialog);
    dialogRef.afterClosed().subscribe(result => {if(result){this.refreshUserProfile()}});
  }
  
  openDevSettingsDialog(): void {
    const dialogRef = this.dialog.open(DevSettingsDialog);
    dialogRef.afterClosed().subscribe(result => {if(result){this.refreshUserProfile()}});
  }

  openScriptDialog(): void {
    const dialogRef = this.dialog.open(ScriptEditorDialog, {width: '95%'});
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openContactDialog(): void {
    const dialogRef = this.dialog.open(ContactFormDialog, {width: '95%'});
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  refreshUserProfile(){
    var userProfile = JSON.parse(localStorage.getItem('userProfile'));
    
    this.userService.getUserProfile(userProfile).subscribe(newUserProfile=>{
      this.isDev = newUserProfile['user'].dev 
      localStorage.setItem('userProfile', JSON.stringify(newUserProfile))
    })
  }

  goToHome(){
    this.router.navigate(['/organizations']);
    //localStorage.setItem('orgID', 'NONE')
  }

  goToCampaigns(){
    this.router.navigate(['/home']);
  }

  back(){
    if (this.router.url === "/home"){
      this.router.navigate(['/organizations']);
      //localStorage.setItem('orgID', 'NONE')

    } else if (this.router.url === "/dashboard" || this.router.url === '/membership'){
      this.router.navigate(['/home']);

    } else if(this.router.url === "/asset"){
      this.router.navigate(['/organizations']);
      //localStorage.setItem('orgID', 'NONE')
    } else if(this.router.url === "/canvass" || this.router.url === "/texting" || this.router.url === "/phonebank" || this.router.url === "/petition"){

      this.router.navigate(['/activity'])
    }
    else if(this.router.url ==="/canvass/groupForm"){
      this.router.navigate(['/canvass'])

    }
     else {
      this.router.navigate(['/dashboard'])

    }
  }

  logOff(){
    localStorage.removeItem('userProfile')
    localStorage.removeItem('jwt')

    this.userService.setUserProfile(null)
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }

  emailFormControl = new FormControl('', [Validators.required,Validators.email]);

  ngOnInit() {

    this.synced = false;
    this.checkingVersion = true;
    this.userService.checkVersion(this.version).subscribe(result =>{
      this.checkingVersion = false;

      if(result['sync']){
        this.synced = true;}
      else{
        this.synced = false;
      
      }

      this.serverVersion = result['serverVersion']
    
    
    },
    error => {
      console.log("The Server is Down.")
    })


  }

}

