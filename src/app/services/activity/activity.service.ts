import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) { }

  createActivity(activityDetail: Object){
    return this.http.post(this.API_URL + '/activities/createActivity', activityDetail);
  }

  getActivities(campaignID: Number, orgID: String, activityType: String){
    return this.http.post(this.API_URL + '/activities/getActivities', {campaignID: campaignID, orgID: orgID, activityType: activityType});
  }

  getEvents(campaignID: Number, orgID: String){
    return this.http.post(this.API_URL + '/activities/getEvents', {campaignID, orgID});
  }

  editActivity(campaignID: Number, activityID: String, activityType: String, newActivityDetail: Object, orgID: String){
    return this.http.post(this.API_URL + '/activities/editActivity', {campaignID: campaignID, activityID: activityID, activityType: activityType, newActivityDetail: newActivityDetail, orgID: orgID});
  }

  deleteActivity(campaignID: Number, activityID: String, activityType: String, orgID: String){
    return this.http.post(this.API_URL + '/activities/deleteActivity', {campaignID: campaignID, activityID: activityID, activityType: activityType, orgID: orgID});
  }

  getActivity(campaignID: Number, activityID: String, activityType: String){
    return this.http.post(this.API_URL + '/activities/getActivity', {campaignID: campaignID, activityID: activityID, activityType: activityType})
  }

  completeActivity(campaignID: Number, activityID: String, activityType: String){
    return this.http.post(this.API_URL + '/activities/completeActivity', {campaignID: campaignID, activityID: activityID, activityType: activityType});
  }

  activitySwordOutreachData(campaignID: Number, orgID: String, activityID: String, activityType: String){
    return this.http.post(this.API_URL + '/activities/activitySwordOutreachData', {campaignID: campaignID, orgID: orgID, activityID: activityID, activityType: activityType});
  }
  sendSwordOutreachAPI(campaignID: Number, activityID: String, activityType: String, report){
    return this.http.post(this.API_URL + '/activities/sendSwordOutreach', {campaignID: campaignID, activityID: activityID, activityType: activityType, report: report});
  }

  activityTextImpressionsSwordOutreachData(campaignID: Number, orgID: String, activityID, activityType: String){
    return this.http.post(this.API_URL + '/activities/activityTextImpressionsSwordOutreachData', {campaignID: campaignID, orgID: orgID, activityID: activityID, activityType: activityType});
  }

  sendTextImpressionsSwordOutreachAPI(campaignID: Number, activityID: String, activityType: String, report){
    return this.http.post(this.API_URL + '/activities/sendTextImpressionsSwordOutreach', {campaignID: campaignID, activityID: activityID, activityType: activityType, report: report});
  }

  resetActivity(activityID: String, activityType: String){
    return this.http.post(this.API_URL + '/activities/resetActivity', {activityID: activityID, activityType: activityType})
  }

  releaseNumber(campaignID, activityID, activityType, number){
    return this.http.post(this.API_URL + '/activities/releaseNumber', {campaignID: campaignID, activityID: activityID, activityType: activityType, number: number})

  }


}
