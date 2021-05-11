import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { MaterialModule } from '../material.module';
import { OrgSummary } from './reportsDialog/orgSummary';
import { PetitionSummary } from './reportsDialog/petitionSummary';
import { PhonebankingSummary } from './reportsDialog/phonebankingSummary';
import { TextingSummary } from './reportsDialog/textingSummary';
import { OverallSummary } from './reportsDialog/overallSummary';
import { ScriptDetails } from './reportsDialog/scriptDetails';
import { EventsSummary } from './reportsDialog/eventsSummary';
import { BlockGroupCanvassSummary } from './reportsDialog/blockGroupCanvassSummary';
import { BlockGroupCanvassOrgSummary } from './reportsDialog/blockGroupCanvassOrgSummary';
import { BlockGroupOverallSummary } from './reportsDialog/blockGroupOverallSummary';
import { BlockGroupOrgSummary } from './reportsDialog/blockGroupOrgSummary';
import { PhonebankingUserSummary } from './reportsDialog/phonebankingUserSummary';

const routes: Routes = [
  { path: '', component: ReportsComponent}
];



@NgModule({
  declarations: [ReportsComponent, OrgSummary, PetitionSummary, PhonebankingSummary, TextingSummary, OverallSummary, ScriptDetails, EventsSummary, BlockGroupCanvassSummary, BlockGroupCanvassOrgSummary, BlockGroupOverallSummary, BlockGroupOrgSummary, PhonebankingUserSummary],
  entryComponents: [OrgSummary, PetitionSummary, PhonebankingSummary, TextingSummary, OverallSummary, ScriptDetails, EventsSummary, BlockGroupCanvassSummary, BlockGroupCanvassOrgSummary, BlockGroupOverallSummary, BlockGroupOrgSummary, PhonebankingUserSummary],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class ReportsModule { }
