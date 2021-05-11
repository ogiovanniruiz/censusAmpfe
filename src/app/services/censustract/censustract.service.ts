import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CensustractService {

  private API_URL = environment.API_URL;
  constructor(private http: HttpClient) { }

  getAllCensusTracts(bounds){
    return this.http.post<any>(this.API_URL + '/censustracts/getAllCensusTracts', {bounds: bounds});
  }

  getAllBlockGroups(){
    return this.http.post<any>(this.API_URL + '/censustracts/getAllBlockGroups', {});

  }

  uploadOccupancy(formData: any){
    return this.http.post(this.API_URL + '/censustracts/uploadOccupancy', formData)
  }

}
