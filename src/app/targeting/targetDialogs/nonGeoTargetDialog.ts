import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TargetService} from '../../services/target/target.service'
import {OrganizationService} from '../../services/organization/organization.service'
import {ScriptService} from '../../services/script/script.service'
import { Options } from 'ng5-slider'
import {FormControl} from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
    templateUrl: './nonGeoTargetDialog.html',
  })
  
  export class NonGeoTargetDialog implements OnInit{

    @ViewChild('targetName', {static: false}) targetName:ElementRef;
    @ViewChild('targetType', {static: false}) targetType: ElementRef;
    @ViewChild('scriptResponseType', {static: false}) scriptResponseType: ElementRef;
    @ViewChild('pav', {static: false}) pav: ElementRef;
    @ViewChild('precinct', {static: false}) precinct:ElementRef;
    @ViewChild('propensity', {static: false}) propensity:ElementRef;

    options: Options = {floor: 0, ceil: 100};
    showErrorMsg = false;
    targets = []
    scripts = []
    selectedScriptID: string;
    parties = new FormControl();

    cities = new FormControl();
    cityList: string[] = []
    partyList: string[] = [];
    propensityActive = false;
    members = false;
    scriptActive = false;
    scriptsSelected = []
    showAssetMap = environment.ASSET_MAP;
    orgID = ""
    blockgroupIDs = []
    selectedblockgroupIDs = new FormControl()
    prevIDCheckedflag = false;

    constructor(
        public dialogRef: MatDialogRef<NonGeoTargetDialog>, 
        public scriptService: ScriptService,
        //@Inject(MAT_DIALOG_DATA) public data: any, 
        public targetService: TargetService, 
        public orgService: OrganizationService) {
        }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    getAllScripts(){
      var campaignID = parseInt(localStorage.getItem('campaignID'))

      var orgID = localStorage.getItem('orgID')
      this.scriptService.getAllScripts(orgID, campaignID).subscribe((scripts: []) =>{
        this.scripts = scripts
      })
    }

    scriptSelected(script){
      if(!this.scriptsSelected.includes(script._id)){
        this.scriptsSelected.push(script._id)
      }else{
        for(var i = 0; i < this.scriptsSelected.length; i++){
          if(this.scriptsSelected[i] == script._id){
            this.scriptsSelected.splice(i,1)
            break
          }
        }
      }
      
      if(this.scriptsSelected.length > 0){
        this.scriptActive = true;
      }else{
        this.scriptActive = false;
      }
    }

    targetTypeSelected(scriptID: string){
      if(scriptID != ''){
        this.selectedScriptID = scriptID;

      } else{
        this.selectedScriptID = undefined;
      }
    }

    getParties(){
      this.targetService.getParties().subscribe(parties=>{
        this.partyList = parties['parties']
      })
    }

    getOrgBlockgroups(){
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var orgID = localStorage.getItem('orgID')
  
      this.targetService.getOrgTargets(campaignID, orgID).subscribe((targets: [])=>{
        for( var i = 0; i < targets.length; i++){
          if(targets[i]['properties']['params']['targetType'] === "CENSUSTRACT"){
            this.blockgroupIDs.push(targets[i]['properties']['params']['id'])
          }
        }
      })
    }

    prevIDChecked(checked){
      this.prevIDCheckedflag = checked
    }

    createTarget(){

      var cities = [];
      
      cities = this.cities.value

      var blockgroups = []

      blockgroups = this.selectedblockgroupIDs.value

      var targetName = this.targetName.nativeElement.value;
      var scriptID = ""
      var scriptResponse = ""
      
      if(this.scriptActive){
        scriptID = this.scriptsSelected[0]
        scriptResponse = this.scriptResponseType['value']
      }

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var orgID = localStorage.getItem('orgID')
      var userID = JSON.parse(localStorage.getItem('userProfile')).user._id

      var targetDetail = {
        targetName: targetName,
        type: "NONGEOGRAPHIC",
        campaignID: campaignID,
        orgID: orgID,
        userID: userID,
        scriptID: scriptID,
        scriptResponse: scriptResponse,
        cities: cities,
        blockgroups: blockgroups,
        prevIDChecked: this.prevIDCheckedflag
       }

      if(targetName != ""){
        this.showErrorMsg = false;

        console.log(targetDetail)
        
        this.targetService.createTarget(targetDetail).subscribe(result =>{
         this.dialogRef.close();
        })
         
      } else{
        this.showErrorMsg = true
      }
    }

    ngOnInit(){
      this.getOrgBlockgroups()
      this.getAllScripts()
      this.getParties();
      this.getCities();
      this.orgID = localStorage.getItem('orgID')
      
    }

    getCities(){

      this.cityList = ['ARLINGTON',
        'BLOOMINGTON','BIG BEAR CITY',    
        'CHINO','CHINO HILLS','COLTON',
        'FONTANA', 'HEMET','HIGHLAND',
        'JURUPA VALLEY','LOMA LINDA',
        'MONTCLAIR','ONTARIO',         
        'RANCHO','RANCHO CUCAMONGA','REDLANDS',
        'RIALTO',                  
        'RIVERSIDE','SAN BERNARDINO',     
        'TWIN PEAKS','UPLAND','YUCAIPA',
      ]

      /*
      this.orgService.getCities().subscribe((cities: []) =>{
        console.log(cities)
        this.cityList = cities
      })*/

    }
}
