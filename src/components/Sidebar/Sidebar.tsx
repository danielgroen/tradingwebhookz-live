import { LoginForm, Header, SettingsForm, OrderForm } from '@components/index';
import { GlobalState } from '@states/index';

export const Sidebar = () => {
  const { isLoggedIn, isSettingsOpen } = GlobalState();

  return (
    <div className="flex flex-col h-[100%]">
      <Header />
      {!isLoggedIn ? <LoginForm /> : <>{isSettingsOpen ? <SettingsForm /> : <OrderForm />}</>}
    </div>
  );
};
