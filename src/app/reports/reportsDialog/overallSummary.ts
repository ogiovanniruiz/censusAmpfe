import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import {ReportService} from '../../services/report/report.service';
import {OrganizationService} from '../../services/organization/organization.service';
import {MatDialogRef, MatPaginator, PageEvent, Sort, MAT_DIALOG_DATA} from "@angular/material";
import {UserService} from '../../services/user/user.service';
import {StorageMap} from '@ngx-pwa/local-storage';

@Component({
  templateUrl: './overallSummary.html',
})

export class OverallSummary implements OnInit{

  allReports = [];
  sortedReports;

  totalsize: Number;
  currentPage = 0
  public pageSize = 10;
  public totalSize = 0;
  dataLoaded = false;
  dataLoadedValue = 0;

  pageEvent: PageEvent;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<OverallSummary>,
              public reportService: ReportService,
              public orgService: OrganizationService,
              public userService: UserService,
              private storage: StorageMap,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeSettings(){
    this.dialogRef.close("CLOSED")
  }

  getAllReports() {
      this.dataLoaded = true;
      this.checkReports();
  }

  async checkReports() {
      await this.storage.get('orgSummary').subscribe(async (orgSummary: []) => {
          await this.storage.get('petitionSummary').subscribe(async (petitionSummary: []) => {
              await this.storage.get('phonebankingSummary').subscribe(async (phonebankingSummary: []) => {
                  //await this.storage.get('textingSummary').subscribe(async (textingSummary: []) => {
                  if (orgSummary && petitionSummary && phonebankingSummary) {
                      this.allReports = await orgSummary;

                      for (let number in petitionSummary) {
                          var indexNum = await this.allReports.findIndex(x => x.org === petitionSummary[number]['org']);
                          this.allReports[indexNum].identified += await petitionSummary[number]['identified'];
                          this.allReports[indexNum].impressions += await petitionSummary[number]['identified'];
                          this.allReports[indexNum].total += await petitionSummary[number]['identified'];
                          this.sortedReports = await this.allReports.slice();
                          this.totalSize = this.allReports.length
                          this.iterator();
                      }

                      for (let numberPB in phonebankingSummary) {
                          var indexNumPB = await this.allReports.findIndex(y => y.org === phonebankingSummary[numberPB]['org']);
                          this.allReports[indexNumPB].identified += await phonebankingSummary[numberPB]['identified'];
                          this.allReports[indexNumPB].refuses += await phonebankingSummary[numberPB]['refuses'];
                          this.allReports[indexNumPB].impressions += await phonebankingSummary[numberPB]['impressions'];
                          this.allReports[indexNumPB].nonResponses += await phonebankingSummary[numberPB]['nonResponses'];
                          this.allReports[indexNumPB].total += await phonebankingSummary[numberPB]['total'];
                          this.sortedReports = await this.allReports.slice();
                          this.totalSize = this.allReports.length
                          this.iterator();
                      }

                      /*for (let numberT in textingSummary) {
                          var indexNumT = await this.allReports.findIndex(y => y.org === textingSummary[numberT]['org']);
                          this.allReports[indexNumT].identified += await textingSummary[numberT]['identified'];
                          this.allReports[indexNumT].refuses += await textingSummary[numberT]['refuses'];
                          this.allReports[indexNumT].impressions += await textingSummary[numberT]['impressions'];
                          this.allReports[indexNumT].nonResponses += await textingSummary[numberT]['nonResponses'];
                          this.allReports[indexNumT].total += await textingSummary[numberT]['total'];
                          this.sortedReports = await this.allReports.slice();
                          this.totalSize = this.allReports.length
                          this.iterator();
                      }*/
                      this.dataLoaded = false;
                  } else {
                      setTimeout(() => this.checkReports(), 5000);
                  }
                  //});
              });
          });
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
        case 'org': return compare(a.org, b.org, isAsc);
        case 'identified': return compare(a.identified, b.identified, isAsc);
        case 'refused': return compare(a.refuses, b.refuses, isAsc);
        case 'impressions': return compare(a.impressions, b.impressions, isAsc);
        case 'nonResponse': return compare(a.nonResponses, b.nonResponses, isAsc);
        case 'total': return compare(a.total, b.total, isAsc);
        default: return 0;
      }
    });

    if (sort.active === 'org') {
      var index = await this.sortedReports.findIndex(item => item.org === 'Total')
      this.sortedReports.push(this.sortedReports.splice(index, 1)[0]);
    }

    this.sortedReports.paginator = this.paginator;

  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
