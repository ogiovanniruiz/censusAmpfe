import { Component, OnInit } from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {UserService} from '../services/user/user.service'

import { environment } from '../../environments/environment';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  displayMessage = false;
  userMessage: String;

  logo_dir = environment.LOGO_DIR;

  states: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  constructor(private router: Router, private user: UserService) { }

  public cancel(){
    this.router.navigate(['/']);
  }

  public submitRegistration(email: string, password: string, firstName: string, lastName: string, phone: string, password_repeat: string, city: String, state: String, zip: String){
    if (password != password_repeat){
      this.displayMessage = true;
      this.userMessage = "Passwords do not match."
    }
    else if (firstName === "" || lastName === "" || email === ""){
      this.displayMessage = true;
      this.userMessage = "Form is incomplete."

    } else {
      this.user.loginUser(email, password).subscribe(profile=> {
        if(!profile['person']){
          var newUserDetail = {email: email, password: password, 
                               firstName: firstName, 
                               lastName: lastName, 
                               phone: phone,
                               city: city,
                               state: state,
                               zip: zip}
          this.displayMessage =  false;
          this.pushRegistration(newUserDetail);
        }else {
          this.displayMessage = true;
          this.userMessage = "Profile already exists. Please login."
        }
      });
    }
  }

  public pushRegistration(newUserDetail: any){
    this.user.registerUser(newUserDetail).subscribe(      
      (profile: any[])=> {
        this.displayMessage = false;
        localStorage.setItem('userProfile', JSON.stringify(profile['person']));
        this.user.setUserProfile(profile['person'])
        localStorage.setItem('jwt', profile['jwt'])
        this.router.navigate(['/organizations']);
    });
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  ngOnInit() {}

}
