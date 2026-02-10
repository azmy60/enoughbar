import Notifd from 'gi://AstalNotifd';

export type AppContext = {
    pushNotification: (notification: Notifd.Notification) => void;
};
