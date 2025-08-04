import { Routes } from '@angular/router';
import { Login } from './login';
import { ForgotPassword } from './forgotpassword';
import { NewPassword } from './newpassword';
import { LockScreen } from './lockscreen';
import { CommonModule } from '@angular/common';
import { NoAuthGuard } from '../../guards/no-auth.guard';

export default [
    { path: 'login', component: Login, data: { title: 'Login - ISLF' }, canActivate: [NoAuthGuard] },
    { path: 'forgotpassword', component: ForgotPassword, data: { title: 'Forgot Password - ISLF' }, canActivate: [NoAuthGuard] },
    { path: 'newpassword', component: NewPassword, data: { title: 'Set New Password - ISLF' }, canActivate: [NoAuthGuard] },
    { path: 'lockscreen', component: LockScreen, data: { title: 'Lock Screen - ISLF' }, canActivate: [NoAuthGuard] }
] as Routes; 

function component(arg0: { Standalone: boolean; import: (typeof CommonModule)[]; }) {
    throw new Error('Function not implemented.');
}
