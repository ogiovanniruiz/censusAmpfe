import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = environment.API_URL;
  public userProfile = new Subject();
  public userLocation =  new Subject();

  constructor(private http: HttpClient) {}

  setUserProfile(userProfile){
    this.userProfile.next(userProfile)
  }

  deleteUser(user: Object){
    return this.http.post(this.API_URL + '/users/deleteUser', user);
  }

  loginUser(email: string, password: string){
    return this.http.post(this.API_URL + '/users/loginUser', {email: email, password: password});
  }

  getUserProfile(userProfile: Object){
    return this.http.post(this.API_URL + '/users/getUserProfile', userProfile);
  }

  updateUserLvl(newUserProfile: Object, newUserLevel: String, campaignID: Number){
    return this.http.post(this.API_URL + '/users/updateUserLvl', {newUser: newUserProfile, newUserLevel: newUserLevel, campaignID: campaignID});
  }

  updateDevStatus(user: Object, developer: Boolean){
    return this.http.post(this.API_URL + '/users/updateDevStatus', {user: user, developer: developer});
  }

  updateAssetMapLvl(person: Object, newUserLvl: String){
    return this.http.post(this.API_URL + '/users/updateAssetMapLvl', {person: person, newUserLevel: newUserLvl});
  }

  getAllUsers(userProfile: Object){
    return this.http.post(this.API_URL + '/users/getAllUsers',{userProfile: userProfile});
  }

  registerUser(newUserDetail: any){
    return this.http.post(this.API_URL+'/users/registerUser', newUserDetail);
  }

  passwordReset(email: any){
    return this.http.post(this.API_URL+'/users/passwordReset', {email: email});
  }

  setNewPassword(upr: any, password: any){
    return this.http.post(this.API_URL+'/users/setNewPassword', {upr: upr, password: password});
  }

  getOauth(claims:any){
    return this.http.post(this.API_URL+'/users/getOauth', claims);
  }

  registerOauth(claims: any){
    return this.http.post(this.API_URL+'/users/registerOauth', claims);
  }

  editUser(userID: String, newUserDetails: Object){
    return this.http.post(this.API_URL + '/users/editUser', {newUserDetails: newUserDetails})
  }

  getUserLocation(){
    if (navigator.geolocation) {navigator.geolocation.watchPosition(showPosition);} 
    else {alert("Geolocation is not supported by this browser.")}

    var that = this 

    function showPosition(position){
      that.userLocation.next(position);
    };
  }

  checkVersion(version: string){
    return this.http.post(this.API_URL + '/users/checkVersion', {version: version})
  }

  submitAgreement(data: Object){
    return this.http.post(this.API_URL + '/users/submitAgreement', data)

  }

  updateDataManager(member: Object, campaignID: Number){
    return this.http.post(this.API_URL + '/users/updateDataManager', {member, campaignID})
  }

}
