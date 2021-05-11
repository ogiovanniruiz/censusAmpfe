import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextingService {

  private API_URL = environment.API_URL;
  constructor(private http: HttpClient) {}

  pullTexts(orgID: String){
    return this.http.post(this.API_URL + '/texting/pullTexts', {orgID}) 
  }

  getTextMetaData(campaignID: Number, activityID: String, userID: String, targetIDs){
    return this.http.post(this.API_URL + '/texting/getTextMetaData', {campaignID: campaignID, activityID: activityID, userID: userID, targetIDs: targetIDs}) 
  }

  loadLockedPeople(campaignID: Number, activityID: String, userID: String){
    return this.http.post(this.API_URL + '/texting/loadLockedPeople', {campaignID: campaignID, activityID: activityID, userID: userID}) 
  }

  lockNewPeople(campaignID: Number, activityID: String, userID: String, targetIDs, orgID: String){
    return this.http.post(this.API_URL + '/texting/lockNewPeople', {campaignID: campaignID, activityID: activityID, userID: userID, targetIDs: targetIDs, orgID: orgID}) 
  }

  getRespondedPeople(campaignID: Number, activityID: String, userID: String, orgLevel: String){
    return this.http.post(this.API_URL + '/texting/getRespondedPeople', {campaignID: campaignID, activityID: activityID, userID: userID, orgLevel: orgLevel}) 
  }

  sendText(person: Object, initTextMsg: String, activityID: String, phoneNum: String, orgID: String){
    return this.http.post(this.API_URL + '/texting/sendText', {person:person, initTextMsg: initTextMsg, activityID: activityID, phoneNum: phoneNum, orgID: orgID})
  }

  updateConversation(person: Object){
    return this.http.post(this.API_URL + '/texting/updateConversation', person)
  }

  getIdentifiedPeople(activityID: String){
    return this.http.post(this.API_URL + '/texting/getIdentifiedPeople', {activityID: activityID})
  }

  allocatePhoneNumber(userID: String, activityID: String, phoneNumber: String, campaignID: Number){
    return this.http.post(this.API_URL + '/texting/allocatePhoneNumber', {userID: userID, activityID: activityID, phoneNumber: phoneNumber, campaignID})
  }

  idPerson(person: Object, idResponses: any[], campaignID: Number, activityID: String, activityType: String, script: Object, userID: String, orgID: String){
    return this.http.post(this.API_URL + '/texting/idPerson',{person, idResponses, campaignID, activityID, activityType,script, userID, orgID})
  }

  nonResponse(person: Object, idHistory: any[], campaignID: Number, activityID: String, orgID: String, idType: String){
    return this.http.post(this.API_URL + '/texting/nonResponse',{person, idHistory, campaignID, activityID, orgID, idType})
  }

  completePerson(person: Object, activityID: String, activityType: String){
    return this.http.post(this.API_URL + '/texting/completePerson',{person: person, activityID: activityID, activityType:  activityType})
  }

  getConversation(person: Object){
    return this.http.post(this.API_URL + '/texting/getConversation', person)

  }


}
