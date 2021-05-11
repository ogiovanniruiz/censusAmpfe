import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventsComponent} from './events.component';
import { MaterialModule } from '../material.module';
import { EventFormDialog } from './eventsDialog/eventFormDialog';
import { EventFormDialogCompleted } from './eventsDialog/eventFormDialogCompleted';

const routes: Routes = [
  { path: '', component: EventsComponent}
];

@NgModule({
  declarations: [EventsComponent,EventFormDialog, EventFormDialogCompleted],
  entryComponents:[EventFormDialog, EventFormDialogCompleted],
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EventsModule { }
