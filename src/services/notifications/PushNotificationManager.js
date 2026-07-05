// Push Notification Manager for Capacitor Native & Web Push Banner Simulations
import { DeepLinkHandler } from './DeepLinkHandler';

// Checks native hybrid environments
const isNativePlatform = () => {
  return window.Capacitor && (window.Capacitor.getPlatform() === 'android' || window.Capacitor.getPlatform() === 'ios');
};

export const PushNotificationManager = {
  // Mobile token registration hooks
  initNativePush: async (navigate) => {
    if (!isNativePlatform()) {
      console.log('FCM Push Manager running in Web Browser sandbox Mode');
      return;
    }

    try {
      const { PushNotifications } = window.Capacitor.Plugins;
      if (!PushNotifications) return;

      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permissions denied by system');
        return;
      }

      // Register device tokens
      await PushNotifications.register();

      // Listen for token generation
      PushNotifications.addListener('registration', (token) => {
        console.log('Capacitor Push registration token acquired:', token.value);
        // Persist token in user metadata or device adapter here
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Capacitor Push registration failed:', error);
      });

      // Handle message events while app is open in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Foreground Push received:', notification);
        // Map payload attributes
        PushNotificationManager.showSimulatedBanner({
          title: notification.title,
          message: notification.body,
          metadata: notification.data || {}
        }, navigate);
      });

      // Handle clicking actions on native push banners
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Action performed on push notify:', action);
        const meta = action.notification?.data || {};
        if (meta.item_type) {
          DeepLinkHandler.handleLink(meta, navigate);
        }
      });
    } catch (err) {
      console.warn('Capacitor native push setup bypassed:', err);
    }
  },

  // Renders a high-end simulated push banner at the top of the screen
  showSimulatedBanner: (notification, navigate) => {
    try {
      const existing = document.getElementById('mf-push-banner-container');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.id = 'mf-push-banner-container';
      
      // Inject inline animation stylesheet once
      if (!document.getElementById('mf-push-styles')) {
        const style = document.createElement('style');
        style.id = 'mf-push-styles';
        style.textContent = `
          #mf-push-banner-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            width: 320px;
            background-color: #1E1B4B; /* Sleek Dark Theme */
            color: #FFFFFF;
            border-radius: 14px;
            border: 1px solid rgba(139, 92, 246, 0.4);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            padding: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateX(360px);
            opacity: 0;
          }
          #mf-push-banner-container.show {
            transform: translateX(0);
            opacity: 1;
          }
          #mf-push-banner-container:hover {
            transform: scale(1.02);
            border-color: #8B5CF6;
          }
          .mf-push-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: 700;
            color: #A78BFA;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
          }
          .mf-push-app {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .mf-push-close {
            background: none;
            border: none;
            color: #C084FC;
            font-size: 14px;
            cursor: pointer;
            padding: 2px 6px;
          }
          .mf-push-title {
            font-size: 13.5px;
            font-weight: 600;
            margin-bottom: 2px;
            color: #FFFFFF;
          }
          .mf-push-message {
            font-size: 12px;
            color: #D1D5DB;
            line-height: 1.4;
          }
        `;
        document.head.appendChild(style);
      }

      container.innerHTML = `
        <div class="mf-push-header">
          <div class="mf-push-app">
            <span>📌 MEDIAFLOW</span>
          </div>
          <button class="mf-push-close" id="mf-push-close-btn">&times;</button>
        </div>
        <div class="mf-push-title">${notification.title}</div>
        <div class="mf-push-message">${notification.message}</div>
      `;

      document.body.appendChild(container);

      // Trigger slide-in entry animation
      setTimeout(() => container.classList.add('show'), 50);

      // Setup actions redirect on clicking
      const clickHandler = (e) => {
        if (e.target.id === 'mf-push-close-btn') {
          e.stopPropagation();
          closeBanner(container);
          return;
        }
        closeBanner(container);
        
        // Dynamic router deep linking
        const meta = notification.metadata || {};
        if (navigate) {
          DeepLinkHandler.handleLink(meta, navigate);
        } else {
          // Fallback location dispatch
          if (meta.item_type === 'task') {
            window.location.hash = `#/tasks?id=${meta.item_id}`;
          } else if (meta.item_type === 'idea') {
            window.location.hash = `#/team-hub?tab=ideas&id=${meta.item_id}`;
          } else if (meta.item_type === 'plan') {
            window.location.hash = `#/team-hub?tab=plans&id=${meta.item_id}`;
          } else {
            window.location.hash = `#/notifications`;
          }
        }
      };

      container.addEventListener('click', clickHandler);

      // Auto dismiss banner
      const autoDismiss = setTimeout(() => {
        closeBanner(container);
      }, 5000);

      const closeBanner = (el) => {
        clearTimeout(autoDismiss);
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
      };

    } catch (e) {
      console.warn('Failed to build simulated push banner DOM', e);
    }
  }
};

export default PushNotificationManager;
