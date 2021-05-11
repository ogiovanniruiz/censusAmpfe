import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private API_URL= environment.API_URL;

  constructor(private http: HttpClient) { }

  createScript(script: Object){
    return this.http.post(this.API_URL + '/scripts/createScript', script);
  }

  editScript(script:Object, scriptID: String){
    return this.http.post(this.API_URL + '/scripts/editScript', {script, scriptID});
  }

  getScript(script: Object){
    return this.http.post(this.API_URL + '/scripts/getScript', script);
  }

  getActivityScripts(scriptIDs: any[]){
    return this.http.post(this.API_URL + '/scripts/getActivityScripts', scriptIDs);
  }

  getAllScripts(orgID: String, campaignID: Number){
    return this.http.post(this.API_URL + '/scripts/getAllScripts', {orgID: orgID, campaignID: campaignID});
  }

  getEveryScript(){
    return this.http.post(this.API_URL + '/scripts/getEveryScript', {});
  }


  deleteScript(script: Object){
    return this.http.post(this.API_URL + '/scripts/deleteScript', script);
  }

  getAssetScript(){

    var res = [{question: "Location Name",
                responses: [],
                questionType: "TEXT"},

               {question: "Services Provided",
                responses: [],
                questionType: "TEXT"},

               {question: "Age Groups Served",
                questionType: "MULTISELECT",
               
                responses: [{response: "0-17"},
                            {response: "18-35"},
                            {response: "36-54"},
                            {response: "55+"}]},
           
          {question: "ADA Accessible",
           responses: [{response: "Yes"},
                       {response: "No"}],
           questionType: "RADIO"},

          {question: "Wifi Available",
           responses: [{response: "Yes"},
                       {response: "No"}],
           questionType: "RADIO"},

          {question: "Parking Type",
           responses: [{response: "Public"},
                       {response: "Private"},
                       {response: "Both"}],
           questionType: "RADIO"},

          {question: "Racial/Ethinic Group Served",
           responses: [{response:"Asian", hasChildren: true, children:[ 'Pan-ethnic',
                                                                        'Indian',
                                                                        'Filipino',
                                                                        'Chinese',
                                                                        'Vietnamese',
                                                                        'Korean',
                                                                        'Japanese',
                                                                        'Indonesian',
                                                                        'other']},

                       {response: "Black", hasChildren: true, children:[  'Pan-ethnic',
                                                                          'African American',
                                                                          'African',
                                                                          'Caribbean']}, 
                       {response: "Latinx", hasChildren: true, children:[ 'Pan-ethnic', 
                                                                          'Mexican',
                                                                          'Salvadorean',
                                                                          'Guatemalan',
                                                                          'Puerto Rican', 
                                                                          'Cuban',
                                                                          'Carribean',
                                                                          'other']}, 
                       {response: "Indigenous", hasChildren: false, children:[]}, 
                       {response: "White", hasChildren: false, children:[]}, 
                       {response: "No Focus", hasChildren: false, children:[]}],
           questionType: "MULTISELECTCHILDREN",
            childrenType: "SELECT"
          },

         {question: "Language Capacity",
          
          responses: [{response: "Arabic"},
                      {response: "Chinese"}, 
                      {response: "English"}, 
                      {response: "Korean"}, 
                      {response: "Spanish"},
                      {response: "Tagalog"},
                      {response: "Vietnamese"},
                      {response: "Other"}],
          questionType: "MULTISELECT"},

         {question: "Hours of Operation",
          responses:[{response: "Monday", hasChildren: true, children:["time"]},
                     {response: "Tuesday", hasChildren: true, children:["time"]},
                     {response: "Wednesday", hasChildren: true, children:["time"]},
                     {response: "Thursday", hasChildren: true, children:["time"]},
                     {response: "Friday", hasChildren: true, children:["time"]},
                     {response: "Saturday", hasChildren: true, children:["time"]},
                     {response: "Sunday", hasChildren: true, children:["time"]}],
          questionType: "MULTISELECTCHILDRENTIME",
          childrenType: "TIME"
        },

          {question: "Location Type",
           responses: [{response: "College or University", hasChildren: true, children:["Private College",
                                                                                        "Junior College", 
                                                                                        "Cal State University", 
                                                                                        "University of California",
                                                                                        "Graduate School"]}, 
                        {response: "Bank", hasChildren: true, children:["Bank of America", 
                                                                        "Chase", 
                                                                        "Citigroup", 
                                                                        "Wells Fargo",
                                                                        "Credit Union",
                                                                        "Other"]}, 
                        {response: "Child Care", hasChildren: false, children:[]}, 
                        {response: "Community Center", hasChildren: false, children:[] },
                        {response: "Consulate", hasChildren: true, children:["Guatemala",
                                                                             "Mexico",
                                                                             "China"]},
                        {response: "Dispensery", hasChildren: false, children:[]}, 
                        {response: "Faith Based Insitution", hasChildren: true, children:["Catholic",
                                                                                          "Christian-Mainline Protestant",
                                                                                          "Christian-Evangelical",
                                                                                          "Christian-Other",
                                                                                          "Mormon",
                                                                                          "Unitarian-Universalist",
                                                                                          "Hindu",
                                                                                          "Buddhist",
                                                                                          "Sikh",
                                                                                          "Muslim",
                                                                                          "Jewish",
                                                                                          "Other"]}, 
                        {response: "Food Distribution Center", hasChildren: false, children:[] },
                        {response: "Grade School", hasChildren: true, children:["Pre-k",
                                                                                 "Elementary",
                                                                                 "Middle or Junior High",
                                                                                 "High School",
                                                                                 "Charter",
                                                                                 "Private",]},
                        {response: "Grocery Store", hasChildren: false, children:[]}, 
                        {response: "Health Facility", hasChildren: false, children:[]}, 
                        {response: "Homeless Shelter", hasChildren: false, children:[]}, 
                        {response: "Library", hasChildren: false, children:[] },
                        {response: "Market", hasChildren: true, children:[ "Farmers Market",
                                                                            "Swap Meet",]},
                        {response: "Non-profit Organization", hasChildren: false, children:[]}, 
                        {response: "Prison System", hasChildren: false, children:[ "Prison",
                                                                                   "Jail",
                                                                                   "Detention Center",]}, 
                        {response: "Recreation Center", hasChildren: false, children:[] },
                        {response: "Small Business", hasChildren: false, children:[]},
                        {response: "Staffing Agency", hasChildren: false, children:[]},
                        {response: "Transportation Center", hasChildren: false, children:[]}, 
                        {response: "Union", hasChildren: false, children:[]}, 
                        {response: "Workforce Development Center", hasChildren: false, children:[] },
                        {response: "Other", hasChildren: false, children:[]}],
            questionType: "SINGLESELECT"}
        ]
        return res
  }
}
