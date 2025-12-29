import { Component, OnInit } from '@angular/core';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for dateClick

import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from "@angular/forms";
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { noOnlyWhitespaceValidator } from "../../../../shared/helpers/custom.validator";
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reservation-time',
  templateUrl: './reservation-time.component.html',
  styleUrls: ["./../reservation-time/reservation-time.component.scss"],
  styles: ['.app-calendar{cursor: pointer;}', '.form-control{background-color: #ffffff;}']
})
export class ReservationTimeComponent implements OnInit {

  seatForm: FormGroup;
  res_id: number
  selectedDate: any = "";
  validRange: any;
  calendarPlugins = [dayGridPlugin, interactionPlugin];
  calendarEvents: EventInput[] = []

  startDate: Date
  endDate: Date

  slotsList: any = []
  // tslint:disable-next-line:max-line-length
  constructor(private route: ActivatedRoute, private _router: Router, private formBuilder: FormBuilder, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private translate: TranslateService) {
    let date = new Date();
    let oneMonthFromdate = new Date(new Date(date).setMonth(date.getMonth() + 1));

    this.startDate = date;
    this.endDate = oneMonthFromdate;

    this.validRange = {
      'start': date,
      'end': oneMonthFromdate
    }
  }

  ngOnInit() {
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));
    //get restaurant detail
    this.spinner.show()
    this.restaurantService.getRestaurant(this.res_id, localStorage.getItem('currentUserId')).subscribe(data => {
      if (data.status == 200) {
        if (data.data.can_edit_reservation != 1) {
          this._router.navigate(['/owner/restaurants/list']);
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('You are not allow to edit ')))
        }
      } else {
        this._router.navigate(['/owner/restaurants/list']);
      }
    },
      err => {
        this._router.navigate(['/owner/restaurants/list']);
      }
    ).add(() => {
      this.spinner.hide()
    })
    this.seatForm = this.formBuilder.group({
      options: this.formBuilder.array([], [Validators.required])
    })

    this.spinner.show()
    //get Reservation time slot
    this.restaurantService.getResTimeSlots(this.res_id).subscribe(
      data => {
        if (data.status) {
          let temp = []
          data.data.forEach(e => {
            temp.push({ title: this.getFormatted(e.title) + " " + e.avail_seat + "seats", start: e.start })
          });

          this.calendarEvents = [...temp]
        }

      }
    ).add(() => {
      this.spinner.hide()
    })

  }

  createOptions() {
    return this.formBuilder.group({
      id: [null],
      timeslot: ['', [Validators.required, noOnlyWhitespaceValidator]],
      seats: ['', [Validators.required]]
    })
  }

  createOptionsEdit(data) {
    return this.formBuilder.group({
      id: [data.id],
      timeslot: [data.slot_time, [Validators.required, noOnlyWhitespaceValidator]],
      seats: [data.seat, [Validators.required]]
    })
  }

  get Options(): FormArray {
    return this.seatForm.get('options') as FormArray;
  }

  addOptions() {
    let fg = this.createOptions();
    this.Options.push(fg);

  }

  handleDateClick(calDate) {
    this.Reset()
    this.selectedDate = calDate.dateStr

    this.spinner.show()
    //get slots of that date
    this.restaurantService.getSlot(this.res_id, calDate.dateStr).subscribe(data => {

      if (data.status) {
        this.Options.push(this.createOptions())
        if (data.data.length > 0) {
          this.slotsList = data.data
        }

      } else {
        this.Reset()
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went Wrong')))
      }
    }, err => {
      Swal.fire(Swaldata.SwalErrorToast(err))
    }
    ).add(() => {
      this.spinner.hide()
    })

  }

  Reset() {
    this.selectedDate = ""
    this.Options.clear();
    this.seatForm.reset()
    this.slotsList = []
  }

  onSubmit() {
    if (!this.seatForm.valid)
      return

    this.spinner.show()
    this.restaurantService.addreservationSlot(this.seatForm.value.options, this.res_id, this.selectedDate).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
          this.seatForm.value.options.forEach(e => {
            this.calendarEvents = [...this.calendarEvents, { title: this.getFormatted(e.timeslot) + " " + e.seats + "seats", start: this.selectedDate }]
          });
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {

      this.spinner.hide()
      this.Reset()
    })
  }

  getFormatted(time) {
    let timeArray = time.split(':'); // convert to array
    let timeValue = ""

    // fetch
    var hours = Number(timeArray[0]);
    var minutes = Number(timeArray[1]);


    if (hours > 0 && hours <= 12) {
      timeValue = "" + hours;
    } else if (hours > 12) {
      timeValue = "" + (hours - 12);
    } else if (hours == 0) {
      timeValue = "12";
    }

    timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
    timeValue += (hours >= 12) ? " P.M." : " A.M.";  // get AM/PM

    return timeValue;
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this._router.navigate(['owner', 'restaurants', 'list']);
  }
}
