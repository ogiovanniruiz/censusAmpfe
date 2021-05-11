import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material';
import {PersonService} from '../services/person/person.service'
import { Sort } from '@angular/material/sort';
import {MatDialog} from '@angular/material';
import {MemberDialog} from './membershipDialogs/memberDialog'
import {OrganizationService} from '../services/organization/organization.service'
import {ParcelService} from '../services/parcel/parcel.service'
import {ScriptService} from '../services/script/script.service'

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {

  file: any;
  showErrorMsg = false;
  errorMsg = ""
  uploading = false;
  members = []

  sortedMembers;
  pageEvent: PageEvent;

  totalsize: Number;
  currentPage = 0
  public pageSize = 5;
  public totalSize = 0;
  tags = []
  scriptsArray = {}
  dev = false;

  selectedTags = []
  downloadingContactHistory = false;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild("newTag", {static: true}) tag: ElementRef;

  constructor(private personService: PersonService, 
              public dialog: MatDialog, 
              public orgService: OrganizationService, 
              private parcelService: ParcelService,
              private scriptService: ScriptService
              ) { }

  getMembers(){
    var orgID = localStorage.getItem('orgID')
    this.personService.getMembers(orgID).subscribe((members: []) => {
      this.members = members
      this.sortedMembers = this.members.slice();
      this.totalSize = this.members.length;
      this.iterator();
    })
  }

  fileChanged(e) {
    this.file = e.target.files[0];
  }

  checkUpload(){

    if (this.file === undefined){
      this.showErrorMsg = true; 
      this.errorMsg = "No File Selected."
    } else{
      var formData = new FormData();
      
      var orgID = localStorage.getItem('orgID')
      formData.append('file', this.file);
      formData.append('orgID', orgID)

      if(this.selectedTags){
        formData.append('selectedTags', this.selectedTags.toString())
      }

      this.uploadData(formData);
      this.uploading = true;
      this.showErrorMsg = false;     
    }
  }

  editMember(person: Object){
    const dialogRef = this.dialog.open(MemberDialog, {data: {person: person, mode: "EDIT"}});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.getMembers();
    });
  }

  createNew(){
    const dialogRef = this.dialog.open(MemberDialog, {data: {person: {}, mode: "CREATE"}});
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.getMembers();
    });
  }

  createNewTag(tag: string){
    var orgID = localStorage.getItem('orgID')

    this.orgService.createTag(orgID, tag).subscribe(result =>{
      this.tag.nativeElement.value = ""
      this.getOrgTags();
    })
  }

  getOrgTags(){
    var orgID = localStorage.getItem('orgID')
    this.orgService.getOrgTags(orgID).subscribe((result: []) =>{
      this.tags = result
    })
  }

  uploadData(formData){
    this.personService.uploadMembership(formData).subscribe(result =>{

      this.getMembers()
    })
  }

  tagParcels(){
    var orgID = localStorage.getItem('orgID')

    this.parcelService.tagParcels(orgID).subscribe(result =>{

    })

  }

  getScripts(){
    this.scriptService.getEveryScript().subscribe((scripts:[]) =>{
      for(var i = 0; i < scripts.length; i++){
        var id = scripts[i]['_id']
        var title = scripts[i]['title']
        this.scriptsArray[id] = title
      }
    })
  }

  downloadContactHistory(){
    var orgID = localStorage.getItem('orgID')
    this.downloadingContactHistory = true;

    this.personService.downloadContactHistory(orgID).subscribe((contactHistory: []) =>{

      var campaignArray = {3: "Census 2020", 7:"RivCountyCensus2020",8: "SBCountyCensus2020", 11: "Hawthorne", 15: "Census2020Redux", 16: "Census2020Redux", 17: "NRFU"}

      var data = "firstName,middleName,lastName,phones,emails,address,city,zip,blockgroupID,pmc_text,pmc_phone,pmc_email,membership,script,question,response,date,campaignName\n"
      for(var i = 0; i < contactHistory.length; i++){
        for(var j = 0; j < contactHistory[i]['phonebankContactHistory']['length']; j++){
          for(var k = 0; k < contactHistory[i]['phonebankContactHistory'][j]['idHistory']['length']; k++){
            for(var l = 0; l < contactHistory[i]['phonebankContactHistory'][j]['idHistory'][k]['idResponses']['length']; l++){
              data = this.constructRecord(data, contactHistory[i])
              data = data + this.scriptsArray[contactHistory[i]['phonebankContactHistory'][j]['idHistory'][k]['scriptID']] + ','
              data = data + contactHistory[i]['phonebankContactHistory'][j]['idHistory'][k]['idResponses'][l]['question'] + ','
              data = data + contactHistory[i]['phonebankContactHistory'][j]['idHistory'][k]['idResponses'][l]['responses'] + ','
              data = data + contactHistory[i]['phonebankContactHistory'][j]['idHistory'][k]['date'] + ','
              data = data + campaignArray[contactHistory[i]['phonebankContactHistory'][j]['campaignID']] + '\n'
            }
          }
        }

        for(var j = 0; j < contactHistory[i]['petitionContactHistory']['length']; j++){
          for(var k = 0; k < contactHistory[i]['petitionContactHistory'][j]['idHistory']['length']; k++){
            for(var l = 0; l < contactHistory[i]['petitionContactHistory'][j]['idHistory'][k]['idResponses']['length']; l++){
              data = this.constructRecord(data, contactHistory[i])
              data = data + this.scriptsArray[contactHistory[i]['petitionContactHistory'][j]['idHistory'][k]['scriptID']] + ','
              data = data + contactHistory[i]['petitionContactHistory'][j]['idHistory'][k]['idResponses'][l]['question'] + ','
              data = data + contactHistory[i]['petitionContactHistory'][j]['idHistory'][k]['idResponses'][l]['responses'] + ','
              data = data + contactHistory[i]['petitionContactHistory'][j]['idHistory'][k]['date'] + ','
              data = data + campaignArray[contactHistory[i]['petitionContactHistory'][j]['campaignID']] + '\n'
            }
          }
        }

        for(var j = 0; j < contactHistory[i]['canvassContactHistory']['length']; j++){
          for(var k = 0; k < contactHistory[i]['canvassContactHistory'][j]['idHistory']['length']; k++){
            for(var l = 0; l < contactHistory[i]['canvassContactHistory'][j]['idHistory'][k]['idResponses']['length']; l++){
              data = this.constructRecord(data, contactHistory[i])
              data = data + this.scriptsArray[contactHistory[i]['canvassContactHistory'][j]['idHistory'][k]['scriptID']] + ','
              data = data + contactHistory[i]['canvassContactHistory'][j]['idHistory'][k]['idResponses'][l]['question'] + ','
              data = data + contactHistory[i]['canvassContactHistory'][j]['idHistory'][k]['idResponses'][l]['responses'] + ','
              data = data + contactHistory[i]['canvassContactHistory'][j]['idHistory'][k]['date'] + ','
              data = data + campaignArray[contactHistory[i]['canvassContactHistory'][j]['campaignID']] + '\n'
            }
          }
        }

        for(var j = 0; j < contactHistory[i]['textContactHistory']['length']; j++){
          for(var k = 0; k < contactHistory[i]['textContactHistory'][j]['idHistory']['length']; k++){
            for(var l = 0; l < contactHistory[i]['textContactHistory'][j]['idHistory'][k]['idResponses']['length']; l++){
              data = this.constructRecord(data, contactHistory[i])
              data = data + this.scriptsArray[contactHistory[i]['textContactHistory'][j]['idHistory'][k]['scriptID']] + ','
              data = data + contactHistory[i]['textContactHistory'][j]['idHistory'][k]['idResponses'][l]['question'] + ','
              data = data + contactHistory[i]['textContactHistory'][j]['idHistory'][k]['idResponses'][l]['responses'] + ','
              data = data + contactHistory[i]['textContactHistory'][j]['idHistory'][k]['date'] + ','
              data = data + campaignArray[contactHistory[i]['textContactHistory'][j]['campaignID']] + '\n'
            }
          }
        }
      }

      let downloadLink = document.createElement('a');

      const blob = new Blob([data], {type: 'text/csv' });
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.setAttribute('download', 'OrgContactList.csv');
         
      document.body.appendChild(downloadLink);
      downloadLink.click();
      this.downloadingContactHistory = false

    })
  }

  constructRecord(data, contactHistory){

    var orgID = localStorage.getItem("orgID")



    var address = ""

    if(contactHistory['address']){
      if(contactHistory['address']['streetNum']){address = address + contactHistory['address']['streetNum'] + " "}
      if(contactHistory['address']['prefix']){address = address + contactHistory['address']['prefix'] + " "}
      if(contactHistory['address']['street']){address = address + contactHistory['address']['street'] + " "}
      if(contactHistory['address']['suffix']){address = address + contactHistory['address']['suffix']}
      if(contactHistory['address']['unit']){address = address + " " + contactHistory['address']['unit']}
    }

    if(contactHistory['firstName']){data = data + contactHistory['firstName']}
    data = data + ","
    if(contactHistory['middleName']){data = data + contactHistory['middleName']}
    data = data + ","
    if(contactHistory['lastName']){data = data + contactHistory['lastName']}
    data = data + ","
    if(contactHistory['phones']){
      var phone = ""
      phone = contactHistory['phones']
      var newPhone = phone.toString().replace(/\-/g,'').replace(/\(/g,'').replace(/\)/g,'')
      data = data + newPhone
  
    }
    data = data + ","
    if(contactHistory['emails']){data = data + contactHistory['emails']}
    data = data + "," + address +  ","
    if(contactHistory['address']){
      if(contactHistory['address']['city']){data = data + contactHistory['address']['city']}
    }
    data = data + ","
    if(contactHistory['address']){
      if(contactHistory['address']['zip']){data = data + contactHistory['address']['zip']}
    }
    data = data + ","
    
    if(contactHistory['address']){
      if(contactHistory['address']['blockgroupID']){data = data + contactHistory['address']['blockgroupID']}
    }
    data = data + ","
    if(contactHistory['preferredMethodContact']){

      var contactArray = []
      contactArray = contactHistory['preferredMethodContact']
      contactArray = contactArray.map(x => {return x.method})

      if(contactArray.includes('TEXT')){data = data + "Y,"}
      else{data = data + "Y,"}
      if(contactArray.includes('PHONE')){data = data + "Y,"}
      else{data = data + "N,"}
      if(contactArray.includes('EMAIL')){data = data + "Y"}
      else{data = data + "N"}        
    }
    data = data + ","
    if(contactHistory['membership']){
      var orgIDs = contactHistory['membership'].map(x=> {return x.orgID})
      if(orgIDs.includes(orgID)){
        data = data + "Y"
      }else{
        data = data + "N"
      }
      
    }
    data = data + ","

    return data

  }

  public handlePage(e?:PageEvent) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.iterator();
    return e
  }

  private iterator() {
    const end = (this.currentPage + 1) * this.pageSize;
    const start = this.currentPage * this.pageSize;
    const part = this.members.slice(start, end);
    this.sortedMembers = part;
  }

  sortData(sort: Sort) {
    const data = this.members.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedMembers = data;
      return;
    }

    this.sortedMembers= data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'firstName': return compare(a.firstName, b.firstName, isAsc);
        case 'middleName': return compare(a.middleName, b.middleName, isAsc);
        case 'lastName': return compare(a.lastName, b.lastName, isAsc);
        case 'phoneNumber': return compare(a.phones, b.phones, isAsc);
        case 'email': return compare(a.emails, b.emails, isAsc);
        default: return 0;
      }
    });

    this.sortedMembers.paginator = this.paginator;
}

  ngOnInit() {
    this.dev = JSON.parse(localStorage.getItem('userProfile'))['user']['dev']
    this.getScripts();
    this.getMembers();
    this.getOrgTags();
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
