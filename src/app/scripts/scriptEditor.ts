import { Component, OnInit, ViewChild, ElementRef, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ScriptService} from '../services/script/script.service'

@Component({
    templateUrl: './scriptEditor.html',
  })

export class ScriptEditorDialog implements OnInit{
  @ViewChild('newQuestion', {static: false}) newQuestion: ElementRef;
  @ViewChild('newResponse', {static: false}) newResponse: ElementRef;
  @ViewChild('scriptTitle', {static: false}) scriptTitle: ElementRef;
  @ViewChild('initMsg', {static: false}) initMsg: ElementRef;

  questions = [];
  questionTypes = ['RADIO','TEXT']
  questionType = "TEXT"
  idType = "NEUTRAL"
  responses = []
  createQuestionPanelExpanded = false
  scripts = []
  selectedScriptId = ""

  questionMessage: String;
  showQuestionMessage = false;

  scriptMessage: String
  showScriptMessage = false;
  mode = "CREATE";

  orgID: string;

  constructor(
      public dialogRef: MatDialogRef<ScriptEditorDialog>, 
      @Inject(MAT_DIALOG_DATA) public data: any,
      public scriptService: ScriptService
      ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  addQuestion(){ 
    if(this.newQuestion.nativeElement.value === ""){
      this.showQuestionMessage = true;
      this.questionMessage = "Please fill out question details."

    } else{
      var question  = {question: this.newQuestion.nativeElement.value,
                       questionType: this.questionType,
                       responses: this.responses}

      this.questions.push(question)
      this.createQuestionPanelExpanded = false
      this.showQuestionMessage = false;
      this.questionMessage = ""
      this.responses = []
      this.newQuestion.nativeElement.value = ""
      this.questionType = "TEXT"
    }
  }

  removeQuestion(question: Object){
    for(var i = 0; i < this.questions.length; i++){
      if(this.questions[i].question === question['question']){
        this.questions.splice(i, 1)
        i--;
      }
    }
  }

  addResponse(responseText: String,  idType: String){
    if(responseText != "") {
      var response = {response: responseText, idType: idType}
      this.responses.push(response); 
      this.newResponse.nativeElement.value = "";
      this.showQuestionMessage = false;
      this.questionMessage = ""
    }
    else {
      this.showQuestionMessage = true;
      this.questionMessage = "Please enter a response."
    }
  }

  removeResponse(response: String){
    for(var i = 0; i < this.responses.length; i++){
      if(this.responses[i] === response){
        this.responses.splice(i, 1)
        i--;
      }
    }
  }

  createScript(){

    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']
    var orgID = localStorage.getItem('orgID')

    if(this.scriptTitle.nativeElement.value === ""  || this.initMsg.nativeElement.value === ""){
      this.showScriptMessage = true;
      this.scriptMessage = "Please fill out script details."

    } else if(this.questions.length === 0){
      this.showScriptMessage = true;
      this.scriptMessage = "Please create questions for your script."

    }else{

      this.showScriptMessage = false;
      this.scriptMessage = ""
      var script = {
                    title: this.scriptTitle.nativeElement.value,
                    initMessage: this.initMsg.nativeElement.value,
                    questions: this.questions,
                    createdBy: userID,
                    campaignID: campaignID,
                    orgID: orgID
                    }

      this.scriptService.createScript(script).subscribe(result =>{
        if(result){
          this.getAllScripts();
          this.clear();
        }
      })
    }
  }

  editScript(){

    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var userID = JSON.parse(localStorage.getItem('userProfile'))['user']['_id']

    if(this.scriptTitle.nativeElement.value === ""  || this.initMsg.nativeElement.value === ""){
      this.showScriptMessage = true;
      this.scriptMessage = "Please fill out script details."

    } else if(this.questions.length === 0){
      this.showScriptMessage = true;
      this.scriptMessage = "Please create questions for your script."

    }else{

      this.showScriptMessage = false;
      this.scriptMessage = ""
      var script = {
                    title: this.scriptTitle.nativeElement.value,
                    initMessage: this.initMsg.nativeElement.value,
                    questions: this.questions,
                    createdBy: userID,
                    campaignID: campaignID
                    }

      this.scriptService.editScript(script, this.selectedScriptId).subscribe(result =>{
        if(result){
          this.getAllScripts();
          this.clear();
        }
      })
    }
  }

  clear(){
    this.scriptTitle.nativeElement.value = ""
    this.initMsg.nativeElement.value = ""
    this.questions = []
    this.mode = "CREATE"
  }

  getAllScripts(){
    this.orgID = localStorage.getItem('orgID')
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.scriptService.getAllScripts(this.orgID, campaignID).subscribe((scripts: []) =>{
      this.scripts = scripts
    })
  }

  selectScript(script: Object){
    this.scriptService.getScript(script).subscribe(selectedScript =>{
      this.scriptTitle.nativeElement.value = selectedScript['title']
      this.initMsg.nativeElement.value = selectedScript['initMessage']
      this.questions = selectedScript['questions']
      this.selectedScriptId = selectedScript['_id']
      this.mode = "EDIT"
    })
  }


  deleteScript(script: Object){
    if(confirm("Are you sure you want to delete this script?")){
      this.scriptService.deleteScript(script).subscribe(result =>{
        if(result){this.getAllScripts()}
      })
    }
  }

  ngOnInit(){
    this.getAllScripts();

  }
}
  