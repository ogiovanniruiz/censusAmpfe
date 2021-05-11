import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import {ReportService} from '../../services/report/report.service'
import {MatDialogRef, MatPaginator, PageEvent, Sort, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user/user.service';

@Component({
  templateUrl: './eventsSummary.html',
})

export class EventsSummary implements OnInit{

  allReports = [];
  sortedReports;

  totalsize: Number;
  currentPage = 0
  public pageSize = 10;

  public totalSize = 0;

  pageEvent: PageEvent;

  languages = {
    arabic: 'Arabic',
    armenian: 'Armenian',
    assyrian_neo_aramaic: 'Assyrian Neo-Aramaic',
    cantonese: 'Cantonese',
    chaldean_neo_aramaic: 'Chaldean Neo-Aramaic',
    chinese: 'Chinese',
    farsi: 'Farsi',
    filipino: 'Filipino',
    hindi: 'Hindi',
    hmong: 'Hmong',
    iu_mien: 'Iu Mien',
    japanese: 'Japanese',
    khmer: 'Khmer',
    korean: 'Korean',
    mandarin: 'Mandarin',
    min_nan_chinese: 'Min Nan Chines',
    portuguese: 'Portuguese',
    punjabi: 'Punjabi',
    russian: 'Russian',
    spanish: 'Spanish',
    tagalog: 'Tagalog',
    telugu: 'Telugu',
    thai: 'Thai',
    ukrainian: 'Ukrainian',
    vietnamese: 'Vietnamese'
  }

  htcGroups = {
    immigrants_refugees: 'Immigrants Refugees',
    middle_eastern_and_north_africa: 'Middle Eastern And North Africa',
    homeless_individuals_and_famili: 'Homeless Individuals And Families',
    farmworkers: 'Farmworkers',
    veterans: 'Veterans',
    latinos: 'Latinos',
    asian_americans_pacific_islande: 'Asian Americans Pacific Islander',
    african_americans: 'African Americans',
    native_americans_tribal_communi: 'Native Americans Tribal Communities',
    children_ages_0_5: 'Children Ages 0-5',
    lesbian_gay_bisexual_transgende: 'Lesbian Gay Bisexual Transgender',
    limited_english_proficient_indi: 'Limited English Proficient',
    people_with_disabilities: 'People With Disabilities',
    seniorsolder_adults: 'Seniors Older Adult',
    low_broadband_subscription_rate: 'Low Broadband Subscription Rate'
  }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<EventsSummary>,
              public reportService: ReportService,
              public userService: UserService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  closeSettings(){
    this.dialogRef.close("CLOSED")
  }

  getAllReports(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))

    if(!this.allReports.length){
      this.reportService.getEventsSummaryReport(campaignID, this.data).subscribe(
          (reports: any[]) => {
            this.allReports = reports;
            this.sortedReports = this.allReports.slice();
            this.totalSize = this.allReports.length
            this.iterator();
          }
      )
    } else {
      this.sortedReports = this.allReports.slice();
      this.totalSize = this.allReports.length
      this.iterator();
    }
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
        case 'numOfEvents': return compare(a.numOfEvents, b.numOfEvents, isAsc);
        case 'total_number_of_impressions': return compare(a.total_number_of_impressions, b.total_number_of_impressions, isAsc);
        case 'total_number_of_paid_staffvolun': return compare(a.total_number_of_paid_staffvolun, b.total_number_of_paid_staffvolun, isAsc);

        case 'immigrants_refugees': return compare(a.htcGroup.immigrants_refugees, b.htcGroup.immigrants_refugees, isAsc);
        case 'middle_eastern_and_north_africa': return compare(a.htcGroup.middle_eastern_and_north_africa, b.htcGroup.middle_eastern_and_north_africa, isAsc);
        case 'homeless_individuals_and_famili': return compare(a.htcGroup.homeless_individuals_and_famili, b.htcGroup.homeless_individuals_and_famili, isAsc);
        case 'farmworkers': return compare(a.htcGroup.farmworkers, b.htcGroup.farmworkers, isAsc);
        case 'veterans': return compare(a.htcGroup.veterans, b.htcGroup.veterans, isAsc);
        case 'latinos': return compare(a.htcGroup.latinos, b.htcGroup.latinos, isAsc);
        case 'asian_americans_pacific_islande': return compare(a.htcGroup.asian_americans_pacific_islande, b.htcGroup.asian_americans_pacific_islande, isAsc);
        case 'african_americans': return compare(a.htcGroup.african_americans, b.htcGroup.african_americans, isAsc);
        case 'native_americans_tribal_communi': return compare(a.htcGroup.native_americans_tribal_communi, b.htcGroup.native_americans_tribal_communi, isAsc);
        case 'children_ages_0_5': return compare(a.htcGroup.children_ages_0_5, b.htcGroup.children_ages_0_5, isAsc);
        case 'lesbian_gay_bisexual_transgende': return compare(a.htcGroup.lesbian_gay_bisexual_transgende, b.htcGroup.lesbian_gay_bisexual_transgende, isAsc);
        case 'limited_english_proficient_indi': return compare(a.htcGroup.limited_english_proficient_indi, b.htcGroup.limited_english_proficient_indi, isAsc);
        case 'people_with_disabilities': return compare(a.htcGroup.people_with_disabilities, b.htcGroup.people_with_disabilities, isAsc);
        case 'seniorsolder_adults': return compare(a.htcGroup.seniorsolder_adults, b.htcGroup.seniorsolder_adults, isAsc);
        case 'low_broadband_subscription_rate': return compare(a.htcGroup.low_broadband_subscription_rate, b.htcGroup.low_broadband_subscription_rate, isAsc);
        case 'total_htc_of_impressions': return compare(a.total_htc_of_impressions, b.total_htc_of_impressions, isAsc);
        case 'funding_volunteer_hours': return compare(a.funding_volunteer_hours, b.funding_volunteer_hours, isAsc);

        case 'arabic': return compare(a.language.arabic, b.language.arabic, isAsc);
        case 'armenian': return compare(a.language.armenian, b.language.armenian, isAsc);
        case 'assyrian_neo_aramaic': return compare(a.language.assyrian_neo_aramaic, b.language.assyrian_neo_aramaic, isAsc);
        case 'cantonese': return compare(a.language.cantonese, b.language.cantonese, isAsc);
        case 'chaldean_neo_aramaic': return compare(a.language.chaldean_neo_aramaic, b.language.chaldean_neo_aramaic, isAsc);
        case 'chinese': return compare(a.language.chinese, b.language.chinese, isAsc);
        case 'farsi': return compare(a.language.farsi, b.language.farsi, isAsc);
        case 'filipino': return compare(a.language.filipino, b.language.filipino, isAsc);
        case 'hindi': return compare(a.language.hindi, b.language.hindi, isAsc);
        case 'hmong': return compare(a.language.hmong, b.language.hmong, isAsc);
        case 'iu_mien': return compare(a.language.iu_mien, b.language.iu_mien, isAsc);
        case 'japanese': return compare(a.language.japanese, b.language.japanese, isAsc);
        case 'khmer': return compare(a.language.khmer, b.language.khmer, isAsc);
        case 'korean': return compare(a.language.korean, b.language.korean, isAsc);
        case 'mandarin': return compare(a.language.mandarin, b.language.mandarin, isAsc);
        case 'min_nan_chinese': return compare(a.language.min_nan_chinese, b.language.min_nan_chinese, isAsc);
        case 'portuguese': return compare(a.language.portuguese, b.language.portuguese, isAsc);
        case 'punjabi': return compare(a.language.punjabi, b.language.punjabi, isAsc);
        case 'russian': return compare(a.language.russian, b.language.russian, isAsc);
        case 'spanish': return compare(a.language.spanish, b.language.spanish, isAsc);
        case 'tagalog': return compare(a.language.tagalog, b.language.tagalog, isAsc);
        case 'telugu': return compare(a.language.telugu, b.language.telugu, isAsc);
        case 'thai': return compare(a.language.thai, b.language.thai, isAsc);
        case 'ukrainian': return compare(a.language.ukrainian, b.language.ukrainian, isAsc);
        case 'vietnamese': return compare(a.language.vietnamese, b.language.vietnamese, isAsc);
        default: return 0;
      }
    });

    this.sortedReports.paginator = this.paginator;

  }

  returnZero() {
    return 0
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

