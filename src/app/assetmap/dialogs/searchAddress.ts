import {Component, OnInit, ViewChildren, Inject, QueryList, Injectable, ElementRef, ViewChild, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ScriptService} from '../../services/script/script.service'
import {ParcelService} from '../../services/parcel/parcel.service'

@Component({
  templateUrl: './searchAddress.html'
})
  
export class SearchAddressDialog implements OnInit{

  displayMessage = false;
  userMessage = '';
  displaySecondMessage = false;
  secondaryMessage = ''
  searchResults: Object;
  searching = false;
  markerShowable = false;

  @ViewChild('address', {static: false}) address:ElementRef;
  constructor(public dialogRef: MatDialogRef<SearchAddressDialog>, 
              public parcelService: ParcelService){}

  search(){
    this.searching = true;
    var address = this.address.nativeElement.value;

    this.parcelService.search(address).subscribe(result=>{
      this.searching = false;
      if(result['status'] === "Success"){
        this.showMarker(result['coords'], result['formattedAddress'])
        this.displaySecondMessage = false;
      }else if(result['status'] === "Fail"){
        this.secondaryMessage = "Invalid Address."
        this.displaySecondMessage = true;
      }

    })
  }

  onNoClick(): void {this.dialogRef.close()}

  showMarker(coords, address){
    this.dialogRef.close({coords: coords, address: address})
  }

  ngOnInit() {}
}