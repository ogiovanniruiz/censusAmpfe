import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import decode from 'jwt-decode';
import { version } from '../../../package.json';
import {PetitionService} from '../services/petition/petition.service'


@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(private petitionService: PetitionService) {}


  canActivate(activatedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise <boolean> | boolean{
    
    if(activatedRoute.queryParams.dir){

      return this.petitionService.processLink(activatedRoute.queryParams.dir).map(result=>{

          var activityDetails = result

          if( activityDetails['exp'] < Math.floor(Date.now()/1000)){
            return false
          }
  
          if(!activityDetails['campaignID']) return false;
          if(!activityDetails['activityID']) return false;
          if(!activityDetails['orgID']) return false;
  
          localStorage.setItem('campaignID' , activityDetails['campaignID']);
          localStorage.setItem('activityID' , activityDetails['activityID']);
          localStorage.setItem('orgID' , activityDetails['orgID']);
          return true
      })
    }
    
    var stringProfile = localStorage.getItem('userProfile');
    var token = localStorage.getItem('jwt')

    if(token){
      const tokenPayload = decode(token);

      if(tokenPayload.exp < Math.floor(Date.now()/1000)){
        return false
      }
  
      if(tokenPayload.version != version){
        return false
      }
  
      if (stringProfile){
        return true;
      }
      
      return false

    }

    return false

  }
}
