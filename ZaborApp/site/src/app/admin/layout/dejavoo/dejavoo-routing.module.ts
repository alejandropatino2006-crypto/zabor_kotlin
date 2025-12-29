import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateTerminalComponent } from './create-terminal/create-terminal.component';
import { DejavooComponent } from './dejavoo.component';
import { EditTerminalComponent } from './edit-terminal/edit-terminal.component';

const routes: Routes = [
  {
    path: '',
    component: DejavooComponent,
    data: {
        title: 'Dejavoo Terminals'
    }
  },
  {
    path: 'terminal/create',
    component: CreateTerminalComponent,
    data: {
        title: 'Create Dejavoo Terminal'
    }
  },
  {
    path: 'terminal/edit/:terminalid',
    component: EditTerminalComponent,
    data: {
        title: 'Edit Dejavoo Terminal'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DejavooRoutingModule { }
