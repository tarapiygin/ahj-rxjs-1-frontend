import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, exhaustMap } from 'rxjs/operators';
import moment from 'moment';

moment.locale('ru');

export default class EmailWidget {
  constructor() {
    this.url = 'https://ahj-rxjs-1-backend.herokuapp.com/messages/unread';
    this.containerEl = document.querySelector('.email-widget');
    this.messageListEl = this.containerEl.querySelector('.message-list');
    this.timestamp = '';
  }

  static renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    messageEl.innerHTML = `
    <div class="message_email">${message.from}</div>
    <div class="message_subject">${message.subject}</div>
    <div class="message_received">${moment(message.received).format('DD.MM.YYYY в hh:mm:ss')}</div>
    `;
    return messageEl;
  }

  onGetMessages() {
    const int$ = interval(3000)
      .pipe(
        exhaustMap(
          () => ajax.getJSON(`${this.url}?timestamp=${this.timestamp}`)
            .pipe(catchError(() => of({
              status: 'ok',
              timestamp: this.timestamp,
              messages: [],
            }))),
        ),
      );
    return int$;
  }

  drawMessages(json) {
    const data = json;
    if (data.status === 'ok' && this.timestamp !== data.timestamp) {
      this.timestamp = data.timestamp;
      data.messages.forEach((message) => {
        const el = EmailWidget.renderMessage(message);
        this.messageListEl.prepend(el);
      });
    }
  }

  registerEvents() {
    this.onGetMessages().subscribe(this.drawMessages.bind(this));
  }
}
