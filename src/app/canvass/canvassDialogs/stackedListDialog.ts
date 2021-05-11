import { Component, OnInit, ViewChildren, ElementRef, Inject, QueryList, ViewChild, Input} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {PersonService} from '../../services/person/person.service'
import {ScriptService} from '../../services/script/script.service'
import {ActivityService} from '../../services/activity/activity.service'
import {ParcelService} from '../../services/parcel/parcel.service'
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { CanvassService } from '../../services/canvass/canvass.service';


@Component({
  templateUrl: './stackedListDialog.html',
  styleUrls: ['../canvass.component.scss']
})
  
export class StackedListDialog implements OnInit{

  people = []
  @ViewChild('group', {static: false}) group: ElementRef;

  constructor(public dialog: MatDialog, 
              public dialogRef: MatDialogRef<StackedListDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: any,
              public personService: PersonService,
              public scriptService: ScriptService,
              public activityService: ActivityService,
              public canvassService: CanvassService,

              public parcelService: ParcelService) {

                var unfilteredPeople  = []
                
                for(var i = 0; i < data.stacked.length; i++){

                  var stringAddress = ""

                  if(data.stacked[i].address.streetNum) stringAddress = data.stacked[i].address.streetNum
                  if(data.stacked[i].address.prefix) stringAddress = stringAddress + " " + data.stacked[i].address.prefix
                  if(data.stacked[i].address.street) stringAddress = stringAddress + " " + data.stacked[i].address.street
                  if(data.stacked[i].address.suffix) stringAddress = stringAddress + " " + data.stacked[i].address.suffix
                  if(data.stacked[i].address.unit) stringAddress = stringAddress + " " + data.stacked[i].address.unit
                  this.people.push({stringAddress: stringAddress, data: data.stacked[i]}) 
                }

                /*

                this.people = Array.from(new Set(unfilteredPeople.map(s => s.stringAddress)))
                .map(stringAddress => {
                  return {
                    stringAddress: stringAddress,
                    data: data
                  }
                })*/

              }

  ngOnInit(){}

  continue(){
    console.log(this.people)
    for(var i = 0; i < this.people.length; i++){
      if(this.people[i].data._id === this.group['value']){
       
        this.dialogRef.close(this.people[i]);
        break
      }
    }    
  }

} 