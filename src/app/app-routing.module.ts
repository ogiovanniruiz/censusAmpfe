import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.service';

const routes: Routes = [
  {path: 'login', loadChildren: './login/login.module#LoginModule'},
  {path: 'home', loadChildren: './home/home.module#HomeModule', canActivate: [AuthGuard]},
  {path: 'organizations', loadChildren: './organizations/organizations.module#OrganizationsModule', canActivate: [AuthGuard]},
  {path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', canActivate: [AuthGuard]},
  {path: 'register', loadChildren: './register/register.module#RegisterModule'},
  {path: 'asset', loadChildren: './assetmap/asset.module#AssetModule', canActivate: [AuthGuard]},
  {path: 'targeting', loadChildren: './targeting/targeting.module#TargetingModule', canActivate: [AuthGuard]},
  {path: 'events', loadChildren: './events/events.module#EventsModule', canActivate: [AuthGuard]},
  {path: 'activity', loadChildren: './activity/activity.module#ActivityModule', canActivate: [AuthGuard]},
  {path: 'canvass', loadChildren: './canvass/canvass.module#CanvassModule', canActivate: [AuthGuard]},
  {path: 'texting', loadChildren: './texting/texting.module#TextingModule', canActivate: [AuthGuard]},
  {path: 'membership', loadChildren: './membership/membership.module#MembershipModule', canActivate: [AuthGuard]},
  {path: 'phonebank', loadChildren: './phonebank/phonebank.module#PhonebankModule', canActivate: [AuthGuard]},
  {path: 'petition', loadChildren: './petition/petition.module#PetitionModule', canActivate: [AuthGuard]},
  {path: 'reports', loadChildren: './reports/reports.module#ReportsModule', canActivate: [AuthGuard]},
  {path: 'passwordreset', loadChildren: './passwordreset/passwordreset.module#PasswordresetModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
