import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EmailService } from '../../../shared/services/email.service';
import { Subscription } from 'rxjs';
import { PopupService } from '../../../shared/services/popup.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  providers: [PopupService],
})
export class ContactComponent implements OnInit, OnDestroy {
  contactForm!: FormGroup;

  showPopup = false;
  message: string | null = null;
  private subscription = new Subscription();

  constructor(
    private emailService: EmailService,
    public popupService: PopupService,
    private fb: FormBuilder,
  ) {}

  showMessage(message: string): void {
    this.popupService.showMessage(message);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.popupService.showPopup$.subscribe((showPopup) => {
        this.showPopup = showPopup;
      })
    );
    this.subscription.add(
      this.popupService.message$.subscribe((message) => {
        this.message = message;
      })
    );
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      form_message: ['', Validators.required]
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    console.log("HELLO");
    

    if (this.contactForm.invalid) {
      this.showMessage('Something is wrong');
      return;
    }

    const formData = this.contactForm.value;

    this.emailService.sendEmail(formData).subscribe(
      (response) => {
        this.showMessage('Hello!');
      },
      (error) => {
        this.showMessage('Your form was not submitted. Please try again.');
      }
    );
  }
}

