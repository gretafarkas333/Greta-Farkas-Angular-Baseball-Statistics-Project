import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel} from '@angular/material/snack-bar';

@Component({
  selector: 'app-error-popup',
  standalone: true,
  templateUrl: './error-popup.component.html',
  imports: [
    NgIf,
    MatButton,
    MatSnackBarActions,
    MatSnackBarLabel,
    MatSnackBarAction
  ],
  styleUrls: ['./error-popup.component.css']
})
export class ErrorPopupComponent implements OnChanges{

  @Input() message: string | null = null;
  @Output() closed = new EventEmitter<void>();

  ngOnChanges() {
    if (this.message) {
      setTimeout(() => {
        this.close();
      }, 10000);
    }
  }

  close() {
    this.message = null;
    this.closed.emit();
  }
}
