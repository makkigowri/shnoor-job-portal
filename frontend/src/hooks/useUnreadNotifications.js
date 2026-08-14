import { useEffect, useState } from "react";
import { getMyNotifications } from "../services/notificationService";
export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getMyNotifications();
        if (isMounted) setUnreadCount(data.unreadCount || 0);
      } catch (err) {
      }
    };
    load();
    const intervalId = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return unreadCount;
};
export default useUnreadNotifications;
