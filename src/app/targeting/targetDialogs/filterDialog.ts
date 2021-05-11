import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TargetService} from '../../services/target/target.service'
import {OrganizationService} from '../../services/organization/organization.service'
import {ScriptService} from '../../services/script/script.service'
import {CensustractService} from '../../services/censustract/censustract.service'



@Component({
    templateUrl: './filterDialog.html',
  })
  
  export class FilterDialog implements OnInit{

    script: Object;
    notFound = false;
    tracts;
    tractsloading = true;
    @ViewChild('locationType', {static: false}) locationType:ElementRef;
    @ViewChild('languageCapacity', {static: false}) languageCapacity: ElementRef;

    constructor(
        public dialogRef: MatDialogRef<FilterDialog>, 
        //@Inject(MAT_DIALOG_DATA) public tracts: any, 
        public targetService: TargetService, 
        private scriptService: ScriptService,
        public orgService: OrganizationService,
        public censustractService: CensustractService) {
        }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    private getSurvey(){
      this.script = this.scriptService.getAssetScript()
    }

    initFilter(){
      var filter = {locationType: this.locationType['value'],
                    languageCapacity: this.languageCapacity['value']}
      this.dialogRef.close(filter);

    }

    centerBlockGroup(blockgroup){

      console.log(this.tracts)
      
      for(var i = 0; i < this.tracts.length; i++){
        if(this.tracts[i].properties.geoid === blockgroup.value){
          console.log(this.tracts[i].properties)
          this.dialogRef.close(this.tracts[i].properties);
          return
        }
      }
      this.notFound = true

    }

    getAllCensusTracts(){
      var bounds = {}
      this.censustractService.getAllCensusTracts(bounds).subscribe(tracts =>{
        console.log(tracts)
        this.tractsloading = false;
        this.tracts = tracts
      })
    }

    ngOnInit(){
      this.getAllCensusTracts();

      this.getSurvey();
    }
}