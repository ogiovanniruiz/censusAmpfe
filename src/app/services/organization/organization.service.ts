import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private API_URL = environment.API_URL;
  constructor(private http: HttpClient) { }

  requestOrganization(userID: String, orgID: String){
    return this.http.post(this.API_URL + '/organizations/requestOrganization', {userID: userID, orgID: orgID});
  }

  editOrganization(name: String, descripition: String, orgID: Object){ 
    return this.http.post(this.API_URL + '/organizations/editOrganization', {name: name, description: descripition, orgID: orgID});
  }

  createOrganization(name: String, descripition: String, userID: Object){ 
    return this.http.post(this.API_URL + '/organizations/createOrganization', {name: name, description: descripition, userID: userID});
  }

  getAllOrgs(userProfile: Object){
    return this.http.post(this.API_URL + '/organizations/getAllOrganizations', userProfile);
  }

  getUserOrgs(userProfile: Object){
    return this.http.post(this.API_URL + '/organizations/getUserOrganizations', userProfile);
  }

  getOrganization(orgID: String){
    return this.http.post(this.API_URL + '/organizations/getOrganization', {orgID: orgID});
  }

  getOrgMembers(org){
    return this.http.post(this.API_URL + '/organizations/getOrgMembers', org);
  }

  updateOrgLevel(person: Object, org: Object, status: String){
    return this.http.post(this.API_URL + '/organizations/updateOrgLevel', {org: org, person: person, status: status});
  }
  
  getCampaignOrgs(campaignID: Number){
    return this.http.post(this.API_URL + '/organizations/getCampaignOrgs', {campaignID: campaignID});
  }

  dbPatch(userID: Object){
    return this.http.post(this.API_URL + '/organizations/dbPatch', {userID: userID}); 
  }

  buyPhoneNumber(orgID, areaCode){
    return this.http.post(this.API_URL + '/organizations/buyPhoneNumber', {orgID: orgID, areaCode: areaCode});
  }

  releasePhoneNumber(orgID, phoneNumber ){
    return this.http.post(this.API_URL + '/organizations/releasePhoneNumber', {orgID: orgID, phoneNumber: phoneNumber});

  }

  checkTwilioSubAccount(orgID){
    return this.http.post(this.API_URL + '/organizations/checkTwilioSubAccount', {orgID: orgID});
  }

  //addPhoneNumber(orgID: String, phoneNumber: String){
  //  return this.http.post(this.API_URL + '/organizations/addPhoneNumber', {orgID: orgID, phoneNumber: phoneNumber});
  //}

  //removePhoneNumber(orgID: String, phoneNumber: String){
  //  return this.http.post(this.API_URL + '/organizations/removePhoneNumber', {orgID: orgID, phoneNumber: phoneNumber});
  //}

  //getAccountPhoneNumbers(){
 //   return this.http.post(this.API_URL + '/organizations/getAccountPhoneNumbers',{})
  //}

  createTag(orgID: String,tag: String){
    return this.http.post(this.API_URL + '/organizations/createTag', {orgID: orgID, tag: tag})
  }

  getOrgTags(orgID: String){
    return this.http.post(this.API_URL + '/organizations/getOrgTags', {orgID: orgID})
  }

  uploadLogo(file){
    return this.http.post(this.API_URL + '/organizations/uploadLogo', file)
  }

  getOrgLogo(orgID){
    return this.http.post(this.API_URL + '/organizations/getOrgLogo', {orgID: orgID}, {responseType: 'text'})
  }

  createTwilioSubAccount(orgID){
    return this.http.post(this.API_URL + '/organizations/createTwilioSubAccount', {orgID: orgID})
  }

  getOrgPhoneNumbers(orgID: String){
    return this.http.post(this.API_URL + '/organizations/getOrgPhoneNumbers', {orgID: orgID});
  }

  getOrgPhoneNumbersFilter(orgID: String, numbers){
    return this.http.post(this.API_URL + '/organizations/getOrgPhoneNumbersFilter', {orgID: orgID, numbers: numbers});
  }

  enableTexting(orgID: String){
    return this.http.post(this.API_URL + '/organizations/enableTexting', {orgID})
  }

  getCities(){
    return this.http.post(this.API_URL + '/organizations/getCities', {})
  }
}
