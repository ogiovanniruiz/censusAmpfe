import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent} from './home.component';
import { MaterialModule } from '../material.module';
import { JoinCreateCampaignDialog } from './campaignDialogs/joinCreateCampaign';
import { OrgDetailsDialog } from './campaignDialogs/orgDetails';


const routes: Routes = [
  { path: '', component: HomeComponent}
];

@NgModule({
  declarations: [HomeComponent,JoinCreateCampaignDialog, OrgDetailsDialog],
  entryComponents: [JoinCreateCampaignDialog, OrgDetailsDialog],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})

export class HomeModule { }