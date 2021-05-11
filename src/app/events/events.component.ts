import { Component, OnInit,  ViewChild} from '@angular/core';
import { TargetService } from '../services/target/target.service'
import { OrganizationService } from '../services/organization/organization.service'
import { Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent} from '@angular/material';
import { MatDialog } from '@angular/material';
import { EventFormDialog } from './eventsDialog/eventFormDialog';
import { EventFormDialogCompleted } from './eventsDialog/eventFormDialogCompleted';
import { ActivityService} from '../services/activity/activity.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  constructor(public targetService: TargetService, public orgService: OrganizationService, public dialog: MatDialog, public activityService: ActivityService) { }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatPaginator, {static: false}) paginatorCompleted: MatPaginator;

  displayedColumns: string[] = ['name', 'date', 'org','action'];
  events = [];
  ready = false;
  dev = false;

  orgs = []
  sortedEvents;
  orgID: String;

  currentPage = 0
  public pageSize = 5;
  public totalSize = 0;
  pageEvent: PageEvent;

  filteredEvents = [];
  eventsCompleted = [];
  sortedEventsCompleted;
  currentPageCompleted = 0
  public pageSizeCompleted = 5;
  public totalSizeCompleted = 0;
  pageEventCompleted: PageEvent;

  getEvents(){
    this.ready = false;
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var orgID = localStorage.getItem('orgID')
    var date = localStorage.getItem('selectedEventDate')

    this.events = []
    this.eventsCompleted = []

    this.activityService.getEvents(campaignID,orgID).subscribe(async (events: []) => {
      if (date){
        for (var i = 0; i < events.length; i++){
          if (new Date(events[i]['activityMetaData']['endDate']).getTime() <= new Date(date).getTime()) {
            this.filteredEvents.push(events[i]);
          }
        }
      } else {
        this.filteredEvents = events;
      }

      this.allocateEvents(this.filteredEvents);
    });
  }

  allocateEvents(events){

    for(var i = 0; i < events.length; i++){
      if(events[i]['activityMetaData']['complete']){
        this.eventsCompleted.push(events[i]);
      } else {
        this.events.push(events[i]);
      }
    }

    this.sortedEvents = this.events.slice();
    this.totalSize = this.events.length;
    this.iterator();

    this.sortedEventsCompleted = this.eventsCompleted.slice();
    this.totalSizeCompleted = this.eventsCompleted.length;
    this.iteratorCompleted();
  }

  removeEvent(event){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityType = "Event"
    var orgID = localStorage.getItem('orgID')

    if (confirm('Are you sure you to delete this event?')) {
      this.activityService.deleteActivity(campaignID, event._id, activityType, orgID).subscribe(results => {
        if(results) this.getEvents();
      })
    } 
  }

  openEventDialog(event: Object, mode: String){
    const dialogRef = this.dialog.open(EventFormDialog, {data: {event: event, mode: mode}});
    dialogRef.afterClosed().subscribe(result => {
     if(result) this.getEvents();
    });
  }

  openEventDialogCompleted(event: Object, mode: String){
    const dialogRef = this.dialog.open(EventFormDialogCompleted, {data: {event: event, mode: mode}});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.getEvents();
    });
  }

  ngOnInit() {
    this.getEvents();
    this.orgID = localStorage.getItem("orgID")
    this.dev = JSON.parse(localStorage.getItem('userProfile'))['user']['dev']
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
    return e;
  }

  public handlePageCompleted(e: any) {
    this.currentPageCompleted = e.pageIndex;
    this.pageSizeCompleted = e.pageSize;
    this.iteratorCompleted();
    return e;
  }

  private iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.events.slice(start, end);
    this.sortedEvents = part;
  }

  private iteratorCompleted() {
    const end = (this.currentPageCompleted + 1) * this.pageSizeCompleted;
    const start = this.currentPageCompleted * this.pageSizeCompleted;
    const part = this.eventsCompleted.slice(start, end);
    this.sortedEventsCompleted = part;
  }

  sortData(sort: Sort) {
      const data = this.events.slice();
      if (!sort.active || sort.direction === '') {
        this.sortedEvents = data;
        return;
      }

      this.sortedEvents= data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'name': return compare(a.activityMetaData.name, b.activityMetaData.name, isAsc);
          case 'date': return compare(a.activityMetaData.endDate, b.activityMetaData.endDate, isAsc);
          case 'organization': return compare(a.orgCreatorName, b.orgCreatorName, isAsc);
          case 'time': return compare(a.time, b.time, isAsc);
          case 'locationName': return compare(a.locationName, b.locationName, isAsc);
          case 'blockGroups': return compare(a.blockGroupID, b.blockGroupID, isAsc);
          case 'cities': return compare(a.address.city, b.address.city, isAsc);
          default: return 0;
        }
      });

      this.sortedEvents.paginator = this.paginator;
  }

  sortDataCompleted(sort: Sort) {
    const data = this.eventsCompleted.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedEventsCompleted = data;
      return;
    }

    this.sortedEventsCompleted = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.activityMetaData.name, b.activityMetaData.name, isAsc);
        case 'date': return compare(a.activityMetaData.endDate, b.activityMetaData.endDate, isAsc);
        case 'organization': return compare(a.orgCreatorName, b.orgCreatorName, isAsc);
        case 'time': return compare(a.time, b.time, isAsc);
        case 'locationName': return compare(a.locationName, b.locationName, isAsc);
        case 'blockGroups': return compare(a.blockGroupID, b.blockGroupID, isAsc);
        case 'cities': return compare(a.address.city, b.address.city, isAsc);
        default: return 0;
      }
    });

    this.sortedEventsCompleted.paginator = this.paginatorCompleted;
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
