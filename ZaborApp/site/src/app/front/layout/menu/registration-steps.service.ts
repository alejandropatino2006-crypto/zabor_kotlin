import { Injectable } from '@angular/core';
import {StepModel} from '../../../shared';
import {BehaviorSubject, Observable} from 'rxjs';

const REGISTER_STEPS: StepModel[] = [
  { stepIndex: 1, isComplete: false, label: 'Signup' },
  { stepIndex: 2, isComplete: false, label: 'Passcode' },
  { stepIndex: 3, isComplete: false, label: 'Checkout' }
];

@Injectable({
  providedIn: 'root'
})
export class RegistrationStepsService {

  steps$: BehaviorSubject<StepModel[]> = new BehaviorSubject<StepModel[]>(REGISTER_STEPS);
  currentStep$: BehaviorSubject<StepModel> = new BehaviorSubject<StepModel>(null);

  constructor() {
    this.currentStep$.next(this.steps$.value[0]);
  }


  public setCurrentStep(step: StepModel): void {
    this.currentStep$.next(step);
  }

  public getCurrentStep(): Observable<StepModel> {
    return this.currentStep$.asObservable();
  }

  public getSteps(): Observable<StepModel[]> {
    return this.steps$.asObservable();
  }

  public moveToNextStep(): void {
    const index = this.currentStep$.value.stepIndex;
    this.currentStep$.next(this.steps$.value[index]);
  }

  public moveToPreviousStep(): void {
    const index = this.currentStep$.value.stepIndex;
    this.currentStep$.next(this.steps$.value[index - 2]);
  }

  public isLastStep(): boolean {
    return this.currentStep$.value.stepIndex === this.steps$.value.length;
  }

}
