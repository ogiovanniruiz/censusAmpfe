import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationsComponent} from './organizations.component'
import { MaterialModule } from '../material.module';
import { JoinCreateOrgDialog } from './orgDialogs/joinCreateOrgDialog';
import { OrgUserListDialog } from './orgDialogs/orgUserList';
import { AssetMapSettingsDialog } from '../settings/assetMapSettings';
import { EditOrgDialog } from './orgDialogs/editOrgDialog';
import { UserAgreementDialog } from './orgDialogs/userAgreement';

const routes: Routes = [
  { path: '', component: OrganizationsComponent}
];

@NgModule({
  declarations: [OrganizationsComponent, JoinCreateOrgDialog, OrgUserListDialog, AssetMapSettingsDialog, EditOrgDialog, UserAgreementDialog],
  entryComponents: [JoinCreateOrgDialog, OrgUserListDialog, AssetMapSettingsDialog, EditOrgDialog, UserAgreementDialog],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})

export class OrganizationsModule { }