import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TargetService} from '../../services/target/target.service'
import {OrganizationService} from '../../services/organization/organization.service'
import {ScriptService} from '../../services/script/script.service'

@Component({
    templateUrl: './polyTargetDialog.html',
  })
  
  export class PolyTargetDialog implements OnInit{

    getAllScripts(){
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var orgID = localStorage.getItem('orgID')
      this.scriptService.getAllScripts(orgID, campaignID).subscribe((scripts: []) =>{
        this.scripts = scripts
      })
    }

    targetTypeSelected(scriptID: string){
      if(scriptID != ''){
        this.selectedScriptID = scriptID;

      } else{
        this.selectedScriptID = undefined;
      }
    }

    @ViewChild('targetName', {static: false}) targetName:ElementRef;
    @ViewChild('targetType', {static: false}) targetType: ElementRef;
    @ViewChild('scriptResponseType', {static: false}) scriptResponseType: ElementRef;
    @ViewChild('tags', {static: false}) tags: ElementRef;
    targets = []
    scripts = []
    selectedScriptID: string;

    showErrorMsg = false;

    constructor(
        public dialogRef: MatDialogRef<PolyTargetDialog>, 
        public scriptService: ScriptService,
        @Inject(MAT_DIALOG_DATA) public data: any, 
        public targetService: TargetService, 
        public orgService: OrganizationService) {
        }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    createTarget(){
      var targetName = this.targetName.nativeElement.value;

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var orgID = localStorage.getItem('orgID')
      var userID = JSON.parse(localStorage.getItem('userProfile')).user._id

      var targetDetail = {
        targetName: targetName,
        type: "POLYGON",
        campaignID: campaignID,
        orgID: orgID,
        userID: userID,
        scriptID: "",
        tags: [],
        scriptResponseType: "",
        targetType: this.targetType['value'],
        geometry: this.data.createdPolygon.geometry
       }

      if(this.targetType['value'] === "SCRIPT"){
        targetDetail.scriptID = this.selectedScriptID;
        targetDetail.scriptResponseType = this.scriptResponseType['value']
      }

      if(this.targetType['value'] === "TAG"){
        targetDetail.tags = this.tags['value']
      }

      if(targetName != ""){
        this.showErrorMsg = false;
        this.targetService.createTarget(targetDetail).subscribe(result =>{
          this.dialogRef.close(result);
        })
         
      } else{
        this.showErrorMsg = true
      }

    
    }

    removeTarget(){

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var orgID = localStorage.getItem('orgID')

      var id = this.data.selectedPolygon._id
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      this.targetService.removeTarget(orgID, campaignID, id, "POLYGON").subscribe(target => {
        this.dialogRef.close(target);
      })
    }

    ngOnInit(){
      this.getAllScripts()
    }
}