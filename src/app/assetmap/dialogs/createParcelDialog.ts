import {Component, OnInit, ViewChildren, Inject, QueryList, Injectable, ElementRef, ViewChild, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ScriptService} from '../../services/script/script.service'
import {ParcelService} from '../../services/parcel/parcel.service'
import { Options } from 'ng5-slider'
import { UserService } from '../../services/user/user.service'


@Component({
  templateUrl: './createParcelDialog.html'
})
  
export class CreateParcelDialog implements OnInit{
  @ViewChild('unit', {static: false}) unit:ElementRef;
  @ViewChild('address', {static: false}) address:ElementRef
  @ViewChild('city', {static: false}) city:ElementRef
  @ViewChild('county', {static: false}) county:ElementRef;
  @ViewChild('zip', {static: false}) zip:ElementRef

  displayMessage = false;
  userMessage = ''
  counties = ['SAN BERNARDINO', 'RIVERSIDE']


  constructor(public dialogRef: MatDialogRef<CreateParcelDialog>, 
              @Inject(MAT_DIALOG_DATA) public parcelData: any, 
              public parcelService: ParcelService){}

  onNoClick(): void {this.dialogRef.close()}
  

  saveParcel(){

    var capUnit= this.unit.nativeElement.value.toUpperCase()
    var capCity = this.city.nativeElement.value.toUpperCase();
    var capCounty = this.county['value']
    
    var address = { address: this.address.nativeElement.value,
                    unit: capUnit,
                    city: capCity,
                    county: capCounty,
                    state: "CA",
                    zip: this.zip.nativeElement.value
                  }

    //this.parcelData['address'] = address

    if (
        this.address.nativeElement.value === '' || 
        address.city === '' || 
        address.county === '' || 
        address.zip === ''){
  
        this.displayMessage =  true;
        this.userMessage = "Please fill in required fields."

    } else{

      this.parcelData.properties.type = "NONRESIDENTIAL";
      this.parcelData.properties.assessorCodes = {realUse: "R1", primary:"R"}
      
      this.parcelService.createParcel(this.parcelData, address).subscribe( savedParcel =>{
        this.dialogRef.close(savedParcel)
          
      })
      
    }
  }

  cancel(){this.dialogRef.close()}
  ngOnInit() {}
}