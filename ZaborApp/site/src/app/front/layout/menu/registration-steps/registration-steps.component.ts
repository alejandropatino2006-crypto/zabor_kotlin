import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {StepModel} from '../../../../shared';
import {RegistrationStepsService} from '../registration-steps.service';

@Component({
  selector: 'app-registration-steps',
  templateUrl: './registration-steps.component.html',
  styleUrls: ['./registration-steps.component.scss']
})
export class RegistrationStepsComponent implements OnInit {

  stepsRegister: Observable<StepModel[]>;
  currentStep: Observable<StepModel>;

  constructor(private registrationStepsService: RegistrationStepsService) { }

  ngOnInit() {
    this.stepsRegister = this.registrationStepsService.getSteps();
    this.currentStep = this.registrationStepsService.getCurrentStep();
  }

}
