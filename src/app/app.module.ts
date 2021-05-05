import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { JQ_TOKEN } from './services/jquery.service';
import { MainStreamComponent } from './main-stream/main-stream.component';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { ProfileComponent } from './profile/profile.component';
import { RoomsComponent } from './rooms/rooms.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducers';
import { RtcService } from './main-stream/rtc.service';

// declare global {
//   interface Window { MyNamespace: any; }
// }

// window.MyNamespace = window.MyNamespace || {};
// interface Window {
//   [key:string]: any; // Add index signature
// }

// const jQuery = window['$'];
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainStreamComponent,
    SignupComponent,
    SigninComponent,
    ProfileComponent,
    RoomsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {}),
    HttpClientModule,
  ],
  providers: [RtcService],
  bootstrap: [AppComponent]
})
export class AppModule { }
