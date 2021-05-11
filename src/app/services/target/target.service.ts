import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TargetService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  
  lockTarget(orgID: String, tractData: Object, campaignID: Number){
    return this.http.post(this.API_URL + '/targets/lockTarget', {orgID: orgID, tractData: tractData, campaignID: campaignID});
  }

  unlockTarget(orgID: String, tractData: Object, campaignID: Number){
    return this.http.post(this.API_URL + '/targets/unlockTarget', {orgID: orgID, tractData: tractData, campaignID: campaignID});
  }

  createTarget(targetDetail: Object){
    return this.http.post(this.API_URL + '/targets/createTarget', targetDetail)
  }

  removeTarget(orgID: String, campaignID: Number, id: String, type: String){
    return this.http.post(this.API_URL + '/targets/removeTarget', {orgID: orgID, campaignID: campaignID, id: id, type: type});
  }

  getAllTargetProperties(campaignID: Number){
    return this.http.post(this.API_URL + '/targets/getAllTargetProperties', {campaignID: campaignID});
  }

  getAllTargets(campaignID: Number){
    return this.http.post(this.API_URL + '/targets/getAllTargets', {campaignID: campaignID});
  }

  getOrgTargets(campaignID: Number, orgID: String){
    return this.http.post(this.API_URL + '/targets/getOrgTargets', {campaignID: campaignID, orgID: orgID});

  }

  getAllAssetTargets(campaignID: Number){
    return this.http.post(this.API_URL + '/targets/getAllAssetTargets', {campaignID: campaignID});
  }

  getBlockGroups(target){
    return this.http.post(this.API_URL + '/targets/getBlockGroups', target);
  }

  editTarget(target: Object, newTarget: Object){
    return this.http.post(this.API_URL + '/targets/editTarget', {target: target, newTarget: newTarget})
  }

  getParties(){
    return this.http.post(this.API_URL + '/targets/getParties', {})
  }

}
