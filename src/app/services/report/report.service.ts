import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Capability } from 'protractor';

@Injectable({
  providedIn: 'root'
})

export class ReportService {

  private API_URL = environment.API_URL;
  constructor(private http: HttpClient, private storage: StorageMap) {}

  getCanvassSummaryReport(campaignID: Number, orgID: Number, orgName: String){
    return this.http.post(this.API_URL + '/report/getCanvassSummaryReport', {campaignID: campaignID, orgID: orgID, orgName: orgName})
  }

  getPetitionSummaryReport(campaignID: Number, orgID: Number, orgName: String){
    return this.http.post(this.API_URL + '/report/getPetitionSummaryReport', {campaignID: campaignID, orgID: orgID, orgName: orgName})
  }

  getOverallSummaryReport(campaignID: Number, orgID: Number, orgName: String){
    return this.http.post(this.API_URL + '/report/getOverallSummaryReport', {campaignID: campaignID, orgID: orgID, orgName: orgName})
  }

  getEventsSummaryReport(campaignID: Number, dates: object){
    return this.http.post(this.API_URL + '/report/getEventsSummaryReport', {campaignID: campaignID, dates: dates})
  }

  getBlockGroupCanvassSummaryReport(campaignID: Number, orgID: String){
    return this.http.post(this.API_URL + '/report/getBlockGroupCanvassSummaryReport', {campaignID: campaignID, orgID: orgID})
  }

  getBlockGroupOverallSummaryReport(campaignID: Number, orgID: String){
    return this.http.post(this.API_URL + '/report/getBlockGroupOverallSummaryReport', {campaignID: campaignID, orgID: orgID})
  }

  getPhonebankingSummaryReport(campaignID: Number, orgID: String, orgName: String){
    return this.http.post(this.API_URL + '/report/getPhonebankingSummaryReport', {campaignID: campaignID, orgID: orgID, orgName: orgName})
  }

  getTextingSummaryReport(campaignID: Number, orgID: String, orgName: String){
    return this.http.post(this.API_URL + '/report/getTextingSummaryReport', {campaignID: campaignID, orgID: orgID, orgName: orgName})
  }

  getPhonebankingUserSummaryReport(campaignID: Number, orgID: String, users: Object, date: String){
    return this.http.post(this.API_URL + '/report/getPhonebankingUserSummaryReport', {campaignID: campaignID, orgID: orgID, users: users, date: date})
  }

  getActivitiesSummaryReport(activities: Object){
    return this.http.post(this.API_URL + '/report/getActivitiesSummaryReport', {activities: activities})
  }

}
