import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private API_URL = environment.API_URL;
  public userCampaigns =  new Subject();

  constructor(private http: HttpClient) { }

  setUserCampaigns(userProfile){
    this.userCampaigns.next(userProfile)
  }

  requestCampaign(orgID: String, campaignID: Number){
    return this.http.post(this.API_URL + '/campaigns/requestCampaign', {orgID: orgID, campaignID: campaignID});
  }
  
  createCampaign(name: String, descripition: String, orgID: String, userID: String){ 
    return this.http.post(this.API_URL + '/campaigns/createCampaign', {name: name, description: descripition, orgID: orgID, userID: userID});
  }

  getAllCampaigns(userID: String){
    return this.http.post(this.API_URL + '/campaigns/getAllCampaigns', {userID: userID});
  }

  getCampaign(campaignID: Number){
    return this.http.post(this.API_URL + '/campaigns/getCampaign', {campaignID: campaignID});
  }

  getOrgCampaigns(orgID: String){
    return this.http.post(this.API_URL + '/campaigns/getOrgCampaigns', {orgID: orgID});
  }

  getCampaignRequests(campaignID: Number){
    return this.http.post(this.API_URL + '/campaigns/getCampaignRequests', {campaignID: campaignID});
  }

  manageCampaignRequest(campaignID: Number, orgID: String, action: String){
    return this.http.post(this.API_URL + '/campaigns/manageCampaignRequest', {campaignID: campaignID, orgID: orgID, action: action});
  }

  removeOrg(campaignID: Number, orgID: String){
    return this.http.post(this.API_URL + '/campaigns/removeOrg', {campaignID: campaignID, orgID: orgID});
  }

  getParentOrg(campaignID){
    return this.http.post(this.API_URL + '/campaigns/getParentOrg', {campaignID: campaignID});
  }

  updateParentOrg(campaignID, newParentOrg){
    return this.http.post(this.API_URL + '/campaigns/updateParentOrg', {campaignID: campaignID, newParentOrg});

  }



}
