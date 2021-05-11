import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {TargetService} from '../../services/target/target.service'
import {OrganizationService} from '../../services/organization/organization.service'
import {CensustractService} from '../../services/censustract/censustract.service'
import {Sort} from '@angular/material/sort';

@Component({
    templateUrl: './targetSummaryDialog.html',
  })
  
  export class TargetSummaryDialog implements OnInit{

    @ViewChild('targetName', {static: false}) targetName:ElementRef;
    @ViewChild('targetType', {static: false}) targetType: ElementRef;
    showErrorMsg = false;
    orgTargets = []
    allTargets = []
    tracts = []
    campaignOrgs: any;
    sortedTotalTargets = [];
    sortedOverlappingTargets = [];

    constructor(
        public dialogRef: MatDialogRef<TargetSummaryDialog>, 
        //@Inject(MAT_DIALOG_DATA) public data: any, 
        public targetService: TargetService, 
        public orgService: OrganizationService,
        public censustractService: CensustractService) {
        }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    getCampaignOrgs(){
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      this.orgService.getCampaignOrgs(campaignID).subscribe(orgs=>{
        this.campaignOrgs = orgs;
        this.getAllTargets();
      })
    }

    getAllTargets(){
      var campaignID = parseInt(localStorage.getItem('campaignID'))
      this.targetService.getAllTargets(campaignID).subscribe((targets: []) =>{
        this.allTargets = targets;
        
        this.getAllCensusTracts() 
      })
    }

    buildTotalTargetsNumber(){

      for(var i = 0; i < this.campaignOrgs.length; i++){

        var counter = 0
        var hhCount = 0
        for(var j = 0; j < this.allTargets.length; j++){
          if(this.campaignOrgs[i]._id === this.allTargets[j].properties.orgID && this.allTargets[j].properties.params.targetType === "CENSUSTRACT"){
            counter = counter + 1            
          }

          for(var k = 0; k < this.tracts.length; k++){
            
            if(this.tracts[k].properties.geoid === this.allTargets[j].properties.params.id && this.campaignOrgs[i]._id === this.allTargets[j].properties.orgID){
              hhCount = hhCount + this.tracts[k].properties.numOccupiedUnits
            }
        
          }
        }

        this.sortedTotalTargets.push({org: this.campaignOrgs[i], totalTargets: counter, hh: hhCount})
      }
    }

    getAllCensusTracts(){
      var bounds = {}
      this.censustractService.getAllCensusTracts(bounds).subscribe(tracts =>{
        this.tracts = tracts
        this.buildTotalTargetsNumber();
        for(var i = 0; i < tracts.length; i++){
          if(tracts[i].properties.lrs >= 27.0){
            var organizations = [];
            for(var j = 0; j < this.allTargets.length; j++){
              if(tracts[i].properties.geoid === this.allTargets[j].properties.params.id){

                for(var k = 0; k < this.campaignOrgs.length; k++){
                  if(this.campaignOrgs[k]._id === this.allTargets[j].properties.orgID){
                    organizations.push(this.campaignOrgs[k].name)
                    break;
                  }
                }
              }
            }
            this.sortedOverlappingTargets.push({blockGroup: tracts[i].properties.geoid, organizations: organizations, hh: tracts[i].properties.numOccupiedUnits });
          }
        }
      })
    }

    getOrgTargets(){
      var campaignID = parseInt(localStorage.getItem('campaignID'));
      var orgID = localStorage.getItem('orgID');
  
      this.targetService.getOrgTargets(campaignID, orgID).subscribe((targets: [])=>{
        console.log(targets)
        this.orgTargets = targets;
      });
    }

    removeTarget(targetID: String){
      console.log(targetID)

      var campaignID = parseInt(localStorage.getItem('campaignID'))
      var orgID = localStorage.getItem('orgID')


      this.targetService.removeTarget(orgID, campaignID, targetID, "NONGEOGRAPHIC").subscribe(target => {
        this.dialogRef.close(target);
      })
    }

    sortTotalTargets(sort: Sort) {
      const data = this.sortedTotalTargets.slice();
      if (!sort.active || sort.direction === '') {
        this.sortedTotalTargets = data;
        return;
      }
  
      this.sortedTotalTargets = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'name': return compare(a.org.name, b.org.name, isAsc);
          case 'totalNumber': return compare(a.totalNumber, b.totalNumber, isAsc);
          case 'hh': return compare(a.hh, b.hh, isAsc);
          default: return 0;
        }
      });
    }

    sortOverlappingTargets(sort: Sort) {

      const data = this.sortedOverlappingTargets.slice();
      if (!sort.active || sort.direction === '') {
        this.sortedOverlappingTargets = data;
        return;
      }
  
      this.sortedOverlappingTargets= data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'name': return compare(a.name, b.name, isAsc);
          case 'totalNumber': return compare(a.organizations.length, b.organizations.length, isAsc);
          case 'hhNumber': return compare(a.hh, b.hh, isAsc);
          default: return 0;
        }
      });
    }


    ngOnInit(){
      this.getOrgTargets();
      //this.getCampaignOrgs();

    }
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}