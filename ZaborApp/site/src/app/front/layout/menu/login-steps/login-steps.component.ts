import { Component, OnInit } from '@angular/core';
import {LoginStepsService} from '../login-steps.service';
import {Observable} from 'rxjs';
import {StepModel} from '../../../../shared';

@Component({
  selector: 'app-login-steps',
  templateUrl: './login-steps.component.html',
  styleUrls: ['./login-steps.component.scss']
})
export class LoginStepsComponent implements OnInit {

  stepsLogin: Observable<StepModel[]>;
  currentStep: Observable<StepModel>;

  constructor(private loginStepsService: LoginStepsService) { }

  ngOnInit() {
    this.stepsLogin = this.loginStepsService.getSteps();
    this.currentStep = this.loginStepsService.getCurrentStep();
  }

}
