import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatGridList} from '@angular/material';
import { OrgSummary } from './reportsDialog/orgSummary';
import { PetitionSummary } from './reportsDialog/petitionSummary';
import { OverallSummary } from './reportsDialog/overallSummary';
import { ScriptDetails } from './reportsDialog/scriptDetails';
import { EventsSummary } from './reportsDialog/eventsSummary';
import { BlockGroupCanvassSummary } from './reportsDialog/blockGroupCanvassSummary';
import { BlockGroupCanvassOrgSummary } from './reportsDialog/blockGroupCanvassOrgSummary';
import { BlockGroupOverallSummary } from './reportsDialog/blockGroupOverallSummary';
import { BlockGroupOrgSummary } from './reportsDialog/blockGroupOrgSummary';
import { PhonebankingSummary } from './reportsDialog/phonebankingSummary';
import { TextingSummary } from './reportsDialog/textingSummary';
import { PhonebankingUserSummary } from './reportsDialog/phonebankingUserSummary';
import {ReportService} from '../services/report/report.service';
import {OrganizationService} from '../services/organization/organization.service';
import {StorageMap} from '@ngx-pwa/local-storage';
import {MediaChange, MediaObserver} from '@angular/flex-layout';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  @ViewChild('grid', {static: true}) grid: MatGridList;
  @ViewChild('phonebankPicker', {static: false}) phonebankPicker: ElementRef;
  @ViewChild('eventsPickerStart', {static: false}) eventsPickerStart: ElementRef;
  @ViewChild('eventsPickerEnd', {static: false}) eventsPickerEnd: ElementRef;

  reportDialogName = [
    'Canvass Summary',
    'Petition Summary',
    'Phonebanking Summary',
    'Texting Summary',
    //'Overall Summary',
    //'Script Details',
    'Event Summary',
    'Block Group Canvass Summary',
    'Block Group Organization Canvass Summary',
    'Block Group Overall Summary',
    'Block Group Organization Summary',
    'Phonebanking Summary By User'
  ];

  allReportsOrg = [];
  allReportsPetition = [];
  allReportsPhonebanking = [];
  dataLoadedValue = 0;

  dialogRef: any;

  gridByBreakpoint = {
      xl: 4,
      lg: 4,
      md: 3,
      sm: 2,
      xs: 1
  }

  constructor(private observableMedia: MediaObserver,
              public dialog: MatDialog,
              public reportService: ReportService,
              public orgService: OrganizationService,
              private storage: StorageMap,
              ) {}

  async ngOnInit() {

    /*
    var campaignID = parseInt(localStorage.getItem('campaignID'))

    await this.storage.get('orgSummaryTime').subscribe(async (orgSummaryTime: []) => {
      if (!orgSummaryTime || Math.abs((orgSummaryTime as any) - (new Date() as any)) > (10 * 60 * 1000)) {
        this.storage.delete('orgSummary').subscribe(() => {});
        this.orgService.getCampaignOrgs(campaignID).subscribe(orgs => {
          this.allReportsOrg[0] = [];
          for(var i = 0; i < Object.keys(orgs).length; i++){
            this.reportService.getCanvassSummaryReport(campaignID, orgs[i]._id, orgs[i].name).subscribe(async (reports: any[]) => {
              this.allReportsOrg = await this.allReportsOrg.concat(reports);
              var identifiedTotals = 0;
              var refusedTotals = 0;
              var impressionsTotals = 0;
              var nonResponseTotals = 0;
              var uniquePeopleTotals = 0;
              for(var j = 1; j < this.allReportsOrg.length; j++){
                identifiedTotals += this.allReportsOrg[j].identified;
                refusedTotals += this.allReportsOrg[j].refuses;
                impressionsTotals += this.allReportsOrg[j].impressions;
                nonResponseTotals += this.allReportsOrg[j].nonResponses;
                uniquePeopleTotals += this.allReportsOrg[j].uniquePeople;
              }
              var totals = await identifiedTotals + refusedTotals + nonResponseTotals;
              this.allReportsOrg[0].org = 'Total';
              this.allReportsOrg[0].identified = identifiedTotals;
              this.allReportsOrg[0].refuses = refusedTotals;
              this.allReportsOrg[0].impressions = impressionsTotals;
              this.allReportsOrg[0].nonResponses = nonResponseTotals;
              this.allReportsOrg[0].uniquePeople = uniquePeopleTotals;
              this.allReportsOrg[0].total = totals;
              this.dataLoadedValue = ((this.allReportsOrg.length - 1) / Object.keys(orgs).length) * 100;
              if(this.dataLoadedValue === 100){
                this.storage.set('orgSummary', this.allReportsOrg).subscribe(() => {});
                this.storage.set('orgSummaryTime', new Date()).subscribe(() => {});
              }
            });
          }
        });
      }
    });

    await this.storage.get('petitionSummaryTime').subscribe(async (petitionSummaryTime: []) => {
      if (!petitionSummaryTime || Math.abs((petitionSummaryTime as any) - (new Date() as any)) > (10 * 60 * 1000)) {
        this.storage.delete('petitionSummary').subscribe(() => {});
        this.orgService.getCampaignOrgs(campaignID).subscribe(orgs => {
          this.allReportsPetition[0] = [];
          for(var i = 0; i < Object.keys(orgs).length; i++){
            this.reportService.getPetitionSummaryReport(campaignID, orgs[i]._id, orgs[i].name).subscribe(
                async (reports: any[]) => {
                  this.allReportsPetition = await this.allReportsPetition.concat(reports);
                  var identifiedTotals = 0;
                  for(var j = 1; j < this.allReportsPetition.length; j++){
                    identifiedTotals += this.allReportsPetition[j].identified;
                  }
                  this.allReportsPetition[0].org = 'Total';
                  this.allReportsPetition[0].identified = identifiedTotals;
                  this.dataLoadedValue = ((this.allReportsPetition.length - 1) / Object.keys(orgs).length) * 100;
                  if(this.dataLoadedValue === 100){
                    this.storage.set('petitionSummary', this.allReportsPetition).subscribe(() => {});
                    this.storage.set('petitionSummaryTime', new Date()).subscribe(() => {});
                  }
                }
            );
          }
        });
      }
    });

    await this.storage.get('phonebankingSummaryTime').subscribe(async (phonebankingSummaryTime: []) => {
      if (!phonebankingSummaryTime || Math.abs((phonebankingSummaryTime as any) - (new Date() as any)) > (10 * 60 * 1000)) {
        this.storage.delete('phonebankingSummary').subscribe(() => {});
        this.orgService.getCampaignOrgs(campaignID).subscribe(orgs => {
          this.allReportsPhonebanking[0] = [];
          for(var i = 0; i < Object.keys(orgs).length; i++){
            this.reportService.getPhonebankingSummaryReport(campaignID, orgs[i]._id, orgs[i].name).subscribe(
                async (reports: any[]) => {
                  this.allReportsPhonebanking = await this.allReportsPhonebanking.concat(reports);
                  var identifiedTotals = 0;
                  var refusedTotals = 0;
                  var impressionsTotals = 0;
                  var nonResponseTotals = 0;
                  var uniquePeopleTotals = 0;
                  for(var j = 1; j < this.allReportsPhonebanking.length; j++){
                    identifiedTotals += this.allReportsPhonebanking[j].identified;
                    refusedTotals += this.allReportsPhonebanking[j].refuses;
                    impressionsTotals += this.allReportsPhonebanking[j].impressions;
                    nonResponseTotals += this.allReportsPhonebanking[j].nonResponses;
                    uniquePeopleTotals += this.allReportsPhonebanking[j].uniquePeople;
                  }
                  var totals = await identifiedTotals + refusedTotals + nonResponseTotals
                  this.allReportsPhonebanking[0].org = 'Total';
                  this.allReportsPhonebanking[0].identified = identifiedTotals;
                  this.allReportsPhonebanking[0].refuses = refusedTotals;
                  this.allReportsPhonebanking[0].impressions = impressionsTotals;
                  this.allReportsPhonebanking[0].nonResponses = nonResponseTotals;
                  this.allReportsPhonebanking[0].uniquePeople = uniquePeopleTotals;
                  this.allReportsPhonebanking[0].total = totals;
                  this.dataLoadedValue = ((this.allReportsPhonebanking.length - 1) / Object.keys(orgs).length) * 100;
                  if(this.dataLoadedValue === 100){
                    this.storage.set('phonebankingSummary', this.allReportsPhonebanking).subscribe(() => {});
                    this.storage.set('phonebankingSummaryTime', new Date()).subscribe(() => {});
                  }
                }
            );
          }
        });
      }
    });

    */
  }

  openReportsDialog(dialogName): void {
    var phonebankPicker = this.phonebankPicker['_selected'] ? new Date(this.phonebankPicker['_selected']).toISOString().slice(0, 10) : '';
    var eventsPickerStart = this.eventsPickerStart['_selected'] ? new Date(this.eventsPickerStart['_selected']).toISOString().slice(0, 10) : '';
    var eventsPickerEnd = this.eventsPickerEnd['_selected'] ? new Date(this.eventsPickerEnd['_selected']).toISOString().slice(0, 10) : '';

    if(dialogName === 'Canvass Summary'){ this.dialogRef = this.dialog.open(OrgSummary); }
    if(dialogName === 'Petition Summary'){ this.dialogRef = this.dialog.open(PetitionSummary); }
    if(dialogName === 'Phonebanking Summary'){ this.dialogRef = this.dialog.open(PhonebankingSummary); }
    if(dialogName === 'Texting Summary'){ this.dialogRef = this.dialog.open(TextingSummary); }
    //if(dialogName === 'Overall Summary'){ this.dialogRef = this.dialog.open(OverallSummary); }
    //if(dialogName === 'Script Details'){ this.dialogRef = this.dialog.open(ScriptDetails); }
    if(dialogName === 'Event Summary'){ this.dialogRef = this.dialog.open(EventsSummary, {data: {dateStart:eventsPickerStart, dateEnd: eventsPickerEnd}}); }
    if(dialogName === 'Block Group Canvass Summary'){ this.dialogRef = this.dialog.open(BlockGroupCanvassSummary); }
    if(dialogName === 'Block Group Organization Canvass Summary'){ this.dialogRef = this.dialog.open(BlockGroupCanvassOrgSummary); }
    if(dialogName === 'Block Group Overall Summary'){ this.dialogRef = this.dialog.open(BlockGroupOverallSummary); }
    if(dialogName === 'Block Group Organization Summary'){ this.dialogRef = this.dialog.open(BlockGroupOrgSummary); }
    if(dialogName === 'Phonebanking Summary By User'){ this.dialogRef = this.dialog.open(PhonebankingUserSummary, {data:phonebankPicker}); }

    this.dialogRef.afterClosed().subscribe(result => {});
  }

  ngAfterContentInit() {
     this.observableMedia.media$.subscribe((change: MediaChange) => {
         this.grid.cols = this.gridByBreakpoint[change.mqAlias];
     });
  }

}
