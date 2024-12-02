import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {}

  ngOnInit() {
    this.lightDarkMode();
  }

  lightDarkMode() {
    const tema = localStorage.getItem('theme');
    if (tema === 'dark') {
      document.documentElement.style.setProperty('--lightDark-BgColor', 'rgba(0, 0, 0, 0.9)');
      document.documentElement.style.setProperty('--lightDark-color', 'white');
      document.documentElement.style.setProperty('--lightDark-shadow', 'rgba(255, 255, 255, 0.482)');
      document.documentElement.style.setProperty('--lightDark-tabsIcon', 'white');
    }else{
      document.documentElement.style.setProperty('--lightDark-BgColor', 'white');
      document.documentElement.style.setProperty('--lightDark-color', 'black');
      document.documentElement.style.setProperty('--lightDark-shadow', 'rgba(0, 0, 0, 0.482)');
      document.documentElement.style.setProperty('--lightDark-tabsIcon', '#595959');
    }
  }

  toggle_lightDarkMode() {
    const tema = localStorage.getItem('theme');
    if (tema === 'dark') {
      localStorage.setItem('theme', 'light');
    }else{
      localStorage.setItem('theme', 'dark');
    }
    this.lightDarkMode();
  }
}
