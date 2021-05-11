import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhonebankService {

  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  lockHouseHold(campaignID: Number, activityID: String, userID: String, targetIDs, orgID: String){
    return this.http.post(this.API_URL + '/phonebank/lockHouseHold', {campaignID: campaignID, activityID: activityID, userID: userID, targetIDs: targetIDs, orgID: orgID});
  }

  getTwilioToken(orgID){
    return this.http.post(this.API_URL + '/phonebank/getTwilioToken', {orgID: orgID})
  }

  createPerson(newPerson){
    return this.http.post(this.API_URL + '/phonebank/createPerson',{newPerson: newPerson})
  }

  editPerson(person, newDetail){
    return this.http.post(this.API_URL + '/phonebank/editPerson',{person, newDetail})
  }

  idPerson(person: Object, idHistory: any[], campaignID: Number, activityID: String, userID: String, orgID: String, houseHold: any[]){
    return this.http.post(this.API_URL + '/phonebank/idPerson',{person, idHistory, campaignID, activityID, userID, orgID, houseHold})
  }

  nonResponse(houseHold: Object, idHistory: any[], campaignID: Number, activityID: String, orgID: String, idType: String){
    return this.http.post(this.API_URL + '/phonebank/nonResponse',{houseHold, idHistory, campaignID, activityID, orgID, idType})
  }

  allocatePhoneNumber(userID: String, activityID: String, phoneNumber: String, campaignID: Number){
    return this.http.post(this.API_URL + '/phonebank/allocatePhoneNumber', {userID: userID, activityID: activityID, phoneNumber: phoneNumber, campaignID})
  }

  completeHouseHold(person: Object, activityID: String, activityType: String){
    return this.http.post(this.API_URL + '/phonebank/completeHouseHold',{person: person, activityID: activityID, activityType:  activityType})
  }

  getNumCompleted(activityID, userID){
    return this.http.post(this.API_URL + '/phonebank/getNumCompleted',{activityID, userID})
  }

  getLockedHouseHold(userID, campaignID, activityID){
    return this.http.post(this.API_URL + '/phonebank/getLockedHouseHold', {userID, campaignID, activityID})
  }


}
