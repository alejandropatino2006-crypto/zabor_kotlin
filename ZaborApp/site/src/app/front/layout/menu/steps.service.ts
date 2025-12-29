import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {StepModel} from '../../../shared';

@Injectable({
  providedIn: 'root'
})
export class StepsService {

  private static type$: 'register' | 'login';

  // steps$: BehaviorSubject<StepModel[]> = new BehaviorSubject<StepModel[]>(STEPS);
  // steps$: BehaviorSubject<StepModel[]>;
  // currentStep$: BehaviorSubject<StepModel> = new BehaviorSubject<StepModel>(null);

  stepsRegister$: BehaviorSubject<StepModel[]>;
  currentRegisterStep$: BehaviorSubject<StepModel> = new BehaviorSubject<StepModel>(null);
  stepsLogin$: BehaviorSubject<StepModel[]>;
  currentLoginStep$: BehaviorSubject<StepModel> = new BehaviorSubject<StepModel>(null);

  constructor() {
    // this.currentStep$.next(this.steps$.value[0]);
  }

  public setCurrentStep(step: StepModel): void {
    // this.currentStep$.next(step);
    if (StepsService.type$ === 'register') {
      this.currentRegisterStep$.next(step);
    }
    if (StepsService.type$ === 'login') {
      this.currentLoginStep$.next(step);
    }
  }

  public getCurrentStep(): Observable<StepModel> {
    // return this.currentStep$.asObservable();
    if (StepsService.type$ === 'register') {
      return this.currentRegisterStep$.asObservable();
    }
    if (StepsService.type$ === 'login') {
      return this.currentLoginStep$.asObservable();
    }
  }

  public getSteps(): Observable<StepModel[]> {
    // return this.steps$.asObservable();
    if (StepsService.type$ === 'register') {
      return this.stepsRegister$.asObservable();
    }
    if (StepsService.type$ === 'login') {
      return this.stepsLogin$.asObservable();
    }
  }

  public setRegisterSteps(steps: StepModel[]) {
    this.stepsRegister$ = new BehaviorSubject<StepModel[]>(steps);
  }

  public setLoginSteps(steps: StepModel[]) {
    this.stepsLogin$ = new BehaviorSubject<StepModel[]>(steps);
  }

  public setup(type: 'register' | 'login') {
    // this.currentStep$.next(this.steps$.value[0]);
    StepsService.type$ = type;
    if (type === 'register') {
      this.currentRegisterStep$.next(this.stepsRegister$.value[0]);
    }
    if (type === 'login') {
      this.currentLoginStep$.next(this.stepsLogin$.value[0]);
    }
  }

  public moveToNextStep(): void {
    // const index = this.currentStep$.value.stepIndex;

    if (StepsService.type$ === 'register') {
      const index = this.currentRegisterStep$.value.stepIndex;
      if (index < this.stepsRegister$.value.length) {
        this.currentRegisterStep$.next(this.stepsRegister$.value[index]);
      }
    }
    if (StepsService.type$ === 'login') {
      const index = this.currentLoginStep$.value.stepIndex;
      if (index < this.stepsLogin$.value.length) {
        alert(index);
        this.currentLoginStep$.next(this.stepsLogin$.value[index]);
      }
    }
  }

  public moveToPreviousStep(): void {
    // const index = this.currentStep$.value.stepIndex;
    // this.currentStep$.next(this.steps$.value[index - 2]);

    if (StepsService.type$ === 'register') {
      const index = this.currentRegisterStep$.value.stepIndex;
      if (index > 1) {
        this.currentRegisterStep$.next(this.stepsRegister$.value[index - 2]);
      }
    }
    if (StepsService.type$ === 'login') {
      const index = this.currentLoginStep$.value.stepIndex;
      if (index > 1) {
        this.currentLoginStep$.next(this.stepsLogin$.value[index - 2]);
      }
    }
  }

  public isLastStep(): boolean {
    // return this.currentStep$.value.stepIndex === this.steps$.value.length;
    if (StepsService.type$ === 'register') {
      return this.currentRegisterStep$.value.stepIndex === this.stepsRegister$.value.length;
    }
    if (StepsService.type$ === 'login') {
      return this.currentLoginStep$.value.stepIndex === this.stepsLogin$.value.length;
    }
  }

}
