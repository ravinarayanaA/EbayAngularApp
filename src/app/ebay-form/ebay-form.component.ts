import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn, FormArray, FormControl,
} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

let errorflag = false;

const priceValidator: ValidatorFn = (fg: FormGroup) => {
  const start = parseFloat(fg.get('price_lower').value);
  const end = parseFloat(fg.get('price_upper').value);
  let finalflag;


  finalflag = {range: true};
  if (start !== null) {
    if (start < 0) {
      errorflag = true;
      return finalflag;
    }
  }
  if (end !== null) {
    if (end < 0) {
      errorflag = true;
      return finalflag;
    }
  }
  if (start === null || end == null) {
    return null;
  }
  if (start < end || start === end) {
    return null;
  }
  if (start > end) {
    errorflag = true;
    return finalflag;
  }
};


@Component({
  selector: 'ebay-form',
  templateUrl: './ebay-form.component.html',
  styleUrls: ['./ebay-form.component.css']
})

export class EbayFormComponent implements OnInit {
  submitted = false;
  registered = false;
  resetflag = false;
  params = new URLSearchParams();
  keyword: string;
  items: Array<any>;
  userForm: FormGroup;
  numresults: number;
  p1 = 1;
  p2 = 1;

  public conditions: any = [
    {description: 'New', value: 'New'},
    {description: 'Used', value: 'Used'},
    {description: 'Very Good', value: 'Very good'},
    {description: 'Good', value: 'Good'},
    {description: 'Acceptable', value: 'Acceptable'}
  ];
  public returnAccepted: any = [
    {description: 'Return accepted', value: 'Return accepted'},
  ];
  public shipping: any = [
    {description: 'Free', value: 'Free'},
    {description: 'Expedited', value: 'Expedited'},
  ];

  onCheckChange(event) {
    const formArray: FormArray = this.userForm.get(event.target.classList[1]) as FormArray;

    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      let i = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value === event.target.value) {
          formArray.removeAt(i);
          return;
        }

        i++;
      });
    }
  }

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) {
  }

  get_error_flag() {

    return errorflag;
  }

  invalidkeyword() {
    if (this.submitted && this.userForm.controls.keyword.errors != null) {
      errorflag = true;
    }
    return (this.submitted && this.userForm.controls.keyword.errors != null);
  }

  invalidPrice() {
    return (this.submitted && this.userForm.controls.last_name.errors != null);
  }

  reset_form(ref: HTMLFormElement) {
    ref.reset();
    this.resetflag = true;
    errorflag = true;
    return;
  }

  hide_tab(event) {
    if (event.target.innerHTML === 'Hide Details') {
      document.getElementById('tab_' + event.target.id).classList.add('d-none');
      event.target.innerHTML = 'Show Details';
    } else {
      event.target.innerHTML = 'Hide Details';
      document.getElementById('tab_' + event.target.id).classList.remove('d-none');
    }
  }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      keyword: ['', Validators.required],
      price_lower: [null],
      price_upper: [null],
      condition: new FormArray([]),
      seller: new FormArray([]),
      shipping: new FormArray([]),
      sortorder: [null]
    }, {validators: priceValidator});
  }

  onSubmit() {
    this.registered = false;
    errorflag = false;
    this.submitted = true;
    this.resetflag = false;
    this.params = new URLSearchParams();
    if (this.userForm.invalid === true) {
      return;
    } else {
      errorflag = false;
      const formValue = this.userForm.value;
      for (const key in formValue) {
        this.params.append(key, formValue[key]);
      }
    }
    console.log('http://localhost:3000/api/get_data/?' + this.params.toString());
    this.http.get('http://localhost:3000/api/get_data/?' + this.params.toString()).subscribe((data: any) => {
      // this.items = Array(data.items.length).fill(0).map((x, i) => ({id: (i + 1), item: data.items[i]}));
      this.items = data.items;
      this.keyword = data.keyword;
      this.numresults = data.items.length;
      this.registered = true;
      this.p1 = 1;
      this.p2 = 1;
    }, error => {
      console.log('There was an error on the server', error);
    });
  }

}

