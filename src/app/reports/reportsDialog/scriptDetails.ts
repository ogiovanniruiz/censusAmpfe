import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MatPaginator} from '@angular/material';
import { UserService } from '../../services/user/user.service';
import { ScriptService } from '../../services/script/script.service';

@Component({
  templateUrl: './scriptDetails.html',
})

export class ScriptDetails implements OnInit{

  orgID: string;
  scripts = []
  script = []
  title: string;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<ScriptDetails>,
              public scriptService: ScriptService,
              public userService: UserService,
  ) { }

  closeSettings(){
    this.dialogRef.close("CLOSED")
  }

  getAllScripts(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))

    this.scriptService.getAllScripts('', campaignID).subscribe((scripts: []) =>{
      this.scripts = scripts
    })
  }

  ngOnInit(){
    this.getAllScripts()
  }


  selectScript(script: Object){
    this.script = []

    this.scriptService.getScript(script).subscribe(async selectedScript =>{

      this.title = selectedScript['title']

      var count = 0

      for(var i = 0; i < selectedScript['questions'].length; i++){

        if(selectedScript['questions'][i].responses.length) {
          count += 1
          for(var ii = 0; ii < selectedScript['questions'][i].responses.length; ii++) {
            var response = await selectedScript['questions'][i].responses[ii]
            this.script.push({label: 'Q'+(count)+'R'+(ii+1), name: response.response})
          }
        }

      }

    })
  }

}
