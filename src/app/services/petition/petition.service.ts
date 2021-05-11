import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Capability } from 'protractor';

@Injectable({
  providedIn: 'root'
})

export class PetitionService {

  private API_URL = environment.API_URL;
  constructor(private http: HttpClient, private storage: StorageMap) {}

  createPerson(person: Object, address: String, unit: String, city: String, county: String, zip: String){
    return this.http.post(this.API_URL + '/petition/createPerson', {person: person, address: address, unit: unit, city: city, county: county, zip: zip})
  }

  updatePerson(person: Object, newDetail: Object){
    return this.http.post(this.API_URL + '/petition/updatePerson', {person: person, newDetail: newDetail})
  }

  getNumSub(activityID: string){
    return this.http.post(this.API_URL + '/petition/getNumSub', {activityID: activityID})
  }

  storeCounty(county: any){
    this.storage.set('petitionCounty', county).subscribe(() => {})
  }

  getCounty(){
    return this.storage.get('petitionCounty')
  }
  
  generateLink(petitionDetails){
    return this.http.post(this.API_URL + '/petition/generateLink', petitionDetails)
  }

  wipePetitions(petitionID){
    return this.http.post(this.API_URL + '/petition/wipePetitions', {petitionID})
  }

  processLink(linkID: string){
    return this.http.post(this.API_URL + '/petition/processLink', {linkID: linkID})
  }

  uploadPetitions(formData){
    return this.http.post(this.API_URL + '/petition/uploadPetitions', formData)
  }
}
