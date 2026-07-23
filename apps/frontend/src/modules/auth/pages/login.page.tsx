import { AuthenticationForm } from '../components/authentication-form.component';
import styles from './login.module.scss';

export const LoginPage = () => {
  return <AuthenticationForm className={styles.form} />;
};
