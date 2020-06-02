import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ZoomMtg } from '@zoomus/websdk';

ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {

  public signatureEndpoint = 'https://augmedix-zoom-sdk-signature.herokuapp.com/';
  public apiKey = 'Oh8hAtPlQZO80fUljW6U_g';
  public meetingNumber: number;
  public role = 0;
  public leaveUrl = 'https://augmedix-zoom-angular.herokuapp.com/';
  public userName = 'AugmedixDemoUser';
  public userEmail = '';
  public passWord: any = '';

  public form: FormGroup;
  public isSubmitted = false;

  constructor(
    public httpClient: HttpClient,
    @Inject(DOCUMENT) document,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit() {
    const urlParams = new URLSearchParams(window.location.search);

    const meetingId = urlParams.get('meetingId');
    const meetingPass = urlParams.get('meetingPass');

    if (meetingId && meetingPass) {
      this.joinMeeting(meetingId, meetingPass);
    }
  }

  initForm() {
    this.form = this.formBuilder.group({
      meetingId: ['', Validators.required],
      meetingPass: ['', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.isSubmitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
        return;
    }

    const { meetingId, meetingPass } = this.form.value;

    this.joinMeeting(meetingId, meetingPass);
  }

  async joinMeeting(meetingId: any, meetingPass: any) {
    document.getElementById('cta').innerHTML = 'Joining... (Please wait)';

    this.meetingNumber = meetingId;
    this.passWord = meetingPass;

    const signature = await this.getSignature();

    this.startMeeting(signature);
  }

  getSignature(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(this.signatureEndpoint, {
        meetingNumber: this.meetingNumber,
        role: this.role
      }).toPromise().then((data: any) => {
        if (data.signature) {
          resolve(data.signature);
        } else {
          reject(data);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }

  startMeeting(signature: string) {
    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      isSupportAV: true,
      success: (success: any) => {
        ZoomMtg.join({
          signature,
          meetingNumber: this.meetingNumber,
          userName: this.userName,
          apiKey: this.apiKey,
          userEmail: this.userEmail,
          passWord: this.passWord,
          success: (s: any) => {
            console.log(s);
          },
          error: (error: any) => {
            console.log(error);
          }
        });

      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }
}
