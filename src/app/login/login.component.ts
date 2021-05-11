import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from "../services/user/user.service";
import { KeyValueDiffers } from '@angular/core';
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  differ:any;
  checkFlag = false;
  logo_dir = environment.LOGO_DIR;

  constructor(private oauthService: OAuthService, private userService: UserService, differs:  KeyValueDiffers, public router: Router,) { 
    this.oauthService.loadDiscoveryDocument();
    this.differ = differs.find([]).create();
  }

  public get claims(){
    var claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims; 
  }

  public checkOauth(claims: any){
    this.userService.getOauth(claims).subscribe(
      profile=> {
        if(!profile['person']){
          this.registerOauth(claims);
        }else {
          localStorage.setItem('userProfile', JSON.stringify(profile['person']));
          localStorage.setItem('jwt', profile['jwt'])
          this.userService.setUserProfile(profile['person'])
          var that = this;
          setTimeout(function(){ 
            that.router.navigate(['/organizations']);
          }, 1000);
        }
      })
  }

  public registerOauth(claims: any){
    this.userService.registerOauth(claims).subscribe(
      profile =>{
        localStorage.setItem('userProfile', JSON.stringify(profile['person']));
        localStorage.setItem('jwt', profile['jwt'])
        this.userService.setUserProfile(profile['person'])
        var that = this;
        setTimeout(function(){ 
          that.router.navigate(['/organizations']);
        }, 1000);
      }
    );
  }

  ngDoCheck(){
    var changes = this.differ.diff(this.claims);
    if (changes && !this.checkFlag){
      this.checkOauth(this.claims);
      this.checkFlag = true;
    }
  }

  ngOnInit() {}

}
