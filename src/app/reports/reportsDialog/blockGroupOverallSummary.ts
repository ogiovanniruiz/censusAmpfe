import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import {ReportService} from '../../services/report/report.service';
import {OrganizationService} from '../../services/organization/organization.service';
import {MatDialogRef, MatPaginator, PageEvent, Sort, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service';

@Component({
  templateUrl: './blockGroupOverallSummary.html',
})

export class BlockGroupOverallSummary implements OnInit{

  allReports = [];
  sortedReports;

  totalsize: Number;
  currentPage = 0
  public pageSize = 10;
  public totalSize = 0;
  dataLoaded = false;
  dataLoadedValue = 0;
  dataLoadedNum = 1;
  dataLoadedTotal = 0;

  pageEvent: PageEvent;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<BlockGroupOverallSummary>,
              public reportService: ReportService,
              public orgService: OrganizationService,
              public userService: UserService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  closeSettings(){
    this.dialogRef.close('CLOSED');
  }

  async getAllReports() {
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.dataLoaded = true;

    this.orgService.getCampaignOrgs(campaignID).subscribe(async orgs => {
      this.allReports[0] = [];

      for (let i in orgs) {
        this.reportService.getBlockGroupOverallSummaryReport(campaignID, orgs[i]._id).subscribe(async (reports: any[]) => {
          if (reports) {

            for (var j = reports.length - 1; j >= 0; j--) {
              if (this.allReports.findIndex(x => x.blockGroup === reports[j].blockGroup) >= 0) {
                var num = await this.allReports.findIndex(x => x.blockGroup === reports[j].blockGroup)
                this.allReports[num].identified += await reports[j].identified;
                this.allReports[num].refuses += await reports[j].refuses;
                this.allReports[num].impressions += await reports[j].impressions;
                this.allReports[num].nonResponses += await reports[j].nonResponses;
                this.allReports[num].total += await reports[j].total;
                await reports.splice(Number(j), 1);
              }
            }

            this.allReports = await this.allReports.concat(reports);

            var identifiedTotals = 0;
            var refusedTotals = 0;
            var impressionsTotals = 0;
            var nonResponseTotals = 0;

            for(var j = 1; j < this.allReports.length; j++){
              identifiedTotals += this.allReports[j].identified;
              refusedTotals += this.allReports[j].refuses;
              impressionsTotals += this.allReports[j].impressions;
              nonResponseTotals += this.allReports[j].nonResponses;
            }
            var totals = await identifiedTotals + refusedTotals + nonResponseTotals
            this.allReports[0].blockGroup = 'Total';
            this.allReports[0].identified = identifiedTotals;
            this.allReports[0].refuses = refusedTotals;
            this.allReports[0].impressions = impressionsTotals;
            this.allReports[0].nonResponses = nonResponseTotals;
            this.allReports[0].total = totals;

            this.sortedReports = this.allReports.slice();
            this.totalSize = this.allReports.length
            this.iterator();
          }
          this.dataLoadedValue = (this.dataLoadedNum / Object.keys(orgs).length) * 100;
          if(this.dataLoadedValue === 100){this.dataLoaded = false;}
          this.dataLoadedNum++
        });
      }
    });
  }

  ngOnInit(){
    this.getAllReports();
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
    return e
  }

  private iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.allReports.slice(start, end);
    this.sortedReports = part;
  }

  async sortData(sort: Sort) {
    const data = this.allReports.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedReports = data;
      return;
    }

    this.sortedReports = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'blockGroup': return compare(a.blockGroup, b.blockGroup, isAsc);
        case 'identified': return compare(a.identified, b.identified, isAsc);
        case 'refused': return compare(a.refuses, b.refuses, isAsc);
        case 'impressions': return compare(a.impressions, b.impressions, isAsc);
        case 'nonResponse': return compare(a.nonResponses, b.nonResponses, isAsc);
        case 'total': return compare(a.total, b.total, isAsc);
        default: return 0;
      }
    });

    if (sort.active === 'blockGroup') {
      var index = await this.sortedReports.findIndex(item => item.blockGroup === 'Total')
      this.sortedReports.push(this.sortedReports.splice(index, 1)[0]);
    }

    this.sortedReports.paginator = this.paginator;

  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
