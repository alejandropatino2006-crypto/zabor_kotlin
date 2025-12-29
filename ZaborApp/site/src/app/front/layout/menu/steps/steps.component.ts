import {AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs';
import {StepModel} from '../../../../shared';
import {RegistrationStepsService} from '../registration-steps.service';
import {LoginStepsService} from '../login-steps.service';
// import {StepsService} from '../steps.service';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StepsComponent implements OnInit, AfterViewInit, AfterViewChecked {

  // private static REGISTER_STEPS = [
  //   { stepIndex: 1, isComplete: false },
  //   { stepIndex: 2, isComplete: false },
  //   { stepIndex: 3, isComplete: false }
  // ];
  //
  // private static LOGIN_STEPS = [
  //   { stepIndex: 1, isComplete: false },
  //   { stepIndex: 2, isComplete: false },
  // ];

  @Input() type: 'register' | 'login';

  // steps: Observable<StepModel[]>;
  stepsRegister: Observable<StepModel[]>;
  stepsLogin: Observable<StepModel[]>;
  currentStep: Observable<StepModel>;

  constructor(private registrationStepsService: RegistrationStepsService, private loginStepsService: LoginStepsService) {
    // this.stepsService.setSteps(StepsComponent.REGISTER_STEPS);
    // this.stepsService.setRegisterSteps(StepsComponent.REGISTER_STEPS);
    // this.stepsService.setLoginSteps(StepsComponent.LOGIN_STEPS);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.stepsRegister = this.registrationStepsService.getSteps();
    this.stepsLogin = this.loginStepsService.getSteps();
    if (this.type === 'register') {
      this.currentStep = this.registrationStepsService.getCurrentStep();
    }
    if (this.type === 'login') {
      this.currentStep = this.loginStepsService.getCurrentStep();
    }
  }

  ngAfterViewChecked(): void {
    // this.stepsService.setup(this.type);
    // // this.stepsService.setup('register');
    // // this.steps = this.stepsService.getSteps();
    // if (this.type === 'register') {
    //   this.stepsRegister = this.stepsService.getSteps();
    // }
    // if (this.type === 'login') {
    //   this.stepsLogin = this.stepsService.getSteps();
    // }
    // this.currentStep = this.stepsService.getCurrentStep();
  }

  // onStepClick(step: StepModel) {
  //   this.stepsService.setCurrentStep(step);
  // }

}
